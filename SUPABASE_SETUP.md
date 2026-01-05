# Supabase Setup Instructions

## Step 1: Apply Database Migration

Since you've already added your Supabase API keys to `.env.local`, now you need to create the database tables.

### Manual Migration (Recommended for now)

1. **Go to Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/_/sql/new
   ```
   Or navigate to: Your Project → SQL Editor → New query

2. **Copy the migration file:**
   - Open: `supabase/migrations/20260103_initial_schema.sql`
   - Select all (Cmd+A / Ctrl+A)
   - Copy (Cmd+C / Ctrl+C)

3. **Paste and run:**
   - Paste into the SQL Editor
   - Click **"Run"** button (bottom right)
   - Wait for "Success" message (~5-10 seconds)

4. **Verify:**
   - Run this test command:
     ```bash
     npm run test:db
     ```
   - You should see: ✅ Successfully connected to Supabase!

## Step 2: Create Storage Buckets

We need 3 storage buckets for file uploads.

### 2.1: Create "uploads" bucket

1. **Go to Storage:**
   ```
   https://supabase.com/dashboard/project/_/storage/buckets
   ```

2. **Click "New bucket"**

3. **Configure:**
   - Name: `uploads`
   - Public bucket: ❌ **NO** (unchecked)
   - File size limit: 100 MB
   - Allowed MIME types: Leave empty (we'll validate in code)

4. **Click "Create bucket"**

5. **Add storage policy:**
   - Click on the `uploads` bucket
   - Go to "Policies" tab
   - Click "New policy"
   - Select "For full customization"
   - Use this SQL:

   ```sql
   CREATE POLICY "Users can upload to their tenant folder"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'uploads' AND
     (storage.foldername(name))[1] = (
       SELECT tenant_id::text
       FROM profiles
       WHERE id = auth.uid()
     )
   );

   CREATE POLICY "Users can read their tenant folder"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'uploads' AND
     (storage.foldername(name))[1] = (
       SELECT tenant_id::text
       FROM profiles
       WHERE id = auth.uid()
     )
   );

   CREATE POLICY "Users can delete their tenant files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'uploads' AND
     (storage.foldername(name))[1] = (
       SELECT tenant_id::text
       FROM profiles
       WHERE id = auth.uid()
     )
   );
   ```

### 2.2: Create "brand-guidelines" bucket

1. **Click "New bucket"** again

2. **Configure:**
   - Name: `brand-guidelines`
   - Public bucket: ❌ **NO** (unchecked)
   - File size limit: 25 MB
   - Allowed MIME types: Leave empty

3. **Add storage policy** (same as above but replace `'uploads'` with `'brand-guidelines'`)

### 2.3: Create "video-frames" bucket

1. **Click "New bucket"** again

2. **Configure:**
   - Name: `video-frames`
   - Public bucket: ❌ **NO** (unchecked)
   - File size limit: 10 MB
   - Allowed MIME types: Leave empty

3. **Add storage policy** (same as above but replace `'uploads'` with `'video-frames'`)

## Step 3: Configure Authentication Settings

1. **Go to Authentication Settings:**
   ```
   https://supabase.com/dashboard/project/_/settings/auth
   ```

2. **Configure these settings:**

   **Email Auth:**
   - ✅ Enable Email provider
   - ✅ Confirm email: **Disabled** (for faster development, enable in production)
   - Minimum password length: **12 characters**

   **Site URL:**
   - Development: `http://localhost:3000`
   - (Update to production URL when deploying)

   **Redirect URLs:**
   - Add: `http://localhost:3000/auth/callback`
   - Add: `http://localhost:3000/dashboard`

   **JWT Settings:**
   - JWT expiry: 3600 (1 hour) - default is fine
   - Refresh token rotation: ✅ Enabled

3. **Click "Save"**

## Step 4: Verify Everything Works

Run the test script again:

```bash
npm run test:db
```

**Expected output:**
```
✅ Environment variables found
✅ Successfully connected to Supabase!
✅ Tables exist and are queryable

🎉 Database connection test passed!
```

## Step 5: Optional - Install Supabase CLI (Future)

For production, you'll want to use Supabase CLI for migrations.

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref [your-project-ref]

# Future migrations can be applied with:
supabase db push
```

For now, manual SQL execution is fine!

---

## Troubleshooting

### "Could not find table" error
- You haven't run the SQL migration yet
- Go to SQL Editor and paste the migration file

### "Permission denied" error
- Check that RLS policies are created
- Make sure you're using the correct API keys (anon, not publishable)

### "Bucket not found" error
- Create the storage buckets (Step 2)
- Make sure names match exactly: `uploads`, `brand-guidelines`, `video-frames`

### Can't create policies
- Make sure the tables exist first (Step 1)
- Run the migration SQL before creating storage policies

---

## What's Next?

Once all steps are complete:

✅ Database tables created
✅ Storage buckets created
✅ Authentication configured
✅ Test script passes

**You're ready for Step 3: Authentication Flow!**

Say: "Supabase setup complete. Ready for Step 3."
