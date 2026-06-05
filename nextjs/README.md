# Portfolio App

Next.js portfolio and admin CMS backed by Supabase.

## Development

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

## Production

Deploy this directory to Vercel.

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Database and storage setup lives in [`supabase/`](supabase/).
