# Database types

`src/index.ts` contains a generated-style bootstrap contract that matches the
Phase 1A migration. Supabase remains the schema source of truth.

After applying migrations to a linked, dedicated non-production hosted
project, regenerate the contract from the repository root:

```bash
supabase gen types typescript --linked --schema public > packages/database/src/index.ts
```

Review the generated diff and run the full typecheck before committing it.
Never link a production project for development validation or type generation.
