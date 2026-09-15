# Mathlet database setup

1. Create a PostgreSQL project in Neon.
2. Copy the pooled connection string from Neon Connect.
3. Create a local .env file from .env.example.
4. Set DATABASE_URL to the Neon connection string.
5. Install dependencies: npm install
6. Generate Prisma Client: npx prisma generate
7. Create the first migration: npx prisma migrate dev --name init_curriculum
8. Import the bilingual curriculum: npm run prisma:seed

Never commit .env or share the connection string publicly.
