import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js";
import { z } from "https://esm.sh/zod@3.22.4";
import { corsHeaders, errorResponse, checkRateLimit, getClientIP } from "../_shared/security.ts";

const registerSchema = z.object({
  tenantName: z.string().min(2).max(100),
  tenantId: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  adminEmail: z.string().email().max(100),
  password: z.string().min(8).max(100),
  logo: z.string().url().max(500).optional(),
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse('Missing environment variables', 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const clientIP = getClientIP(req);

    // Strict Rate Limiting: 3 registrations per hour per IP
    const { allowed } = await checkRateLimit(
      supabase,
      `register_${clientIP}`,
      3,
      3600000
    );

    if (!allowed) {
      return errorResponse('Too many registration attempts. Please try again after an hour.', 429);
    }

    const body = await req.json().catch(() => ({}));
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(`Validation failed: ${result.error.errors.map(e => e.message).join(', ')}`, 400);
    }

    const { tenantName, tenantId, adminEmail, password, logo } = result.data;

    // Check if tenant ID is already taken
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (existingTenant) {
      return errorResponse('Tenant ID already taken', 409);
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: password,
      email_confirm: true,
    });

    if (authError) {
      return errorResponse(authError.message, 400);
    }

    const userId = authData.user.id;

    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        tenant_id: tenantId,
        name: tenantName.trim(),
        logo_url: logo || null,
        is_active: true,
        created_by: userId,
      })
      .select()
      .single();

    if (tenantError) {
      await supabase.auth.admin.deleteUser(userId);
      return errorResponse('Failed to create tenant record', 500);
    }

    // Link admin user
    const { error: adminUserError } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        tenant_id: tenant.id,
        role: 'owner',
      });

    if (adminUserError) {
      await supabase.from('tenants').delete().eq('id', tenant.id);
      await supabase.auth.admin.deleteUser(userId);
      return errorResponse('Failed to link admin user', 500);
    }

    // Auto sign in
    const { data: sessionData } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: password,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registration successful',
        tenant: {
          id: tenant.id,
          tenantId: tenant.tenant_id,
          name: tenant.name,
          logoUrl: tenant.logo_url,
        },
        session: sessionData?.session,
        user: sessionData?.user,
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    const error = err as Error;
    console.error('Registration Error:', error.message);
    return errorResponse(error.message, 500);
  }
});

