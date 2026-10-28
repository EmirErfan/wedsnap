--- 
name: phase1-foundation
description: Core foundation for Phase 1: database schema, environment setup, and basic pages.
metadata:
  type: project


## Phase 1: Foundation and Photo Capture

### Summary

This phase establishes the core infrastructure for the wedding guest camera app. The following files and components were created:

- **Environment**: `.env.template`, `.gitattributes`
- **Database**: Drizzle schema and migration for all tables (`Events`, `Guests`, `Photos`, `Wishes`, `Jobs`, `Montages`)
- **Pages**: Owner login (`app/owner/login/page.tsx`) and event creation form (`app/create-event/page.tsx`)
- **README**: Updated with setup instructions and commands.
- **package.json**: Added scripts and dependencies.

### Files Created

1. **Environment Files**:
   - `.env.template`: Placeholder for environment variables.
   - `.gitattributes`: Configured line endings for text files.

2. **Database**:
   - `database/schema.ts`: Drizzle ORM schema for all tables.
   - `database/migrations/001-initial.ts`: Migration script for the database schema.

3. **Pages**:
   - `app/owner/login/page.tsx`: Minimal owner login page.
   - `app/create-event/page.tsx`: Event creation form with slug/PIN/QR code generation.

4. **README**: Updated with:
   - Prerequisites and setup instructions.
   - Commands for running the app, migrations, and tests.

5. **package.json**: Added scripts and dependencies:
   - `dev`: Next.js development server.
   - `migrate`: Generate database migrations.
   - `seed`: Seed the database.
   - `worker`: Run the background worker.
   - `import-photos`: Import photos for testing.
   - `print-edit-plan`: Print an edit plan.
   - `test`: Run Vitest.

### Next Steps

- Create `tsconfig.json` for TypeScript configuration.
- Implement database seeding logic.
- Add tests for core functionality.

### Risks

- **Database Schema**: Double-check the schema before running migrations to avoid corruption.
- **Dependencies**: Ensure all versions in `package.json` are compatible.

### Commands

- Run migrations: `npm run migrate`
- Seed the database: `npm run seed`
- Start the development server: `npm run dev`

---