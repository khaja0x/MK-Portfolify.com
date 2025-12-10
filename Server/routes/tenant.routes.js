import express from 'express';
import { supabaseAdmin, supabase } from '../utils/supabase.js';

const router = express.Router();

/**
 * POST /api/tenants/register
 * Register a new tenant with admin user
 * Body: { tenantName, tenantId, adminEmail, password, logo }
 */
router.post('/register', async (req, res) => {
    try {
        const { tenantName, tenantId, adminEmail, password, logo } = req.body;

        // Validation
        if (!tenantName || !tenantId || !adminEmail || !password) {
            return res.status(400).json({
                error: 'Missing required fields: tenantName, tenantId, adminEmail, password'
            });
        }

        // Validate tenant ID format (lowercase, alphanumeric, hyphens only)
        const tenantIdRegex = /^[a-z0-9-]+$/;
        if (!tenantIdRegex.test(tenantId)) {
            return res.status(400).json({
                error: 'Tenant ID must contain only lowercase letters, numbers, and hyphens'
            });
        }

        if (tenantId.length < 3 || tenantId.length > 50) {
            return res.status(400).json({
                error: 'Tenant ID must be between 3 and 50 characters'
            });
        }

        // Check if tenant ID is already taken
        const { data: existingTenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('tenant_id', tenantId)
            .single();

        if (existingTenant) {
            return res.status(409).json({
                error: 'Tenant ID already taken. Please choose another.'
            });
        }

        // Create auth user (admin)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: password,
            email_confirm: true, // Auto-confirm email for now
        });

        if (authError) {
            console.error('Auth error:', authError);
            return res.status(400).json({
                error: authError.message || 'Failed to create admin user'
            });
        }

        const userId = authData.user.id;

        // Create tenant (use supabaseAdmin to bypass RLS)
        const { data: tenant, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .insert({
                tenant_id: tenantId,
                name: tenantName,
                logo_url: logo || null,
                is_active: true,
            })
            .select()
            .single();

        if (tenantError) {
            console.error('Tenant creation error:', tenantError);
            // Rollback: delete the auth user
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return res.status(500).json({
                error: 'Failed to create tenant. Please try again.'
            });
        }

        // Link admin user to tenant (use supabaseAdmin to bypass RLS)
        const { error: adminUserError } = await supabaseAdmin
            .from('admin_users')
            .insert({
                user_id: userId,
                tenant_id: tenant.id,
                role: 'owner', // First user is the owner
            });

        if (adminUserError) {
            console.error('Admin user link error:', adminUserError);
            // Rollback: delete tenant and auth user
            await supabaseAdmin.from('tenants').delete().eq('id', tenant.id);
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return res.status(500).json({
                error: 'Failed to link admin user. Please try again.'
            });
        }

        // Sign in the user to get session token
        const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: password,
        });

        if (signInError) {
            console.error('Sign in error:', signInError);
            // Don't rollback here, user is created successfully
            return res.status(201).json({
                message: 'Tenant created successfully. Please log in.',
                tenant: {
                    id: tenant.id,
                    tenantId: tenant.tenant_id,
                    name: tenant.name,
                },
            });
        }

        // Success!
        res.status(201).json({
            message: 'Tenant and admin user created successfully',
            tenant: {
                id: tenant.id,
                tenantId: tenant.tenant_id,
                name: tenant.name,
                logoUrl: tenant.logo_url,
            },
            session: sessionData.session,
            user: sessionData.user,
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Internal server error during registration'
        });
    }
});

/**
 * GET /api/tenants/check-availability/:tenantId
 * Check if a tenant ID is available
 */
router.get('/check-availability/:tenantId', async (req, res) => {
    try {
        const { tenantId } = req.params;

        // Validate format
        const tenantIdRegex = /^[a-z0-9-]+$/;
        if (!tenantIdRegex.test(tenantId)) {
            return res.json({
                available: false,
                reason: 'Invalid format. Use only lowercase letters, numbers, and hyphens.'
            });
        }

        if (tenantId.length < 3 || tenantId.length > 50) {
            return res.json({
                available: false,
                reason: 'Must be between 3 and 50 characters.'
            });
        }

        // Reserved tenant IDs
        const reserved = ['admin', 'api', 'www', 'app', 'dashboard', 'login', 'register', 'default'];
        if (reserved.includes(tenantId)) {
            return res.json({
                available: false,
                reason: 'This ID is reserved.'
            });
        }

        // Check database
        const { data } = await supabase
            .from('tenants')
            .select('id')
            .eq('tenant_id', tenantId)
            .single();

        res.json({
            available: !data,
            reason: data ? 'This ID is already taken.' : null
        });

    } catch (error) {
        console.error('Availability check error:', error);
        res.status(500).json({ error: 'Failed to check availability' });
    }
});

/**
 * GET /api/tenants/:tenantId
 * Get tenant information by tenant ID
 */
router.get('/:tenantId', async (req, res) => {
    try {
        const { tenantId } = req.params;

        const { data: tenant, error } = await supabase
            .from('tenants')
            .select('id, tenant_id, name, logo_url, theme_config, is_active')
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .single();

        if (error || !tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        res.json({ tenant });

    } catch (error) {
        console.error('Get tenant error:', error);
        res.status(500).json({ error: 'Failed to fetch tenant' });
    }
});

/**
 * PUT /api/tenants/:tenantId
 * Update tenant settings (requires authentication)
 */
router.put('/:tenantId', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { name, logoUrl, themeConfig } = req.body;

        // Get auth token from header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get tenant
        const { data: tenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('tenant_id', tenantId)
            .single();

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Check if user has access to this tenant
        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', user.id)
            .eq('tenant_id', tenant.id)
            .single();

        if (!adminUser) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Update tenant
        const updateData = {};
        if (name) updateData.name = name;
        if (logoUrl !== undefined) updateData.logo_url = logoUrl;
        if (themeConfig) updateData.theme_config = themeConfig;
        updateData.updated_at = new Date().toISOString();

        const { data: updatedTenant, error: updateError } = await supabase
            .from('tenants')
            .update(updateData)
            .eq('id', tenant.id)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({ error: 'Failed to update tenant' });
        }

        res.json({
            message: 'Tenant updated successfully',
            tenant: updatedTenant
        });

    } catch (error) {
        console.error('Update tenant error:', error);
        res.status(500).json({ error: 'Failed to update tenant' });
    }
});

export default router;

