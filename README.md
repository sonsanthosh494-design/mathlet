# Mathlet

Bilingual mathematics learning workspace for Tamil Nadu State Board students.

## Stack

- Next.js App Router
- TypeScript and React
- Prisma 6
- PostgreSQL via Neon
- Tamil and English curriculum
- KaTeX mathematical notation
- Structured questions, content blocks, and learner progress

## Local setup

Create a `.env` file:

```env
DATABASE_URL="your-neon-connection-string"
AUTH_SECRET="a-long-random-secret"
```

Install and prepare the project:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

Start development:

```bash
npm run dev
```

## Structured content workflow

The source of truth is the uploaded TN Textbooks PDF. Content is stored as individually numbered questions with shared English/Tamil translations.

Generate the textbook-derived visual assets and import the structured content:

```bash
npm run content:assets
npm run content:import
```

`npm run dev` and `npm run build` automatically regenerate the visual assets before starting.

The importer must be run after the database seed and after new verified JSON files are added.

Admin content review is available at:

```text
/admin/content
```

Do not commit `.env`, textbook PDFs, `.next/`, or `node_modules/`.
