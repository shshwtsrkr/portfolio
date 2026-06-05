# Shashwat Sarkar Portfolio

Personal portfolio and admin CMS built with Next.js, Supabase, and Vercel.

The active application lives in [`nextjs/`](nextjs/).

## Stack

- Next.js App Router
- TypeScript
- Supabase database, auth, and storage
- Vercel hosting

## Local Development

```bash
cd nextjs
cp .env.local.example .env.local
npm install
npm run dev
```

The local app runs at `http://localhost:3000` unless another port is selected.

## Environment Variables

Set these in `nextjs/.env.local` for local development and in Vercel for production:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Keep real `.env.local` files out of Git.

## Deployment

Deploy with Vercel using:

- Root directory: `nextjs`
- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: Next.js default

After deployment, add the production URL to any Supabase auth redirect allowlist and update the GitHub OAuth callback URL used by the admin login.
