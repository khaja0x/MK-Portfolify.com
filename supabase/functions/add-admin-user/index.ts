import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js";
import { z } from "https://esm.sh/zod@3.22.4";
import { corsHeaders, errorResponse, checkRateLimit, getClientIP } from "../_shared/security.ts";

const addAdminSchema = z.object({
    tenant_slug: z.string().min(1),
    role: z.string().default('owner'),
});

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseServiceKey) {
            return errorResponse("Missing environment variables", 500);
        }

        if (req.method !== "POST") {
            return errorResponse("Method not allowed", 405);
        }

        const authHeader = req.headers.get("authorization") || "";
        if (!authHeader.startsWith("Bearer ")) {
            return errorResponse("Missing or invalid Authorization header", 401);
        }

        const userToken = authHeader.replace("Bearer ", "");
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const clientIP = getClientIP(req);

        // Rate Limiting: 10 attempts per 10 minutes
        const { allowed } = await checkRateLimit(
            supabase,
            `add_admin_${clientIP}`,
            10,
            600000
        );

        if (!allowed) {
            return errorResponse("Too many requests", 429);
        }

        const body = await req.json().catch(() => ({}));
        const result = addAdminSchema.safeParse(body);

        if (!result.success) {
            return errorResponse(`Validation failed: ${result.error.errors.map(e => e.message).join(', ')}`, 400);
        }

        const { tenant_slug, role } = result.data;

        // Verify token
        const { data: userData, error: userError } = await supabase.auth.getUser(userToken);
        if (userError || !userData?.user) {
            return errorResponse("Invalid or expired token", 401);
        }
        const user_id = userData.user.id;

        // Look up tenant
        const { data: tenant, error: tenantError } = await supabase
            .from("tenants")
            .select("id")
            .eq("tenant_id", tenant_slug)
            .maybeSingle();

        if (tenantError) throw tenantError;
        if (!tenant) {
            return errorResponse(`Tenant '${tenant_slug}' not found`, 404);
        }

        // Link user
        const { data, error: insError } = await supabase
            .from("admin_users")
            .upsert({
                user_id,
                tenant_id: tenant.id,
                role: role.trim()
            }, { onConflict: 'user_id,tenant_id' })
            .select()
            .single();

        if (insError) throw insError;

        return new Response(JSON.stringify({ ok: true, data }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err: any) {
        console.error("Add Admin User Error:", err.message);
        return errorResponse(err.message, 500);
    }
});

