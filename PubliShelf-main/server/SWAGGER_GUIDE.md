# Swagger / OpenAPI Guide

This document explains how the new interactive PubliShelf API documentation is structured, how to run it locally, and how to extend it as new endpoints are introduced.

## Overview

- **Location**: `/api-docs` (UI) and `/api-docs.json` (raw spec) are exposed by `server/server.js`.
- **Spec format**: OpenAPI 3.0.3 generated via `swagger-jsdoc` from the static definition stored in `server/docs`.
- **UI**: Served with `swagger-ui-express`, configured with explorer mode for quick search/filtering.

## Folder Layout

```
server/
├── config/
│   └── swagger.js          # Creates the swagger spec via swagger-jsdoc
├── docs/
│   ├── components/         # Shared schemas + security definitions
│   ├── paths/              # Path objects by domain (auth, buyer, ...)
│   └── swaggerDefinition.js# Assembles info, servers, tags, components, paths
└── SWAGGER_GUIDE.md        # (this file)
```

- `components/schemas.js` lists reusable request/response models (User, Book, Order, etc.).
- `components/index.js` adds security schemes (cookie-based JWT).
- `paths/*.js` describes major routes for authentication, buyer, publisher, manager, admin, auctions, and system health.
- `swaggerDefinition.js` stitches everything together with metadata, tags, and server definitions.

## Running Locally

1. Install backend dependencies (already done if you can run the server):
   ```bash
   cd server
   npm install
   ```
2. Start the backend (ensure `.env` + Mongo/Redis are configured):
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5000/api-docs](http://localhost:5000/api-docs) (adjust port to match `PORT` env). The interactive UI loads and can execute requests against your running API, automatically sending/receiving cookies.

The raw JSON spec is accessible at `/api-docs.json` for use with SDK generators, contract tests, or monitoring tools.

## Authoring Guidelines

- **Group by tags**: Authentication, Buyer, Publisher, Manager, Admin, Analytics, Auctions, System.
- **Reuse schemas**: Reference existing models via `$ref` (e.g., `#/components/schemas/Book`) to keep payloads consistent.
- **Security**: Protected endpoints automatically inherit `CookieAuth`. Override or remove the `security` array when the route is public.
- **Status codes**: Cover success + common error codes (401/403/404/422) and describe the business outcome.
- **Multipart endpoints**: Document file uploads using `multipart/form-data` with `binary` fields (see `publish-book` and `sell-antique`).

## Extending the Spec

1. Identify the relevant router/controller.
2. Add or update the corresponding entry inside `server/docs/paths/<domain>.js`.
3. Reuse schemas if possible; add new schema definitions to `components/schemas.js` if necessary.
4. Restart the server (or re-import `swaggerSpec`) to see changes reflected.

> Tip: to validate the spec without running the server, execute `node -e "import('./config/swagger.js').then(({default: spec}) => console.log('paths', Object.keys(spec.paths).length));"`.

## Coverage Snapshot

- **Authentication**: login/logout/me for both shared and admin flows.
- **Buyer**: signup, dashboard, search, cart, checkout, profile, addresses, auction bidding.
- **Publisher**: signup, profile, book publishing & management, antique auction submissions.
- **Manager**: signup, dashboard, profile, auction approvals, publisher lifecycle actions.
- **Admin**: analytics, dashboard, admin CRUD, manager workflow actions, publisher bans, detailed analytics (buyers, managers, publishers, books, antique books).
- **System**: readiness/health, logout helper, public home payload, analytics visit tracker, stats.

Continue iterating as new services or controllers appear so `/api-docs` remains the authoritative reference for the platform.
