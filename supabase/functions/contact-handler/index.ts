import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js";
import { z } from "https://esm.sh/zod@3.22.4";
import { corsHeaders, errorResponse, checkRateLimit, getClientIP } from "../_shared/security.ts";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(100),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
  tenant_id: z.string().min(1)
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const id = segments.length > 3 ? segments[3] : null;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse('Missing environment variables', 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const clientIP = getClientIP(req);

    // Rate Limiting: 5 requests per 10 minutes per IP for contact submissions
    if (req.method === 'POST') {
      const { allowed, remaining } = await checkRateLimit(
        supabase,
        `contact_post_${clientIP}`,
        5,
        600000
      );

      if (!allowed) {
        return errorResponse('Too many requests. Please try again later.', 429);
      }

      const body = await req.json().catch(() => ({}));
      const result = contactSchema.safeParse(body);

      if (!result.success) {
        return errorResponse(`Validation failed: ${result.error.errors.map(e => e.message).join(', ')}`, 400);
      }

      const { name, email, subject, message, tenant_id: tenantIdentifier } = result.data;

      // Resolve tenant slug to ID if needed
      let resolvedTenantId = tenantIdentifier;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantIdentifier);

      if (!isUUID) {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('id')
          .eq('tenant_id', tenantIdentifier)
          .maybeSingle();

        if (!tenant) return errorResponse('Tenant not found', 404);
        resolvedTenantId = tenant.id;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          name: name.trim(),
          email: email.toLowerCase().trim(),
          subject: subject.trim(),
          message: message.trim(),
          tenant_id: resolvedTenantId
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET, PATCH, DELETE should be authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return errorResponse('Unauthorized', 401);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return errorResponse('Invalid token', 401);

    if (req.method === 'GET') {
      const tenantId = url.searchParams.get('tenantId');
      if (!tenantId) return errorResponse('Tenant ID is required', 400);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'PATCH' && id) {
      const { is_read } = await req.json();
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, message: 'Deleted successfully' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return errorResponse('Method Not Allowed', 405);

  } catch (err: unknown) {
    const error = err as Error;
    console.error('Contact Handler Error:', error);
    return errorResponse(error.message, 500);
  }
});

