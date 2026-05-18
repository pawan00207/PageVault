# PubliShelf Testing Guide (Jest)

This guide explains how to run the new unit tests for both backend and frontend, how tests are organized, and how to extend them.

---

## 1) Backend Tests (server/)

### Run all backend tests
```bash
cd server
npm test
```

### Watch mode
```bash
cd server
npm run test:watch
```

### Coverage
```bash
cd server
npm run test:coverage
```

### Test layout
```
server/__tests__/
  controllers/
  middleware/
  services/
  utils/
```

### What is covered
- Auth controllers (success & failure responses)
- Auth middleware (token validation, roles)
- Auth service login logic
- Buyer order/payment logic
- Buyer search/signup controller flows
- Book and publisher service logic
- Manager services (profile updates, approvals, guard rails)
- Admin login controller behavior
- Publisher signup + publish-book controller flows
- Manager auction/publisher moderation controller flows
- Admin platform analytics controller flow
- Error/not-found middleware responses
- JWT utilities

### Mocking
- Mongoose models are mocked in service tests.
- External integrations are isolated per unit.

---

## 2) Frontend Tests (client/)

### Run all frontend tests
```bash
cd client
npm test
```

### Watch mode
```bash
cd client
npm run test:watch
```

### Coverage
```bash
cd client
npm run test:coverage
```

### Test layout
```
client/src/__tests__/
  pages/
  services/
  store/
```

### What is covered
- Admin login form behavior (validation + submit flow)
- Auth validation rule coverage (email/password rules)
- Public 404 page navigation
- API service calls (auth, book, buyer, admin, manager, publisher services)
- Redux state flows (cart + wishlist slices)

### Mocking
- `axiosInstance` is mocked in service tests.
- `useNavigate`, Redux hooks, and action creators are mocked in UI tests.

---

## 3) Adding New Tests

1. Locate the target module (controller, service, component).
2. Add a new test file under the corresponding `__tests__` folder.
3. Mock external dependencies (`models`, `axios`, sockets, etc.).
4. Assert behavior and status codes, not snapshots.

---

## 4) Known Gaps (For Future Coverage)

The codebase currently does **not** include an explicit OTP, password-reset module, or fully implemented payment provider flow. Once those modules exist, tests should be added for:
- OTP generation + verification
- Password reset token creation + expiry
- Email/SMS integrations
- Payment gateway success/failure paths

---

If you want, I can expand test coverage to additional flows or implement integration tests after the unit test baseline is approved.
