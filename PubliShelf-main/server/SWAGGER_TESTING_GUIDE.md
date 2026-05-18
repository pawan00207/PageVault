# Swagger UI Testing Guide

This guide walks you through testing the Swagger UI for PubliShelf and explains each UI feature so you can validate the documentation end-to-end.

## 1) Start the Backend

1. Ensure MongoDB and (optionally) Redis are running.
2. Start the server:

```bash
cd server
npm run dev
```

Once the server logs show **“Server running on port …”**, the UI is ready.

## 2) Open Swagger UI

- Open `http://localhost:3000/api-docs` (replace `3000` if your `PORT` differs).
- You should see tags such as **Authentication**, **Buyer**, **Publisher**, **Manager**, **Admin**, **System**, **Auctions**.

## 3) Understand the Key UI Controls

### ✅ Explore (Search)
- Lets you filter endpoints quickly.
- Type keywords like `login`, `buyer`, `auction` to narrow down the list.

### ✅ Authorize
- Used to store authentication credentials.
- This project uses **cookie-based JWT**, so you typically **don’t paste a token here**.
- Instead:
  1. Call `POST /api/auth/login` with valid credentials.
  2. Swagger stores the cookie automatically.
  3. Protected routes can now be tested.

### ✅ Lock Icons (🔒)
- A lock icon means the route requires authentication.
- After login, locks effectively become “unlocked” for your session.
- Public routes do **not** show a lock.

### ✅ Try it out
- Allows you to send real requests from the UI.
- Click **Try it out** → fill parameters/body → click **Execute**.
- The UI shows:
  - request URL
  - request body
  - response body
  - status code

### ✅ Models / Schemas
- Located at the bottom or inside each endpoint.
- Shows the request/response structure defined in OpenAPI schemas.
- Useful for confirming field names and data types.

## 4) Test Public Endpoints (No Login Needed)

Suggested calls:
- `GET /api/home/data`
- `GET /ready`
- `GET /health`
- `POST /api/auth/login` (with credentials)

These should run without the lock icon.

## 5) Test Protected Endpoints (Requires Login)

1. Run `POST /api/auth/login` with a valid user.
2. Verify response status is 200.
3. Now test protected endpoints like:
   - `GET /api/buyer/profile`
   - `GET /api/buyer/cart`
   - `GET /api/manager/dashboard`
   - `GET /api/admin/analytics`

If you skip login, these should return **401 Unauthorized**.

## 6) Validate Error Scenarios

Try sending invalid payloads (e.g., missing fields) and confirm:
- Status code is **400** or **422**.
- Response follows `{ success: false, message, data }` format.

## 7) Validate File Upload Endpoints

For multipart routes:
- `POST /api/publisher/publish-book`
- `POST /api/publisher/sell-antique`

Use **Try it out**, attach files, and check response codes.

## 8) Check the Raw Spec

Open `http://localhost:3000/api-docs.json` to verify:
- `paths` is populated
- `components.schemas` is present
- `tags` list is visible

## 9) Troubleshooting

### Swagger page won’t load
- Confirm server is running.
- Check logs for errors.

### Locked endpoints stay locked after login
- Ensure login succeeded (200 response).
- Confirm cookies are enabled in browser.

### ECONNREFUSED errors
- MongoDB/Redis not running. Start services or update `.env`.

---

If you want automated smoke tests for Swagger validation, I can add them.
