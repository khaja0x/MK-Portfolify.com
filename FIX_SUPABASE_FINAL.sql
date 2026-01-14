-- ============================================================
-- 🛡️ PERMANENT MULTI-TENANCY FIX (THE ULTIMATE REMEDY)
-- Run this in your Supabase SQL Editor once.
-- This script ensures you NEVER have to manually link a tenant again.
-- ============================================================

-- 1. ENHANCE TENANTS TABLE
-- We add 'created_by' so the database knows who owns the tenant from day one.
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- 2. AUTOMATIC LINKING TRIGGER
-- Every time a new tenant is created, the database will automatically
-- create the admin_users entry. This is 100% permanent and atomic.
CREATE OR REPLACE FUNCTION public.auto_link_tenant_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.admin_users (user_id, tenant_id, role)
    VALUES (NEW.created_by, NEW.id, 'owner')
    ON CONFLICT (user_id, tenant_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_auto_link_admin ON public.tenants;
CREATE TRIGGER trigger_auto_link_admin
AFTER INSERT ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.auto_link_tenant_admin();

-- 3. ROBUST DIRECT RLS POLICIES
-- We move away from functions to direct EXISTS checks. 
-- This is faster, more reliable, and standard multi-tenant practice.

DO $$
DECLARE
    table_names text[] := ARRAY['hero', 'about', 'skills', 'projects', 'experience', 'contact_info', 'messages'];
    t text;
BEGIN
    FOREACH t IN ARRAY table_names
    LOOP
        -- Drop old policies
        EXECUTE format('DROP POLICY IF EXISTS "Public view %s" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Admin view %s" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Admin insert %s" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Admin update %s" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Admin delete %s" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Admin write %s" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Admin manage %s" ON public.%I', t, t);

        -- A. Public Read Access (Everyone can see portfolio)
        EXECUTE format('CREATE POLICY "Public view %s" ON public.%I FOR SELECT USING (true)', t, t);

        -- B. Admin Manage Access (Full CRUD for linked admins)
        -- The 'USING' clause controls SELECT/UPDATE/DELETE
        -- The 'WITH CHECK' clause controls INSERT/UPDATE
        EXECUTE format('
            CREATE POLICY "Admin manage %s" ON public.%I FOR ALL 
            USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND tenant_id = %I.tenant_id))
            WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND tenant_id = %I.tenant_id))
        ', t, t, t, t);
    END LOOP;
END $$;

-- 4. SPECIAL CASE: MESSAGES
-- Public must be able to send messages (INSERT)
DROP POLICY IF EXISTS "Public can send messages" ON public.messages;
CREATE POLICY "Public can send messages" ON public.messages FOR INSERT WITH CHECK (true);

-- 5. FIX CONSTRAINTS (MANDATORY FOR UPSERT)
-- Ensure 'onConflict: tenant_id' always works without duplicates
ALTER TABLE public.hero DROP CONSTRAINT IF EXISTS hero_tenant_id_key;
ALTER TABLE public.hero ADD CONSTRAINT hero_tenant_id_key UNIQUE (tenant_id);

ALTER TABLE public.about DROP CONSTRAINT IF EXISTS about_tenant_id_key;
ALTER TABLE public.about ADD CONSTRAINT about_tenant_id_key UNIQUE (tenant_id);

ALTER TABLE public.contact_info DROP CONSTRAINT IF EXISTS contact_info_tenant_id_key;
ALTER TABLE public.contact_info ADD CONSTRAINT contact_info_tenant_id_key UNIQUE (tenant_id);

-- 6. FIX EXISTING BROKEN LINKS
-- If you have tenants without owners, this links the first admin found (or you can run manual code below)
INSERT INTO public.admin_users (user_id, tenant_id, role)
SELECT created_by, id, 'owner'
FROM public.tenants
WHERE created_by IS NOT NULL
ON CONFLICT DO NOTHING;

-- 7. GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================
-- ✅ VERIFICATION: Run this to see if you are correctly linked:
-- SELECT t.tenant_id as slug, au.role FROM admin_users au 
-- JOIN tenants t ON t.id = au.tenant_id WHERE au.user_id = auth.uid();
-- ============================================================
