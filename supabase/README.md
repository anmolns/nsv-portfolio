# Supabase setup

## Step 1 — Database (done)

1. **SQL Editor** → run `supabase/migrations/001_initial.sql`
2. **SQL Editor** → run `supabase/migrations/002_portfolio_category.sql` (video categories from bulk upload)
3. **SQL Editor** → run `supabase/migrations/003_portfolio_category_filter.sql` (category filter on live site)
4. **SQL Editor** → run `supabase/migrations/004_category_counts_by_media_type.sql` (category counts per videos / VR page)
5. Add `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

6. Restart `npm run dev`

---

## Step 2 — Admin access

### 2a. Create an admin user

1. Supabase Dashboard → **Authentication** → **Users** → **Add user**
2. Enter email + password (e.g. your work email)
3. Copy the user's **UUID** from the users list

### 2b. Allowlist the user

**SQL Editor** → run (replace values):

```sql
insert into public.admin_users (user_id, email)
values ('PASTE-USER-UUID-HERE', 'you@nsventures.in')
on conflict (user_id) do nothing;
```

### 2c. Open admin

1. Go to **http://localhost:5173/admin/login**
2. Sign in with the email + password from step 2a
3. Add tours at **Portfolio → Add tour**

---

## Admin features

| Page | URL |
|------|-----|
| Login | `/admin/login` |
| Dashboard | `/admin` |
| Portfolio list | `/admin/tours` |
| Add tour | `/admin/tours/new` |
| Edit tour | `/admin/tours/:id/edit` |

---

## Step 3 (next)

- Inquiry form → Supabase + email (Resend)
- Load city filters from DB instead of `metroCities.ts`
- Cities CRUD in admin
