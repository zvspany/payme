# PayMe

PayMe is an open source, self-hosted payment profile platform.

A user creates a public profile page and publishes ways to receive money in one place: PayPal, crypto addresses, Revolut, bank transfer details, and optional social/contact links.

## What PayMe Is
- Self-hosted first profile/presentation layer
- Minimal dashboard to manage profile data and payment methods
- Public profile pages at `/u/:username` (and `/@username` rewrite)
- Copy-first UX with QR code support for payment details

## What PayMe Is Not
- Not a wallet
- Not a payment processor
- Does not hold funds
- Does not execute transactions
- Not a marketplace
- Not a social network

## Tech Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Auth.js (credentials)
- Docker + docker-compose

## Local Development
1. Copy env file:
```bash
cp .env.example .env
```
2. Install dependencies:
```bash
npm install
```
3. Start PostgreSQL (Docker):
```bash
docker compose up -d db
```
4. Run migrations and seed:
```bash
npm run db:migrate:dev
npm run db:seed
```
5. Start app:
```bash
npm run dev
```
6. Open `http://localhost:3000`
7. Avatar uploads are stored in `public/uploads/avatars`.

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection URL
- `NEXTAUTH_SECRET`: strong random secret for session/auth signing
- `NEXTAUTH_URL`: absolute app URL (for example `http://localhost:3000`)
- `NODE_ENV`: `development` or `production`
- `PORT`: app port

## Database Setup
- Prisma schema: `prisma/schema.prisma`
- Initial migration: `prisma/migrations/20260327133000_init/migration.sql`
- Seed inserts built-in themes (`terminal-dark`, `amber-paper`)

Useful commands:
```bash
npm run db:generate
npm run db:migrate:dev
npm run db:migrate
npm run db:seed
```

## Docker Deployment
1. Copy env:
```bash
cp .env.example .env
```
2. Set `NEXTAUTH_SECRET` in `.env`.
3. Start services:
```bash
docker compose up --build -d
```
4. Open `http://localhost:3000`.

The app container runs `npm run db:migrate` before `npm run start`.
Avatar uploads are persisted in the `avatar_uploads` Docker volume.

## Security Notes
- All important writes are server-side validated (Zod + method-specific checks)
- Input is normalized/sanitized to plain text presentation
- Authenticated routes are protected in middleware and server-side checks
- Public profile visibility can be disabled per profile
- Payment validation is basic format validation only (not account/wallet ownership verification)
- Add rate limiting at reverse-proxy or middleware level for production

## Product Notes
- Username is normalized to lowercase and unique
- Payment methods are normalized in a separate table (not user columns)
- Ordering is deterministic via up/down controls and persistent sort order

## Future Roadmap
- Richer social links management
- Profile verification model
- Public API
- Import/export
- Additional built-in themes
- Plugin architecture
