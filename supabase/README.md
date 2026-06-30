# Supabase setup

## Step 1 — Database (done)

1. **SQL Editor** → run `supabase/migrations/001_initial.sql`
2. **SQL Editor** → run `supabase/migrations/002_portfolio_category.sql` (video categories from bulk upload)
3. **SQL Editor** → run `supabase/migrations/003_portfolio_category_filter.sql` (category filter on live site)
4. **SQL Editor** → run `supabase/migrations/004_category_counts_by_media_type.sql` (category counts per videos / VR page)
5. **SQL Editor** → run `supabase/migrations/005_add_state_to_cities.sql`
6. **SQL Editor** → run `supabase/migrations/006_state_counts_all_cities.sql`
7. **SQL Editor** → run `supabase/migrations/007_portfolio_state_labels.sql` (state + builder/project/city on items)
8. **SQL Editor** → run `supabase/migrations/008_hide_portfolio_links.sql` (hide links from public API)
9. **SQL Editor** → run `supabase/migrations/009_portfolio_whatsapp_otp.sql` (WhatsApp OTP table)
10. Add `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

11. Restart `npm run dev`

---

## Step 1b — Portfolio WhatsApp OTP (Meta Cloud API)

OTP is sent via the **official [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)** in Supabase Edge Functions. No OTP logic runs in the browser.

### A. Meta / WhatsApp setup

1. Go to [Meta for Developers](https://developers.facebook.com/) → create or open your app
2. Add product **WhatsApp** → **API Setup**
3. Note your **Phone number ID** and generate a **permanent access token**
4. In **WhatsApp Manager** → **Message templates** → **Create template**
   - **Category:** Authentication
   - **Name:** `portfolio_access_otp` (or your choice — set `WHATSAPP_OTP_TEMPLATE`)
   - **Body example:** `{{1}} is your verification code.`
   - Add **Copy code** button if using authentication type (recommended)
   - Submit for approval
5. Add your business phone number and complete Meta business verification if required

### B. Supabase secrets

Dashboard → **Edge Functions** → **Secrets**:

| Secret | Required | Example |
|--------|----------|---------|
| `OTP_HASH_SECRET` | Yes | Random 32+ char string |
| `WHATSAPP_ACCESS_TOKEN` | Yes* | Permanent token from Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | Yes* | e.g. `123456789012345` |
| `WHATSAPP_OTP_TEMPLATE` | Yes | `portfolio_access_otp` |
| `WHATSAPP_TEMPLATE_LANGUAGE` | No | `en` or `en_US` (match template) |
| `WHATSAPP_OTP_TEMPLATE_TYPE` | No | `authentication` (default) or `utility` |
| `WHATSAPP_OTP_COPY_BUTTON` | No | `true` (default) — set `false` if no button in template |
| `WHATSAPP_DEV_MODE` | No | `true` = log OTP only (testing) |

\*Not required when `WHATSAPP_DEV_MODE=true`

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically on deploy.

### C. Deploy edge functions

**Option 1 — CLI**

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy portfolio-otp-send
npx supabase functions deploy portfolio-otp-verify
```

**Option 2 — Supabase Dashboard (manual)**

1. **Edge Functions** → **Create function** → name `portfolio-otp-send`
2. Paste code from `supabase/functions/portfolio-otp-send/index.ts` **plus** inline the contents of `supabase/functions/_shared/portfolio-otp.ts` at the top (Dashboard does not support `_shared` imports)
3. Repeat for `portfolio-otp-verify`
4. For each function: disable **Enforce JWT verification** (public site has no login)

When pasting manually, copy `supabase/functions/_shared/portfolio-otp.ts` into the top of each function file and remove the `import ... from '../_shared/...'` line.

### D. Database

Run `supabase/migrations/009_portfolio_whatsapp_otp.sql` in SQL Editor.

### E. Test

1. Set `WHATSAPP_DEV_MODE=true` → submit modal → check **portfolio-otp-send** logs for the code
2. Set real Meta secrets + `WHATSAPP_DEV_MODE=false` → code arrives on WhatsApp

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

## Step 3 — Deploy online

### A. Public site (Vercel / Netlify / static host)

1. Connect the repo and set build command: `npm run build`, output: `dist`
2. Environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_BULK_IMPORT_API_URL` — URL of your import server (see B)
3. Deploy. Admin login and portfolio work via Supabase; bulk upload needs the import server.

### B. Bulk import server (Railway / Render / Fly / VPS)

**YouTube videos** only fetch thumbnails from YouTube CDN (lightweight). **VR tours** still use Playwright in the container.

From repo root:

```bash
docker build -f server/Dockerfile -t nsv-bulk-import .
docker run -p 3001:3001 \
  -e SUPABASE_URL=https://xxxx.supabase.co \
  -e SUPABASE_ANON_KEY=eyJ... \
  -e SUPABASE_SERVICE_ROLE_KEY=eyJ... \
  nsv-bulk-import
```

Health check: `GET https://your-import-host/api/bulk-import/health`

On Railway / Render: deploy from `server/Dockerfile`, set the three Supabase env vars, expose port **3001**.

Then set on Vercel (redeploy):

```env
VITE_BULK_IMPORT_API_URL=https://your-import-host.railway.app
```

**Video-only (no Docker):** a small Node VM can run `npm run start:import` with env vars — YouTube bulk upload works without Playwright. VR bulk upload needs the Docker image above.

### C. Local dev

```bash
npm run dev:all
```

Uses Vite proxy to `localhost:3001` — no `VITE_BULK_IMPORT_API_URL` needed.

---

## Step 4 (next)

- Inquiry form → Supabase + email (Resend)
- Load city filters from DB instead of `metroCities.ts`
- Cities CRUD in admin
