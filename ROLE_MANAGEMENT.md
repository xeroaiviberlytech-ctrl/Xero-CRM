# Role Management Guide

## Current Role System

### Available Roles
- **`user`** (default) - Regular user, can only see/manage their own data
- **`admin`** - Administrator, can see/manage all data across all users

### Role Permissions

#### Regular User (`user`)
- ✅ View only their own leads, deals, tasks, campaigns
- ✅ Create and edit their own records
- ✅ View their own activities
- ❌ Cannot view other users' data
- ❌ Cannot change their own role
- ❌ Cannot view all users in analytics

#### Admin (`admin`)
- ✅ View ALL leads, deals, tasks, campaigns (from all users)
- ✅ Edit/Delete any record (even if not owned by them)
- ✅ View all activities across all users
- ✅ View team performance analytics (all users)
- ✅ View other users' profiles
- ✅ Can change roles (via updateProfile endpoint)

---

## How to Manage Roles

### Method 1: Using Prisma Studio (Easiest)

1. **Open Prisma Studio:**
   ```powershell
   cd xero-crm
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   npx prisma studio
   ```

2. **Navigate to User table:**
   - Go to http://localhost:5555
   - Click on "User" table

3. **Edit a user's role:**
   - Find the user you want to change
   - Click on the user row
   - Change the `role` field from `"user"` to `"admin"` (or vice versa)
   - Click "Save 1 change"

### Method 2: Using SQL (Direct Database)

1. **Connect to your Supabase database**
2. **Run SQL query:**

```sql
-- Make a user an admin
UPDATE "User" 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Make a user a regular user
UPDATE "User" 
SET role = 'user' 
WHERE email = 'your-email@example.com';

-- Check all users and their roles
SELECT id, email, name, role, "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC;
```

### Method 3: Using tRPC API (Programmatic - Admin Only)

**Admin endpoints available:**

1. **List all users (admin only):**
```typescript
const { data: users } = trpc.users.list.useQuery()
// Returns array of all users with their roles
```

2. **Update user role (admin only):**
```typescript
trpc.users.updateRole.useMutation({
  userId: "user-id-here",
  role: "admin" // or "user"
})
```

**Security:** Regular users can NO LONGER change their own role. Only admins can change roles.

---

## How Roles Work in the Code

### Role Checks Throughout the App

1. **Leads Router:**
   - Regular users: Only see leads where `assignedToId = their user ID`
   - Admins: Can see all leads, can edit/delete any lead

2. **Deals Router:**
   - Regular users: Only see deals where `ownerId = their user ID`
   - Admins: Can see all deals, can edit/delete any deal

3. **Tasks Router:**
   - Regular users: Only see tasks where `assignedToId = their user ID`
   - Admins: Can see all tasks, can edit/delete any task

4. **Campaigns Router:**
   - Regular users: Only see campaigns where `createdById = their user ID`
   - Admins: Can see all campaigns, can edit/delete any campaign

5. **Analytics Router:**
   - Regular users: Only see their own performance
   - Admins: See team performance (all users)

6. **Activities Router:**
   - Regular users: Only see their own activities
   - Admins: Can see all activities

---

## Recommended: Add Admin-Only Role Management

We should add:
1. `users.list` - List all users (admin only)
2. `users.updateRole` - Update any user's role (admin only)
3. Admin UI page to manage users and roles

Would you like me to implement this?

---

## Quick Commands

### Check Your Current Role
```typescript
// In browser console or React component
const { data } = trpc.users.getCurrent.useQuery()
console.log(data?.role) // "user" or "admin"
```

### Make Yourself Admin (via Prisma Studio)
1. Open Prisma Studio
2. Find your user record (by email)
3. Change `role` from `"user"` to `"admin"`
4. Save

### Verify Admin Access
After making yourself admin:
- You should see ALL leads, deals, tasks in the app
- Team Performance in Analytics should show all users
- You can edit/delete any record

---

## Security

✅ **Fixed:** Users can no longer change their own role via `updateProfile`. Role changes are now admin-only through the `updateRole` endpoint.

### Security Features:
- ✅ Regular users cannot change their own role
- ✅ Only admins can change roles via `users.updateRole`
- ✅ Admins cannot remove their own admin role (prevents lockout)
- ✅ Role changes are logged via activity feed

