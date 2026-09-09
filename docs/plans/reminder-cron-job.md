# Reminder Cron Job — Appointment & Vaccine Email Reminders

## Goal

Build a NestJS cron job service that runs daily at 8:00 AM to query the database for upcoming appointments (next 24h) and vaccines expiring soon (next 7 days), then sends email reminders to pet owners via SendGrid with retry logic and structured logging.

## Context

- **Repository**: Pain Packer Orchestrator — currently an OpenCode plugin project with no NestJS code, no `package.json`, and no `tsconfig.json`.
- **Starting point**: Brand new NestJS module. The entire NestJS scaffold must be created.
- **Dependencies to install**: `@nestjs/core`, `@nestjs/common`, `@nestjs/schedule`, `@nestjs/config`, `@nestjs/typeorm`, `@sendgrid/mail`, `typeorm`, `pg` (PostgreSQL driver), `reflect-metadata`, `rxjs`, `zod` (for validation schemas).
- **Testing framework**: Vitest (per `AGENTS.md`).
- **Language**: All code, identifiers, comments, and commits in **English only**.
- **Conventions**: `const` by default, early returns, no `any`, explicit return types, Zod for runtime validation, Conventional Commits.
- **Target structure**: NestJS app under a `reminder-service/` directory or as the root project structure (to be determined in milestone 1). Recommend root-level NestJS scaffold so it can be deployed independently.

## Milestones

### 1. Scaffold NestJS project and install dependencies

Initialize the NestJS project with all required configuration and dependencies.

- **files**:
  - `package.json`
  - `tsconfig.json`
  - `tsconfig.build.json`
  - `nest-cli.json`
  - `.env` (with placeholder values)
  - `.env.example` (documented template)
  - `src/main.ts`
  - `src/app.module.ts`
  - `src/app.service.ts`
  - `src/app.controller.ts`
- **verification**:
  - `npm install` completes without errors.
  - `npm run build` compiles successfully.
  - `npm run start:dev` boots the NestJS app on port 3000.
  - Hitting `GET /` returns expected response.
- **commit**: `feat(reminders): scaffold nestjs project with base configuration`

---

### 2. Configure environment variables and validation

Set up `@nestjs/config` with Zod-based validation to ensure all required env vars are present at startup.

- **files**:
  - `src/config/env.validation.ts` (Zod schema for env vars)
  - `src/config/env.config.ts` (ConfigModule registration)
  - `src/app.module.ts` (update to use ConfigModule.forRoot with validation)
  - `.env` (add `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`, `DATABASE_URL`, `CRON_SCHEDULE`)
  - `.env.example` (update with all variables documented)
- **env vars to validate**:
  - `SENDGRID_API_KEY` — string, required
  - `SENDGRID_FROM_EMAIL` — string, required, email format
  - `SENDGRID_FROM_NAME` — string, optional, defaults to "Pain Packer"
  - `DATABASE_URL` — string, required, postgres connection string
  - `CRON_SCHEDULE` — string, optional, defaults to `0 8 * * *`
- **verification**:
  - App starts normally with valid `.env`.
  - App throws a clear validation error on startup if a required var is missing.
  - `CRON_SCHEDULE` defaults to `0 8 * * *` when not set.
- **commit**: `feat(reminders): add env validation with zod schemas`

---

### 3. Create database entities (TypeORM)

Define the TypeORM entities for appointments, pets, owners, and vaccines.

- **files**:
  - `src/entities/owner.entity.ts` (id, name, email, phone, createdAt)
  - `src/entities/pet.entity.ts` (id, name, species, breed, ownerId → Owner, createdAt)
  - `src/entities/appointment.entity.ts` (id, petId → Pet, scheduledAt, reason, status, createdAt)
  - `src/entities/vaccine.entity.ts` (id, petId → Pet, vaccineName, appliedAt, nextDueAt, doseNumber, createdAt)
  - `src/entities/reminder-log.entity.ts` (id, entityType — "appointment" | "vaccine", entityId, ownerId, channel — "email" | "sms", status — "sent" | "failed", sentAt, errorMessage, retryCount)
  - `src/app.module.ts` (register TypeORM with forRootAsync using DATABASE_URL)
- **verification**:
  - TypeScript compiles with no errors.
  - Entities are properly decorated and relationships are bidirectional where needed.
  - TypeORM connection initializes on app bootstrap (check logs).
- **commit**: `feat(reminders): add typeorm entities for appointments, pets, owners, vaccines, and reminder logs`

---

### 4. Create the RemindersService with cron job and query logic

Implement the core service that queries the database and orchestrates the reminder flow.

- **files**:
  - `src/reminders/reminders.module.ts`
  - `src/reminders/reminders.service.ts` (main service with @Cron decorator)
  - `src/reminders/reminders.types.ts` (Zod schemas and types for ReminderItem, SendResult)
  - `src/reminders/queries/find-upcoming-appointments.ts` (TypeORM query: appointments where `scheduledAt` is within next 24h and status is not cancelled)
  - `src/reminders/queries/find-expiring-vaccines.ts` (TypeORM query: vaccines where `nextDueAt` is within next 7 days and `nextDueAt > now`)
  - `src/reminders/queries/find-reminder-logs.ts` (query to check if a reminder was already sent today for a given entity)
  - `src/app.module.ts` (import RemindersModule)
- **cron behavior**:
  - Decorated with `@Cron('0 8 * * *')` (configurable via `CRON_SCHEDULE` env var).
  - On each tick: (1) query upcoming appointments, (2) query expiring vaccines, (3) deduplicate against today's reminder logs, (4) send emails for each, (5) log results.
- **verification**:
  - TypeScript compiles.
  - Manual test: insert test data into DB, trigger the cron job manually by calling `handleReminders()`, confirm queries return correct results.
  - Deduplication works: running twice does not send duplicate reminders.
- **commit**: `feat(reminders): add reminders service with cron job and database queries`

---

### 5. Implement SendGrid email service

Create a dedicated email service that formats and sends reminder emails via SendGrid.

- **files**:
  - `src/email/email.module.ts`
  - `src/email/email.service.ts` (sendReminderEmail method, template formatting)
  - `src/email/email.types.ts` (Zod schemas for EmailPayload, EmailConfig)
  - `src/email/templates/appointment-reminder.ts` (HTML template for appointment reminders)
  - `src/email/templates/vaccine-reminder.ts` (HTML template for vaccine reminders)
  - `src/reminders/reminders.module.ts` (import EmailModule)
- **email content**:
  - **Appointment reminder**: owner name, pet name, appointment date/time, reason, clinic name.
  - **Vaccine reminder**: owner name, pet name, vaccine name, due date, dose number.
  - Clean, readable HTML with inline styles (no external CSS).
- **verification**:
  - TypeScript compiles.
  - Unit test: mock `@sendgrid/mail`, verify `send` is called with correct payload structure.
  - Manual test: send a test email to verify formatting renders correctly.
- **commit**: `feat(reminders): implement sendgrid email service with templates`

---

### 6. Add retry logic with exponential backoff

Implement retry mechanism for failed email sends using exponential backoff.

- **files**:
  - `src/common/retry.ts` (generic retry utility with exponential backoff)
  - `src/common/retry.test.ts` (unit tests for retry logic)
  - `src/reminders/reminders.service.ts` (integrate retry around email send calls)
  - `src/reminders/reminders.types.ts` (add RetryConfig type)
- **retry config**:
  - Max retries: 3 (configurable)
  - Base delay: 1000ms
  - Exponential backoff: 1s → 2s → 4s
  - On final failure: log error to `reminder_logs` table with status "failed" and error message.
- **verification**:
  - Unit tests pass for retry utility (success on 1st, 2nd, 3rd try, and total failure).
  - When SendGrid returns a 5xx error, the service retries up to 3 times before logging failure.
  - Structured error context is logged (entity type, entity ID, error message, retry count).
- **commit**: `feat(reminders): add retry logic with exponential backoff`

---

### 7. Create reminder log persistence

Ensure every send attempt (success or failure) is recorded in the database.

- **files**:
  - `src/reminders/reminders.service.ts` (log each send attempt to `reminder_logs`)
  - `src/reminders/queries/create-reminder-log.ts` (insert query)
  - `src/reminders/queries/find-todays-logs.ts` (query to find logs for today, used for deduplication)
- **log fields**:
  - `entityType`: "appointment" | "vaccine"
  - `entityId`: the appointment or vaccine ID
  - `ownerId`: the owner who received the reminder
  - `channel`: "email" (extensible to "sms" later)
  - `status`: "sent" | "failed"
  - `sentAt`: timestamp
  - `errorMessage`: null on success, error details on failure
  - `retryCount`: number of retries attempted
- **verification**:
  - After a successful send, a row exists in `reminder_logs` with status "sent".
  - After a failed send (all retries exhausted), a row exists with status "failed" and error message populated.
  - Running the cron job twice does not create duplicate logs for the same entity on the same day.
- **commit**: `feat(reminders): add reminder log persistence and deduplication`

---

### 8. Add unit and integration tests

Write comprehensive tests for all service components.

- **files**:
  - `src/reminders/reminders.service.test.ts` (unit tests with mocked TypeORM and EmailService)
  - `src/email/email.service.test.ts` (unit tests with mocked SendGrid)
  - `src/common/retry.test.ts` (already created in milestone 6, update if needed)
  - `src/config/env.validation.test.ts` (unit tests for Zod schemas)
  - `vitest.config.ts` (Vitest configuration)
- **test cases**:
  - `RemindersService.handleReminders`: queries correctly, deduplicates, sends emails, logs results.
  - `RemindersService.handleReminders`: handles empty results gracefully (no appointments/vaccines due).
  - `EmailService.sendReminderEmail`: formats HTML correctly, calls SendGrid with proper config.
  - `EmailService.sendReminderEmail`: throws on SendGrid API error.
  - `retry`: succeeds on first attempt, retries on failure, gives up after max retries.
  - `env validation`: passes with valid env, fails with missing required vars.
- **verification**:
  - `npm run test` passes all tests.
  - `npm run test:coverage` shows reasonable coverage for services and utilities.
- **commit**: `test(reminders): add unit and integration tests for reminder services`

---

### 9. Add manual trigger endpoint and documentation

Create a manual trigger endpoint for testing and add comprehensive documentation.

- **files**:
  - `src/reminders/reminders.controller.ts` (POST `/reminders/trigger` — manually invokes `handleReminders()`)
  - `src/reminders/reminders.module.ts` (register controller)
  - `README.md` (project setup, env vars, running, testing, deployment notes)
  - `.env.example` (final version with all vars documented)
- **verification**:
  - `POST /reminders/trigger` returns 200 with summary of reminders sent.
  - README documents: installation, env setup, running locally, running in production, testing.
- **commit**: `feat(reminders): add manual trigger endpoint and project documentation`

---

### 10. Update .gitignore and finalize project structure

Ensure the project is clean and ready for deployment.

- **files**:
  - `.gitignore` (add `node_modules/`, `dist/`, `.env`, coverage output)
  - `package.json` (add scripts: `build`, `start`, `start:dev`, `test`, `test:coverage`, `lint`)
- **verification**:
  - `npm run build` produces `dist/` output.
  - `dist/` is in `.gitignore`.
  - `.env` is in `.gitignore`.
  - `npm test` passes.
  - Full flow works: start app → insert test data → call `POST /reminders/trigger` → verify email received → check `reminder_logs` table.
- **commit**: `chore(reminders): finalize project structure and gitignore`

## Test Strategy

- **Unit tests** (Vitest):
  - `RemindersService`: mock TypeORM repositories and `EmailService`, verify query calls, deduplication, and logging.
  - `EmailService`: mock `@sendgrid/mail`, verify send calls and HTML formatting.
  - `retry` utility: test success, partial failure, total failure, and timeout scenarios.
  - `env.validation`: test Zod schema with valid/invalid inputs.
- **Integration tests** (Vitest, mocked external services):
  - Full `handleReminders` flow with mocked DB results and mocked SendGrid.
  - Verify end-to-end: query → dedup → send → log.
- **Manual verification**:
  - Boot the app locally with real `.env`.
  - Insert test appointments and vaccines into the database.
  - Call `POST /reminders/trigger` and verify email delivery.
  - Check `reminder_logs` table for correct entries.
  - Test retry by temporarily using an invalid SendGrid API key.

## Risks

- **SendGrid rate limits**: Free tier allows 100 emails/day. High-volume scenarios need a paid plan or batching logic (not in scope but documented).
- **Database connection pooling**: TypeORM connection pool size should be tuned for production. Default settings may not handle concurrent cron executions.
- **Timezone handling**: The cron schedule `0 8 * * *` runs in the server's local timezone. If the server is UTC and users are in a different timezone, the 8 AM may not be correct. Mitigation: document timezone requirement, consider adding a `TZ` env var.
- **SMS not implemented**: The task mentions SMS but only email (SendGrid) is in scope. The `channel` field in `reminder_logs` is designed for future SMS expansion.
- **No authentication on trigger endpoint**: `POST /reminders/trigger` has no auth. In production, this should be behind an API key or internal-only network. Documented as a known limitation.
- **Entity schema mismatch**: The entity definitions assume a specific database schema. If the existing database has different column names or types, entities will need adjustment. Mitigation: document assumed schema in README.
