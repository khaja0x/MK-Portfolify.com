-- Rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0,
    reset_at TIMESTAMPTZ NOT NULL
);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key TEXT,
    p_limit INTEGER,
    p_window_ms INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
    v_reset_at TIMESTAMPTZ;
    v_now TIMESTAMPTZ := now();
BEGIN
    -- Get current count and reset time
    SELECT count, reset_at INTO v_count, v_reset_at
    FROM public.rate_limits
    WHERE key = p_key;

    -- If no entry or expired, reset
    IF v_count IS NULL OR v_now > v_reset_at THEN
        v_count := 1;
        v_reset_at := v_now + (p_window_ms || ' milliseconds')::interval;
        
        INSERT INTO public.rate_limits (key, count, reset_at)
        VALUES (p_key, v_count, v_reset_at)
        ON CONFLICT (key) DO UPDATE
        SET count = EXCLUDED.count,
            reset_at = EXCLUDED.reset_at;
            
        RETURN jsonb_build_object('allowed', true, 'remaining', p_limit - v_count);
    END IF;

    -- If within window, increment if below limit
    IF v_count < p_limit THEN
        v_count := v_count + 1;
        UPDATE public.rate_limits
        SET count = v_count
        WHERE key = p_key;
        
        RETURN jsonb_build_object('allowed', true, 'remaining', p_limit - v_count);
    ELSE
        RETURN jsonb_build_object('allowed', false, 'remaining', 0);
    END IF;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO authenticated;
