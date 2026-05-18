# PubliShelf Unit Testing Implementation Plan (Jest)

This document lists the **planned changes** required to introduce robust Jest-based unit testing for both backend and frontend, aligned with the requirements provided.

---

## 1) Goals & Coverage Requirements

- **Backend**: Authentication, middleware behavior, critical services/controllers with mocked dependencies, and mocked DB interactions. OTP flows, password reset, and payment logic are deferred until implementations are available.
- **Frontend**: Component rendering, form validation, conditional rendering, API interaction logic, state updates, and user flows. OTP-specific behavior is deferred until OTP UI exists.
- **Testing focus**: Behavior and logic, not snapshots.

---

## 2) Backend (server/) — Planned Changes

### 2.1 Dependencies to add
- `jest`
- `supertest` (controller integration-style unit tests with mocked services)
- `jest-mock-extended` (structured mocks)
- `mockingoose` or custom Mongoose mocks
- `cross-env` (if needed for test env on Windows)

### 2.2 Config & scripts
- Create `server/jest.config.js` with:
  - `testEnvironment: "node"`
  - `moduleNameMapper` for ESM if needed
  - `collectCoverage` + meaningful thresholds
- Add `server/package.json` scripts:
  - `test`: `jest --runInBand`
  - `test:watch`: `jest --watch`
  - `test:coverage`: `jest --coverage`

### 2.3 Test folder structure
```
server/
  __tests__/
    controllers/
    services/
    middleware/
    utils/
  __mocks__/
```

### 2.4 Core test targets (must-have)
- **Authentication controllers**
  - login success/fail
  - token cookie behavior
- **OTP service** (deferred until module exists)
  - generation / verification / expiry
- **Password reset logic** (deferred until module exists)
  - token creation, invalid token, expiry
- **Payments** (deferred until gateway module exists)
  - success & failure paths with mocked provider
- **Middleware**
  - `protect`, `authorize`, `checkAdminKey` positive/negative cases
- **Service layer**
  - Buyer / Publisher / Manager / Admin critical services
- **Controller tests**
  - Ensure service failures are caught and correct status codes returned

### 2.5 Mock strategy
- Mock DB calls (Mongoose): `jest.spyOn` or `mockingoose`
- Mock external services: Cloudinary, Redis, payment gateways
- Mock JWT verification/generation for auth tests

---

## 3) Frontend (client/) — Planned Changes

### 3.1 Dependencies to add
- `jest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `jest-environment-jsdom`
- `axios-mock-adapter` or manual mocks for API calls

### 3.2 Config & scripts
- Add `client/jest.config.js` with:
  - `testEnvironment: "jsdom"`
  - proper JSX transform handling
- Add `client/package.json` scripts:
  - `test`: `jest`
  - `test:watch`: `jest --watch`
  - `test:coverage`: `jest --coverage`

### 3.3 Test folder structure
```
client/src/__tests__/
  components/
  pages/
  hooks/
  services/
  store/
```

### 3.4 Core test targets (must-have)
- **Auth forms** (login/signup): validation, error states, submission
- **OTP component** (deferred until OTP UI exists): input behavior, success/error message
- **Conditional rendering**: loaders, error banners, empty states
- **API services**: mock axios responses, verify calls + error handling
- **State updates**: Redux slices or Context providers
- **Critical flows**: add to cart, wishlist, checkout buttons

### 3.5 Mock strategy
- Mock axios instance in `client/src/utils/axiosInstance.util.js`
- Mock Redux store providers for connected components
- Use `jest.mock` for hooks + navigation when required

---

## 4) Documentation Changes

- Add `TESTING_GUIDE.md` (root): how to run backend + frontend tests, coverage, mocks, and troubleshooting.
- Add per-layer guidance in `server/` and `client/` as needed.

---

## 5) Quality Gates (Academic-Level)

- Minimum coverage thresholds (example):
  - Backend: 75% statements/lines
  - Frontend: 70% statements/lines
- Tests must assert **business outcomes**, not only snapshots.
- Fail CI if coverage is below thresholds.

---

## 6) Deliverables Summary

- Jest config files for both `server/` and `client/`.
- Structured test folders with meaningful unit tests.
- Mock utilities for DB, API, and external integrations.
- Scripts to run tests + coverage.
- Clear documentation on how to extend tests.

---

When you approve, I will implement the above changes and begin writing the first batch of critical tests (auth, OTP, middleware, services, and UI flows).
