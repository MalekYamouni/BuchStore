<!-- GitHub Copilot / AI contributor instructions for the BookStore repo -->
# BookStore — Copilot / AI contributor instructions

This file gives concise, actionable guidance for code-generating assistants and contributors working on this repository (backend: Go/Gin/Postgres; frontend: React + Vite + TypeScript).

Keep changes minimal, follow existing patterns (controllers → services → repository), and prefer non-breaking edits. When in doubt, run tests or a quick smoke run locally.

## Quick run (developer machine)
- Backend (from project root):
  - cd backend
  - The backend uses Go + Gin. Dev: use the included `air` dev workflow or run Go directly.
  - Build & run (Windows PowerShell):
    - go build -o ./tmp/main.exe ./cmd/backend && ./tmp/main.exe
  - Default DB connection (local Postgres): postgresql://postgres:<password>@localhost:5432/bookbazaar?sslmode=disable
    - Update connection string in `backend/internal/app/app.go` for local runs or use environment-based configuration when adding a change.

- Frontend (from project root):
  - cd frontend/bookbazaar
  - npm install
  - npm run dev
  - The frontend expects the backend at http://localhost:8080/api by default. Override with VITE_API_URL during development.

## Project layout and conventions
- backend/
  - cmd/backend/main.go — optional entrypoint (the repo uses `internal/app.Run()`)
  - internal/app/app.go — application wiring (DB, services, routes, middleware). This is the main file to inspect when changing routes or middleware.
  - internal/handlers — Gin HTTP handlers (controllers). Keep handlers thin: validate input, call service, return JSON status.
  - internal/services — Business logic. Services call repositories and implement transactions when needed.
  - internal/repository — Database access. Use explicit SELECT columns matching Scan order. Prefer transactions for multi-step changes.
  - internal/models — Shared structs used by handlers/services/repositories.

- frontend/bookbazaar/
  - src/hooks — client hooks & Zustand stores (notably `userAuth.tsx`, `useBorrow.tsx`, `useCart.tsx`). Keep token handling in `userAuth`.
  - src/components — UI components (BookCard shows borrowing UI and countdown logic).

## Authentication & Authorization
- Authentication uses JWT (HMAC) issued by `AuthController.Login` in `backend/internal/handlers/authController.go`.
- JWT claims include `userId` and `role` ("admin" for administrative users). The middleware `AuthMiddleware` parses the token and sets `ctx.Set("user")` and `ctx.Set("userId")` for handlers.
- Routes that require admin check also use `AdminOnly()` middleware.

When implementing or updating endpoints:
- Ensure the repository selects the `role` and the user service returns it at login. The frontend stores role in localStorage.
- Secure endpoints require the Authorization header: `Authorization: Bearer <token>`.

## Database & time handling notes
- Use timestamptz (timestamp with time zone) for fields that will be rendered on the frontend (due_at, reservation_expires_at). This avoids timezone offsets.
- The repository methods format times as RFC3339 when returning them to the frontend (recommended). Example: timeVal.Format(time.RFC3339)
- Always SELECT explicit columns in the order they are scanned. Mismatched order causes zero/empty IDs on the frontend.

## APIs & important endpoints (examples)
- POST /api/login
  - Body: { "username": "...", "password": "..." }
  - Response: { token, userId, role }

- GET /api/books
  - Public (in this codebase currently guarded by auth middleware). Returns []Book JSON.

- POST /api/books/:id/borrowBook
  - Protected. Body: { days: number }

- GET /api/books/borrowedBooks
  - Protected. Returns borrowed books for current user with `dueAt` fields in RFC3339.

- GET /api/books/cart
  - Protected. Returns cart entries; items with reservation_expires_at in the past are filtered out.

Example curl (login):
  - curl -X POST http://localhost:8080/api/login -H "Content-Type: application/json" -d '{"username":"admin","password":"secret"}'

Example curl (borrowed books):
  - curl -H "Authorization: Bearer <token>" http://localhost:8080/api/books/borrowedBooks

## Small behavioral rules for AI contributors
- Keep PRs small and focused. When changing backend SQL, include a short smoke test (curl or go test) showing the new behavior.
- Do not change database credentials or embed secrets in commits. If you need environment variables, add code that falls back to sensible defaults but prefers env vars.
- Prefer idempotent migrations. Provide SQL ALTER statements in comments or a migration file when changing schema.
- Respect existing error responses: handlers usually return JSON with keys `error` or `message` and appropriate HTTP status codes.

## DB migration snippets (use with caution)
- Convert timestamp to timestamptz (example):
  - ALTER TABLE borrowed_books ALTER COLUMN due_at TYPE timestamptz USING due_at AT TIME ZONE 'UTC';
  - ALTER TABLE user_cart ALTER COLUMN reservation_expires_at TYPE timestamptz USING reservation_expires_at AT TIME ZONE 'UTC';

## Where to look when debugging common issues
- Frontend shows id === 0 or missing data: check repository SELECT column order and Scan target order in `backend/internal/repository/*.go`.
- Token / role missing on frontend: ensure Login returns `role` and `userRepository` scans `role` from DB.
- Timezone & countdown off by hours: ensure DB columns use timestamptz or the backend returns RFC3339 with timezone offset.

## Files of special interest
- backend/internal/app/app.go — app wiring, middleware, routes.
- backend/internal/handlers/authController.go — Login and token claims.
- backend/internal/repository/bookRepository.go — GetAll, BorrowBook, GetCartBooks (time formatting, SELECT ordering).
- frontend/bookbazaar/src/hooks/userAuth.tsx — token parsing, storage, auto-logout behavior.
- frontend/bookbazaar/src/components/BookCard.tsx — borrowing UI and live countdown logic.

If you need anything more specific (unit tests, common PR templates, or CI instructions), tell me what depth you want and I will expand this file.
