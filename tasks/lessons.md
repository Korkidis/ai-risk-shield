# Project Lessons

## General
*   **Startup Protocol**: Always check `NORTH_STAR.md` and `walkthrough.md` before assuming project state. The codebase is the source of truth.
*   **Documentation First**: When context is missing (like Roadmap), stop and create the documentation before coding.
*   **Verification**: Never trust a "Must Have" list blindly—verify against actual code implementation (Schema/Migrations).

## Supabase
*   **Auth Schema Access**: Migrations cannot modify the `auth` schema (security restriction). Functions accessing auth data must live in `public` and use `security definer` cautiously.
