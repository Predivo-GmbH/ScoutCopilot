# Supabase Auth Configuration

## OTP (Magic Link / Email OTP)

In the Supabase dashboard under **Authentication > Providers > Email**:

1. Enable **Email OTP**
2. Set OTP length to **6 digits**
3. Set OTP expiry to **600 seconds** (10 minutes)
4. Disable "Confirm email" if using OTP as primary auth method

## OAuth Providers

### Google

1. Go to **Authentication > Providers > Google**
2. Enable the provider
3. Add your Google OAuth Client ID and Secret (from Google Cloud Console)
4. Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`

### Microsoft (Azure)

1. Go to **Authentication > Providers > Azure**
2. Enable the provider
3. Add your Azure AD Application (client) ID and Client Secret
4. Tenant: use `common` for multi-tenant or your specific tenant ID
5. Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`

## Redirect URLs

Under **Authentication > URL Configuration**:

- **Site URL**: `https://scoutcopilot.com`
- **Redirect URLs** (add all):
  - `https://scoutcopilot.com/**`
  - `http://localhost:5173/**` (development)

## RLS Dependencies

All Row-Level Security policies in `001_initial_schema.sql` depend on `auth.uid()` and the `get_user_organization_id()` helper function. Auth must be properly configured for RLS to work.

Key points:
- The `handle_new_user()` trigger automatically creates a profile and organization when a user signs up
- `get_user_organization_id()` returns the org ID for the current user, used in most RLS policies
- API credentials are restricted to `owner` and `admin` roles only
