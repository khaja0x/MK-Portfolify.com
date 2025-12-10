# Multi-Tenant Portfolio System - Setup Guide

## 🚀 Quick Start

This guide will help you set up the multi-tenant portfolio system in your Supabase project.

## Step 1: Run Database Migrations

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the following migrations **in order**:

### Migration 1: Add Multi-Tenant Schema
```sql
-- Copy and paste the entire contents of:
migrations/001_add_multi_tenant.sql
```

### Migration 2: Add RLS Policies
```sql
-- Copy and paste the entire contents of:
migrations/002_tenant_rls_policies.sql
```

## Step 2: Update Environment Variables

### Frontend (.env)
Already configured - no changes needed!

### Backend (server/.env)
Already configured with SUPABASE_ANON_KEY!

## Step 3: Restart Servers

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
npm run dev
```

## Step 4: Test the System

### Register a New Tenant
1. Visit: `http://localhost:8080/register`
2. Fill in the form:
   - Organization Name: "Test Company"
   - Tenant ID: "test-company" (auto-generated)
   - Admin Email: "admin@test.com"
   - Password: "password123"
3. Click "Create Account"
4. You'll be redirected to: `http://localhost:8080/admin/test-company`

### View the Portfolio
1. Visit: `http://localhost:8080/portfolio/test-company`
2. You should see the default portfolio (currently showing "default" tenant data)

### Login to Existing Tenant
1. Visit: `http://localhost:8080/login`
2. Enter your credentials
3. You'll be redirected to your admin dashboard

## 📋 Features Implemented

✅ **Multi-Tenant Database Schema**
- Tenants table with unique tenant IDs
- Admin users linked to tenants
- All portfolio data scoped to tenants
- Row-Level Security (RLS) for data isolation

✅ **Backend API**
- `POST /api/tenants/register` - Register new tenant
- `GET /api/tenants/check-availability/:tenantId` - Check ID availability
- `GET /api/tenants/:tenantId` - Get tenant info
- `PUT /api/tenants/:tenantId` - Update tenant settings
- `POST /api/auth/login` - Login with tenant context
- `GET /api/auth/me` - Get current user info

✅ **Frontend Components**
- Admin registration page with multi-step form
- Tenant ID availability checking
- Tenant-specific portfolio pages
- Tenant context provider
- Updated routing for multi-tenant support

## 🔧 Next Steps (To Complete)

### 1. Update Existing Components to Use Tenant Context

All editor components need to be updated to:
- Get current tenant from context
- Filter queries by tenant_id
- Include tenant_id in create/update operations

Example for HeroEditor.tsx:
```tsx
import { useTenant } from '@/contexts/TenantContext';

const HeroEditor = () => {
  const { currentTenant } = useTenant();
  
  // When fetching data:
  const { data } = await supabase
    .from('hero')
    .select('*')
    .eq('tenant_id', currentTenant?.id);
    
  // When creating/updating:
  await supabase
    .from('hero')
    .insert({ ...formData, tenant_id: currentTenant?.id });
};
```

### 2. Update Login Component

The login component needs to:
- Handle tenant context
- Support login with tenant ID in URL
- Redirect to correct tenant dashboard

### 3. Update Protected Route

ProtectedRoute needs to:
- Load tenant from URL parameter
- Set tenant in context
- Verify user has access to tenant

### 4. Update Public Components

Components like Hero, About, Projects, etc. need to:
- Accept optional tenant filter
- Show data for specific tenant when viewing `/portfolio/:tenantId`
- Show default tenant data when viewing `/`

## 🎯 Testing Checklist

- [ ] Run database migrations
- [ ] Restart both servers
- [ ] Register a new tenant
- [ ] Login with new tenant credentials
- [ ] View tenant-specific portfolio
- [ ] Create content in admin dashboard
- [ ] Verify content shows on public portfolio
- [ ] Register second tenant
- [ ] Verify data isolation (tenant A can't see tenant B's data)

## 🐛 Troubleshooting

### "Tenant ID already taken"
- Choose a different tenant ID
- Check the tenants table in Supabase

### "Failed to create admin user"
- Check Supabase Auth settings
- Verify email confirmation is disabled or handled
- Check server logs for detailed error

### "Access denied"
- Verify RLS policies are created
- Check admin_users table for user-tenant link
- Verify user is authenticated

### Data not showing
- Check tenant_id is set on all records
- Verify RLS policies allow access
- Check browser console for errors

## 📚 API Documentation

### Tenant Registration
```bash
POST http://localhost:5000/api/tenants/register
Content-Type: application/json

{
  "tenantName": "Acme Corp",
  "tenantId": "acme-corp",
  "adminEmail": "admin@acme.com",
  "password": "secure-password"
}
```

### Check Availability
```bash
GET http://localhost:5000/api/tenants/check-availability/acme-corp
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@acme.com",
  "password": "secure-password"
}
```

## 🔐 Security Notes

- All tenant data is isolated via RLS policies
- Admins can only access their own tenant's data
- Public can view all active tenant portfolios
- Authentication required for admin operations
- Passwords are hashed by Supabase Auth

## 🎨 Customization

Each tenant can customize:
- Theme colors (primaryColor)
- Font family
- Dark/light mode
- Logo
- All portfolio content

Theme config is stored in `tenants.theme_config` as JSON.

## 📞 Support

If you encounter issues:
1. Check server logs (Terminal 1)
2. Check browser console
3. Verify database migrations ran successfully
4. Check Supabase dashboard for errors
