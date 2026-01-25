# StepSync

StepSync is a multi-tenant SOP knowledge base that syncs text steps with YouTube videos. Teams can click steps to jump to the right timestamp and follow along on mobile.

## Tech Stack

- Next.js App Router
- TypeScript + TailwindCSS + shadcn/ui
- Prisma ORM + PostgreSQL
- NextAuth (credentials, JWT sessions)
- Zod + React Hook Form
- YouTube IFrame Player API

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (see `.env.example`):

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/stepsync"
DIRECT_URL="postgresql://USER:PASSWORD@localhost:5432/stepsync"
NEXTAUTH_SECRET="replace-with-random-secret"
NEXTAUTH_URL="http://localhost:3000"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="username"
SMTP_PASS="password"
SMTP_SECURE="false"
SMTP_FROM="StepSync <no-reply@example.com>"
ALLOW_RESET_LINK_RESPONSE="false"
```

3. Run database migrations and seed demo data:

```bash
npm run db:migrate
npm run db:seed
```

4. Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo logins

All demo users use password `Password123!`.

- `owner@democo.com` (OWNER)
- `admin@democo.com` (ORG_ADMIN)
- `editor@democo.com` (EDITOR)
- `viewer@democo.com` (VIEWER)

## Key routes

- `/` marketing landing page
- `/login` / `/signup`
- `/app` dashboard
- `/app/sop/[id]` SOP viewer
- `/app/search` search
- `/app/admin/*` admin tools

## Notes

- All queries are scoped to `orgId`.
- RBAC + department membership gates access to SOPs and admin routes.
- Video provider is abstracted by `videoType` + `videoUrl` for future Vimeo/S3 support.
