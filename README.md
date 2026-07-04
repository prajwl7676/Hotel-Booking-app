# Holidays.com — Full-Stack Hotel Booking Platform

**Currently Deployed:** [https://hotel-booking-app-vql7.onrender.com](https://hotel-booking-app-vql7.onrender.com)

**Test Credentials (to see protected routes):**
*   **Email:** `test1@gmail.com`
*   **Password:** `Test@123`

A full-stack hotel booking management application built with **TypeScript** across the entire stack. Hotel owners can register, manage their properties with image uploads, and guests can search and book accommodations.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express 4, TypeScript |
| **Database** | MongoDB (Atlas), Mongoose ODM |
| **Auth** | JWT (HttpOnly cookies), bcryptjs |
| **File Upload** | Multer → Cloudinary (base64) |
| **Validation** | express-validator |
| **Frontend** | React 18, TypeScript, Vite 6, SWC |
| **Styling** | Tailwind CSS 3 |
| **State/Data** | react-query (TanStack), Context API |
| **Forms** | react-hook-form |
| **Routing** | react-router-dom 7 |
| **E2E Tests** | Playwright (Chromium, Firefox, WebKit) |
| **Tooling** | ESLint (flat config), PostCSS, nodemon, ts-node |

---

## Architecture

**Monorepo** with three independent packages:

```
backend/       Express REST API (port 7000)
frontend/      React SPA (Vite dev server, port 5173)
e2e-tests/     Playwright end-to-end tests
```

**Backend** follows an MVC-ish pattern:
- **Models** — Mongoose schemas for `User` and `Hotel`
- **Routes/Controllers** — Inline controller logic in route handlers
- **Middleware** — JWT verification guard
- **Shared Types** — TypeScript interfaces consumed by both backend and frontend

**Frontend** uses Context API (`AppContext`, `SearchContext`) for global state and react-query for server-state caching and synchronization. Protected routes redirect unauthenticated users to sign-in.

Production build serves the frontend bundle as static files from the Express server.

---

## Key Features

- **JWT Authentication** — Register, login, logout with HttpOnly cookie-based tokens (1-day expiry)
- **Hotel CRUD** — Full create, read, update, and list functionality for hotel owners
- **Image Upload** — Upload up to 6 images per hotel via Cloudinary CDN (5MB limit per file)
- **Hotel Types** — 16 categories (Budget, Luxury, Beach Resort, etc.)
- **Facilities** — 8 amenity checkboxes (Free WiFi, Pool, Spa, etc.)
- **Search & Filtering** — Destination, date range, and guest count search (Context + sessionStorage)
- **Responsive UI** — Tailwind CSS utility classes, mobile-friendly layout
- **Toast Notifications** — Auto-dismissing success/error toasts
- **E2E Testing** — Playwright tests covering auth and hotel management flows
- **Validation** — Both client-side (react-hook-form) and server-side (express-validator)

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/register` | No | Register new user |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/validate-token` | Yes | Verify JWT cookie |
| POST | `/api/auth/logout` | No | Clear auth cookie |
| GET | `/api/my-hotels` | Yes | List user's hotels |
| POST | `/api/my-hotels` | Yes | Create hotel (multipart) |
| GET | `/api/my-hotels/:id` | Yes | Get hotel by ID |
| PUT | `/api/my-hotels/:id` | Yes | Update hotel (multipart) |

---

## Running Locally

```bash
# Backend
cd backend
npm install
npm run dev          # http://localhost:7000

# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# E2E Tests
cd e2e-tests
npm install
npx playwright test
```

**Required environment variables:**
- `DB_CONNECTION_STRING` — MongoDB Atlas URI
- `JWT_SECRET_KEY` — JWT signing secret
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `FRONTEND_URL` — e.g. `http://localhost:5173`

---

## Code Quality

- **Full TypeScript** — Strict mode, shared types between frontend and backend
- **Component Decomposition** — Hotel form split into 5 focused sub-components (`HotelDetailSection`, `TypesSection`, `FacilitiesSection`, `GuestSection`, `ImagesSection`)
- **Custom Hooks** — `useAppContext`, `useSearchContext` for clean state consumption
- **Error Handling** — try/catch on all async routes, consistent error responses
- **Security** — Passwords hashed with bcrypt (salt rounds: 8), JWT in HttpOnly cookies, CORS configured
- **Linting** — ESLint with typescript-eslint flat config

---

## Pages / Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/` | No | Home page |
| `/search` | No | Search results (in progress) |
| `/register` | No | User registration |
| `/sign-in` | No | User login |
| `/add-hotel` | Yes | Add a new hotel |
| `/edit-hotel/:hotelId` | Yes | Edit existing hotel |
| `/my-hotels` | Yes | List my hotels |
| `/my-bookings` | Yes | My bookings (coming soon) |

---

## Status

Actively developed. Core auth and hotel management are complete. Search, booking, and payment integration are under development.
