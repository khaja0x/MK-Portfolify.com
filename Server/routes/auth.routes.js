import express from 'express';
import { supabase } from '../utils/supabase.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login admin user
 * Body: { email, password, tenantId }
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password, tenantId } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Sign in with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            return res.status(401).json({
                error: authError.message || 'Invalid credentials'
            });
        }

        const userId = authData.user.id;

        // Get user's tenants
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
            .eq('user_id', userId);

        if (adminError || !adminUsers || adminUsers.length === 0) {
            // User exists but not linked to any tenant
            await supabase.auth.signOut();
            return res.status(403).json({
                error: 'User is not associated with any tenant'
            });
        }

        // If tenantId specified, verify user has access
        if (tenantId) {
            const hasAccess = adminUsers.some(
                au => au.tenants && au.tenants.tenant_id === tenantId
            );

            if (!hasAccess) {
                await supabase.auth.signOut();
                return res.status(403).json({
                    error: 'Access denied to this tenant'
                });
            }
        }

        // Return session and tenant info
        res.json({
            message: 'Login successful',
            session: authData.session,
            user: authData.user,
            tenants: adminUsers.map(au => ({
                tenantId: au.tenants?.tenant_id,
                name: au.tenants?.name,
                role: au.role,
                logoUrl: au.tenants?.logo_url,
                themeConfig: au.tenants?.theme_config,
            })),
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No session found' });
        }

        const token = authHeader.replace('Bearer ', '');

        // Sign out
        const { error } = await supabase.auth.admin.signOut(token);

        if (error) {
            console.error('Logout error:', error);
        }

        res.json({ message: 'Logged out successfully' });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
});

/**
 * GET /api/auth/me
 * Get current user info with tenant context
 */
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.replace('Bearer ', '');

        // Get user from token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get user's tenants
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

        res.json({
            user: {
                id: user.id,
                email: user.email,
            },
            tenants: adminUsers?.map(au => ({
                tenantId: au.tenants?.tenant_id,
                name: au.tenants?.name,
                role: au.role,
                logoUrl: au.tenants?.logo_url,
                themeConfig: au.tenants?.theme_config,
            })) || [],
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

export default router;

