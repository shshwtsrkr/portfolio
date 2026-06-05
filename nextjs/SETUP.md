# Free Hosting Setup Guide

## Stack
- **Next.js 16** → deployed on **Vercel** (free)
- **Supabase** → PostgreSQL database + file storage + GitHub OAuth (free)
- **Custom domain** → connected via Vercel dashboard

---

## Step 1: Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Choose a name, set a database password, pick a region close to your users
3. Wait for the project to initialize (~2 minutes)

### Run the database schema

1. Go to **SQL Editor** in the Supabase dashboard
2. Paste the contents of `supabase/schema.sql` and run it

### Create storage buckets

1. Go to **Storage** → **New bucket**
2. Create bucket named `images`, check **Public bucket** ✓
3. Create bucket named `files`, check **Public bucket** ✓

### Set up GitHub OAuth

1. Go to [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App
   - App name: `Portfolio Admin`
   - Homepage URL: `https://your-domain.com`
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
2. Copy the **Client ID** and generate a **Client Secret**
3. In Supabase: **Authentication** → **Providers** → **GitHub**
4. Enable GitHub, paste Client ID and Client Secret → Save

### Restrict OAuth to your GitHub account only

In Supabase: **Authentication** → **Email** → disable email signup
The RLS policies already restrict writes to authenticated users. GitHub OAuth naturally limits to your GitHub account since you configured the app.

---

## Step 2: Get Supabase credentials

In Supabase: **Project Settings** → **API**
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3: Deploy to Vercel

### Option A: Vercel CLI (fastest)
```bash
npm i -g vercel
vercel login
vercel --prod
```
When prompted, set these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Option B: GitHub integration
1. Push this `nextjs/` directory to a GitHub repo (or as the root)
2. Go to [vercel.com](https://vercel.com) → Import Git Repository
3. Select your repo → set root directory to `nextjs/` if needed
4. Add environment variables (same 3 as above)
5. Deploy

---

## Step 4: Connect your custom domain

1. In Vercel dashboard: **Settings** → **Domains** → **Add Domain**
2. Enter your domain (e.g. `yourname.com`)
3. Vercel will show you the DNS records to set:
   - For apex domain (`yourname.com`): add an **A record** pointing to `76.76.21.21`
   - For www (`www.yourname.com`): add a **CNAME** pointing to `cname.vercel-dns.com`
4. Set these in your domain registrar's DNS settings
5. SSL is automatic — Vercel provisions it within minutes

---

## Step 5: Migrate your existing data

Export data from your old MySQL database:
```bash
# On your Hetzner server
mysqldump -u root -p portfolio blogs projects publications profile > export.sql
```

Then convert/import into Supabase. The column names are the same (snake_case) so it's straightforward. You can also just re-enter your content via the new admin dashboard at `/admin`.

---

## Admin access

Go to `your-domain.com/login` → Sign in with GitHub → redirects to `/admin`

---

## Local development

```bash
cp .env.local.example .env.local
# Fill in your Supabase credentials
npm run dev
```
