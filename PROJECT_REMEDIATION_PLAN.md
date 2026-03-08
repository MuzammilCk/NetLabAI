# NetLabAI – Phased Remediation Plan

## Phase 0: Stabilize execution and environment (Immediate)

### Issues found
1. Production start script used `node server.ts`, which is unreliable for TypeScript execution across Node runtimes.
2. Runtime depends on `GEMINI_API_KEY`, but setup docs do not clearly enforce validation at process startup.

### Solutions
1. Run the server using `tsx server.ts` for consistent TypeScript execution.
2. Add startup-time environment validation (fail fast if `GEMINI_API_KEY` is missing in non-local mocked mode).

---

## Phase 1: API correctness and resilience

### Issues found
1. Front-end fetch handlers accepted non-2xx responses as valid payloads if content type happened to be JSON.
2. Several UI paths assumed deep payload fields exist (`experiment.code.files[0]`) and could crash on malformed content.
3. API input validation is minimal (`:id` parsing, request body shape, and size limits).

### Solutions
1. Enforce `res.ok` checks before parsing payloads.
2. Guard nested optional fields in UI and provide graceful fallback states.
3. Add request validation (zod or custom schema) on server routes for IDs and POST bodies.

---

## Phase 2: Security and operational hardening

### Issues found
1. Express app lacks baseline security middlewares for headers/rate limiting.
2. SSE and chat endpoints can be abused without throttling.
3. Error messages can leak upstream provider details.

### Solutions
1. Add `helmet`, `cors` (scoped), and `express-rate-limit`.
2. Add route-level rate limits for AI endpoints and payload size limits.
3. Return normalized user-facing errors while logging structured internal errors server-side.

---

## Phase 3: Type safety and maintainability

### Issues found
1. TypeScript configuration is permissive (`strict` disabled), allowing latent defects.
2. Front-end state uses `any` for core objects.
3. Data contracts between `content/*.json`, server, and UI are implicit.

### Solutions
1. Enable strict TS incrementally (`strict`, then `noUncheckedIndexedAccess`).
2. Introduce shared interfaces for experiment/simulation/practice payloads.
3. Add contract validation for content JSON at startup or CI.

---

## Phase 4: UX quality and product completeness

### Issues found
1. Top-nav contained a dead `Exam Mode` link.
2. No explicit error views for unavailable experiment content.
3. No empty-state guidance when simulations/practice are missing.

### Solutions
1. Replace dead navigation with disabled state until feature is implemented.
2. Add consistent loading/error/empty components.
3. Add feature flags for incomplete modules.

---

## Phase 5: Test strategy and CI gatekeeping

### Issues found
1. No automated tests currently gate regressions.
2. Build and typecheck are run manually.

### Solutions
1. Add minimum test pyramid:
   - unit tests for data transformation and helpers,
   - API integration tests for server routes,
   - Playwright smoke tests for dashboard and experiment flow.
2. Add CI workflow to run lint/build/tests on every PR.

---

## Phase 6: Performance and scalability

### Issues found
1. Content is repeatedly read from disk on requests.
2. AI route handlers recreate model clients on each request.

### Solutions
1. Cache static content in memory with optional file-watch invalidation in development.
2. Reuse initialized AI client instance and add timeout/retry policies.

---

## Priority implementation order
1. **P0:** Execution reliability + fetch response handling + null guards.
2. **P1:** Input validation + security middleware + rate limits.
3. **P2:** Shared types + strict TS rollout + automated tests.
4. **P3:** UX/feature-completeness and performance optimization.
