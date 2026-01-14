import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js";
import { z } from "https://esm.sh/zod@3.22.4";
import { corsHeaders, errorResponse, checkRateLimit, getClientIP } from "../_shared/security.ts";

const updateTenantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  logoUrl: z.string().url().max(500).optional(),
  logo: z.string().url().max(500).optional(),
  themeConfig: z.record(z.any()).optional(),
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const lookupIndex = pathSegments.indexOf('tenant-lookup');

    if (lookupIndex === -1) {
      return errorResponse('Invalid function path', 400);
    }

    const subPath = pathSegments.slice(lookupIndex + 1);
    const isCheckAvailability = subPath[0] === 'check-availability';
    const rawId = isCheckAvailability ? subPath[1] : subPath[0];
    const id = rawId?.toLowerCase()?.trim();

    if (!id) {
      return errorResponse('Missing tenant identifier', 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse('Missing environment variables', 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const clientIP = getClientIP(req);

    // Rate Limiting for public GET requests: 30 requests per minute
    if (req.method === 'GET') {
      const { allowed } = await checkRateLimit(
        supabase,
        `tenant_get_${clientIP}`,
        30,
        60000
      );

      if (!allowed) {
        return errorResponse('Too many requests', 429);
      }

      if (isCheckAvailability) {
        const { data } = await supabase
          .from('tenants')
          .select('id')
          .eq('tenant_id', id)
          .maybeSingle();

        return new Response(JSON.stringify({ available: !data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('id, tenant_id, name, logo_url, theme_config, is_active')
        .eq('tenant_id', id)
        .maybeSingle();

      if (error) throw error;
      if (!tenant) return errorResponse('Tenant not found', 404);
      if (!tenant.is_active) return errorResponse('Tenant is inactive', 403);

      return new Response(JSON.stringify({ tenant }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'PUT') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) return errorResponse('Unauthorized', 401);

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) return errorResponse('Invalid token', 401);

      // Find tenant UUID from slug
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('tenant_id', id)
        .maybeSingle();

      if (!tenant) return errorResponse('Tenant not found', 404);

      // Check access
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('tenant_id', tenant.id)
        .maybeSingle();

      if (!adminUser) return errorResponse('Access denied', 403);

      const body = await req.json().catch(() => ({}));
      const result = updateTenantSchema.safeParse(body);

      if (!result.success) {
        return errorResponse(`Validation failed: ${result.error.errors.map(e => e.message).join(', ')}`, 400);
      }

      const updateData: any = {};
      if (result.data.name) updateData.name = result.data.name.trim();
      if (result.data.logoUrl) updateData.logo_url = result.data.logoUrl;
      if (result.data.logo) updateData.logo_url = result.data.logo;
      if (result.data.themeConfig) updateData.theme_config = result.data.themeConfig;

      if (Object.keys(updateData).length === 0) {
        return errorResponse('No valid fields to update', 400);
      }

      const { data: updatedTenant, error: updateError } = await supabase
        .from('tenants')
        .update(updateData)
        .eq('id', tenant.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return new Response(JSON.stringify({
        message: 'Tenant updated successfully',
        tenant: updatedTenant
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return errorResponse('Method Not Allowed', 405);

  } catch (err: unknown) {
    const error = err as Error;
    console.error('Tenant Lookup Error:', error.message);
    return errorResponse(error.message, 500);
  }
});


