# Backend Unit Test Report

Date: 2025-11-20

## Aim

Write, run and document unit tests for five non-repetitive units in the backend so the project has deterministic, automated checks that can run in CI without a real database. The report includes implementation notes, a test-case table, detailed per-test descriptions, and instructions to reproduce the test run.

## Units selected
- Error handler (`src/middlewares/error-handler.ts`)
- DTO validator middleware (`src/middlewares/validator.middleware.ts`)
- Rate-limiter config (`src/middlewares/rate-limiter.ts`)
- Auth middleware (authenticate / authorize) (`src/middlewares/auth.middleware.ts`)
- Upload controller (CSV import) (`src/controllers/upload.controller.ts`)

## Implementation summary

- Added unit tests under `backend/src/__tests__/` using Jest. Files added:
  - `error-handler.test.ts`
  - `validator.middleware.test.ts`
  - `rate-limiter.test.ts`
  - `auth.middleware.test.ts`
  - `upload.controller.test.ts`

- Updated `auth.test.ts` to mock database initialization (`AppDataSource`) and `bcrypt` for deterministic endpoint testing.

- Mocks used across tests:
  - `AppDataSource.getRepository` returns a shared mock repository so imports that call `getRepository` on module load don't attempt real DB operations.
  - `bcryptjs` mocked to control password checking.
  - `jsonwebtoken` mocked where token verification is required.
  - `express-rate-limit` mocked to capture options passed to it.
  - `ProductService` mocked for upload controller tests.
  - `class-validator` and `class-transformer` mocked for DTO validator tests.

## How to run tests locally

From project root (PowerShell):

```powershell
cd .\backend\
npm install
npm run test
```

To get verbose Jest output:

```powershell
npx jest --verbose
```

Note: Tests are written so they do not require a running Postgres instance. Mocks are applied to prevent database initialization.

---

## Representative test-case table (5 examples)

| Sr.No. | Description | Input | Expected Output | Actual Output (observed) | Success/Failure |
|---:|---|---|---|---|---:|
| 1 | AppError handling returns status & message | `new AppError('Not found', 404)` passed to `errorHandler` | status 404 and JSON `{ status: 'error', message: 'Not found' }` | status 404 and JSON matched expected | Success |
| 2 | Validator middleware forwards validation errors | Mock `class-validator.validate` to return error array for `req.body = { name: '' }` | Middleware calls `next(errors)` | `next` called with error array | Success |
| 3 | Rate limiter parses env variables | ENV: `RATE_LIMIT_WINDOW_MS=60000`, `RATE_LIMIT_MAX_REQUESTS=10` | `rateLimiter` options include `windowMs:60000, max:10` | Mocked `express-rate-limit` returned an options object with windowMs 60000 and max 10 | Success |
| 4 | Auth middleware attaches user on valid token | Header `Authorization: Bearer token`, `jwt.verify` → `{ userId: 'u1' }`, repo returns active user | `req.user` set and `next()` called | `req.user` set to mocked user and `next()` called | Success |
| 5 | Upload controller parses CSV and returns count | `req.file.buffer` contains CSV with two rows | `res.json({ status:'success', data: { count: 2 } })` | `res.json` called with `status:'success'` and `data.count === 2` | Success |

---

## Detailed tests and rationale (per unit)

### 1) Error handler
- Purpose: verify correct formatting of AppError, validation errors array, and unknown errors.
- Tests implemented:
  - AppError path: create `AppError('Not found', 404)` and assert `res.status(404).json({ status:'error', message: 'Not found' })`.
  - Validation array: pass a fake validation error array and assert `status(400)` and `json` includes an `errors` array and message `Validation failed`.
  - Unknown error (development): set `NODE_ENV='development'` and pass `new Error('Something broke')`; assert `status(500)` and `message` contains `'Something broke'`.

### 2) DTO validator middleware (`validateDto`)
- Purpose: ensure input is transformed and validated; on failure forward errors; on success replace `req.body` with DTO instance and call next.
- Tests implemented:
  - When `class-validator.validate` returns errors, `next(errors)` is called.
  - When `validate` returns `[]`, `req.body` becomes the transformed DTO created by `plainToInstance` and `next()` is called.
- Mocks: `class-validator.validate`, `class-transformer.plainToInstance`.

### 3) Rate limiter
- Purpose: ensure `RATE_LIMIT_*` environment variables are parsed and passed to `express-rate-limit`.
- Test implemented: set environment variables in the test, mock `express-rate-limit` to return whatever options are passed, then require the `rate-limiter` and assert returned object has `windowMs` and `max` set to parsed numeric values.

### 4) Auth middleware
- Purpose: cover missing token, invalid token, inactive/no user, valid token & active user. Also test `authorize(...)` role checks.
- Tests implemented:
  - Missing Authorization header -> respond 401 with `{ message: 'Authentication required' }`.
  - `jwt.verify` throws -> respond 401 with `{ message: 'Invalid token' }`.
  - `jwt.verify` returns payload and repo returns null/inactive -> 401 with `{ message: 'Invalid or inactive user' }`.
  - `jwt.verify` returns payload and repo returns active user -> `req.user` set and `next()` called.
  - `authorize` tests: missing `req.user` -> 401; insufficient role -> 403; allowed role -> next called.
- Mocks: `jsonwebtoken.verify`, shared repo returned by `AppDataSource.getRepository`.

### 5) Upload controller
- Purpose: test error when no file, and successful CSV parsing path.
- Tests implemented:
  - No file: call `uploadProducts` with `req` that has no `file` and assert `next` was called with `AppError('No file uploaded')`.
  - CSV parsing: provide `req.file.buffer` with a small CSV (two rows). `ProductService.create` is mocked to resolve successfully. Because the controller uses a stream and `csv-parser` events, the test captures `res.json` and waits until it's called, then asserts `status: 'success'` and `data.count === 2`.
- Mocks: `ProductService.create` mocked to avoid DB writes.

## Observed results (test run output)

When I ran `npm run test` in the `backend` folder in this session the result summary was:

```
PASS  src/__tests__/ping.test.ts
PASS  src/__tests__/rate-limiter.test.ts
PASS  src/__tests__/error-handler.test.ts
PASS  src/__tests__/validator.middleware.test.ts
PASS  src/__tests__/upload.controller.test.ts
PASS  src/__tests__/auth.middleware.test.ts
PASS  src/__tests__/health.test.ts
PASS  src/__tests__/auth.test.ts

Test Suites: 8 passed, 8 total
Tests:       20 passed, 20 total
Time:        5.41 s
```

This confirms the Actual Output column in the table above for the representative cases.

## Files added / modified by these tests

- Added tests (under `backend/src/__tests__/`):
  - `error-handler.test.ts`
  - `validator.middleware.test.ts`
  - `rate-limiter.test.ts`
  - `auth.middleware.test.ts`
  - `upload.controller.test.ts`
- Modified:
  - `auth.test.ts` (mocked DB and `bcrypt` for deterministic endpoint checks).

## Recommendations & next steps

- Add production-mode test to `errorHandler` to ensure the message is friendly when `NODE_ENV = 'production'`.
- Add tests for additional services: `product.service`, `order.service`, and `inventory.service` to raise overall coverage.
- Optionally add integration tests using a test Postgres instance (docker/testcontainers) for end-to-end verification.
- Add CI job (GitHub Actions) to run backend tests on push/PR.

If you want, I can add a `backend/.github/workflows/test.yml` workflow file and create a repo-level `TEST_REPORT.md` update as a PR. Tell me if you want CI included.

---

End of report.
