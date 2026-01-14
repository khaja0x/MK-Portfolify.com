import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js";
import { z } from "https://esm.sh/zod@3.22.4";
import { corsHeaders, errorResponse, checkRateLimit, getClientIP } from "../_shared/security.ts";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantId: z.string().optional(),
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const action = pathParts.pop();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse('Missing environment variables', 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const clientIP = getClientIP(req);

    if (action === 'login' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const result = loginSchema.safeParse(body);

      if (!result.success) {
        return errorResponse(`Validation failed: ${result.error.errors.map(e => e.message).join(', ')}`, 400);
      }

      const { email, password, tenantId } = result.data;

      // Rate Limiting: 10 login attempts per 10 minutes per IP
      const { allowed } = await checkRateLimit(
        supabase,
        `login_${clientIP}`,
        10,
        600000
      );

      if (!allowed) {
        return errorResponse('Too many login attempts. Please try again later.', 429);
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return errorResponse(authError.message, 401);
      }

      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select(`
          tenant_id,
          role,
          tenants:tenant_id (
            id,
            tenant_id,
            name,
            logo_url,
            theme_config
          )
        `)
        .eq('user_id', authData.user.id);

      if (adminError || !adminUsers || adminUsers.length === 0) {
        await supabase.auth.signOut();
        return errorResponse('User is not associated with any tenant', 403);
      }

      if (tenantId) {
        const hasAccess = adminUsers.some((au: any) => au.tenants && au.tenants.tenant_id === tenantId);
        if (!hasAccess) {
          await supabase.auth.signOut();
          return errorResponse('Access denied to this tenant', 403);
        }
      }

      return new Response(
        JSON.stringify({
          message: 'Login successful',
          session: authData.session,
          user: authData.user,
          tenants: adminUsers.map((au: any) => ({
            tenantId: au.tenants?.tenant_id,
            name: au.tenants?.name,
            role: au.role,
            logoUrl: au.tenants?.logo_url,
            themeConfig: au.tenants?.theme_config,
          })),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'me' && req.method === 'GET') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) return errorResponse('Unauthorized', 401);

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) return errorResponse('Invalid token', 401);

      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select(`
          tenant_id,
          role,
          tenants:tenant_id (
            id,
            tenant_id,
            name,
            logo_url,
            theme_config
          )
        `)
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({
          user: { id: user.id, email: user.email },
          tenants: adminUsers?.map((au: any) => ({
            tenantId: au.tenants?.tenant_id,
            name: au.tenants?.name,
            role: au.role,
            logoUrl: au.tenants?.logo_url,
            themeConfig: au.tenants?.theme_config,
          })) || [],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'logout' && req.method === 'POST') {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        await supabase.auth.admin.signOut(token);
      }
      return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return errorResponse('Not Found', 404);

  } catch (err: unknown) {
    const error = err as Error;
    console.error('Auth Handler Error:', error.message);
    return errorResponse(error.message, 500);
  }
});

