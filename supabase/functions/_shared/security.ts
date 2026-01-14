import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { z } from "https://esm.sh/zod@3.22.4";

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Handles error responses in a consistent format
 */
export const errorResponse = (message: string, status = 400) => {
    return new Response(
        JSON.stringify({ error: message }),
        {
            status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
    );
};

/**
 * Validates request body against a Zod schema
 */
export const validateBody = async <T>(req: Request, schema: z.Schema<T>): Promise<{ data?: T; error?: string }> => {
    try {
        const body = await req.json();
        const result = schema.safeParse(body);
        if (!result.success) {
            const errorMsg = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return { error: `Validation failed: ${errorMsg}` };
        }
        return { data: result.data };
    } catch (err) {
        return { error: "Invalid JSON body" };
    }
};

/**
 * Simple rate limiting using Supabase DB
 * key: usually a combination of IP/UserID and endpoint
 * limit: max requests
 * windowMs: time window in milliseconds
 */
export const checkRateLimit = async (
    supabase: any,
    key: string,
    limit: number = 20,
    windowMs: number = 60000 // 1 minute default
): Promise<{ allowed: boolean; remaining: number }> => {
    const now = new Date();

    // Clean up expired entries (Optional but good for DB health)
    // await supabase.from('rate_limits').delete().lt('reset_at', now.toISOString());

    const { data, error } = await supabase
        .rpc('check_rate_limit', {
            p_key: key,
            p_limit: limit,
            p_window_ms: windowMs
        });

    if (error) {
        console.error('Rate limit error:', error);
        // Fail open if rate limit check fails to avoid blocking users, or fail closed?
        // Hardening suggests failing closed or at least logging.
        return { allowed: true, remaining: 1 };
    }

    return {
        allowed: data.allowed,
        remaining: data.remaining
    };
};

/**
 * Get client IP address
 */
export const getClientIP = (req: Request) => {
    return req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
};
