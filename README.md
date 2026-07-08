# Holidays.com — Full-Stack Hotel Booking Platform

**Currently Deployed:** [https://hotel-booking-app-vql7.onrender.com](https://hotel-booking-app-vql7.onrender.com)

**Test Credentials (to see protected routes):**
*   **Email:** `test1@gmail.com`
*   **Password:** `Test@123`

A full-stack hotel booking management application built with **TypeScript** across the entire stack. Hotel owners can register, manage their properties with image uploads, and guests can search, browse, and book accommodations.

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
frontend/      React SPA (Vite dev server, port 5174)
e2e-tests/     Playwright end-to-end tests
```

**Backend** follows an MVC-ish pattern:
- **Models** — Mongoose schemas for `User` and `Hotel`
- **Routes/Controllers** — Inline controller logic in route handlers
- **Middleware** — JWT verification guard
- **Shared Types** — TypeScript interfaces consumed by both backend and frontend (`UserType`, `HotelType`, `HotelSearchResponse`)

**Frontend** uses Context API (`AppContext`, `SearchContext`) for global state and react-query for server-state caching and synchronization. Protected routes redirect unauthenticated users to sign-in.

Production build serves the frontend bundle as static files from the Express server.

---

## Key Features

- **JWT Authentication** — Register, login, logout with HttpOnly cookie-based tokens (1-day expiry)
- **Hotel CRUD** — Full create, read, update, and list functionality for hotel owners
- **Image Upload** — Upload up to 6 images per hotel via Cloudinary CDN (5MB limit per file)
- **Hotel Types** — 16 categories (Budget, Luxury, Beach Resort, etc.)
- **Facilities** — 8 amenity checkboxes (Free WiFi, Pool, Spa, etc.)
- **Hotel Search** — Filter by destination, dates, guests, star rating, type, facilities, and max price with sort and pagination
- **Hotel Detail Page** — Full hotel view with image gallery, facilities, and an inline booking panel (date picker, guest selector, live price total)
- **Booking Flow** — Checkout page with booking summary and a card payment confirmation form; pre-fills logged-in user's details
- **Auth-aware CTAs** — Unauthenticated users see "Login to Book" instead of "Book Now"
- **Home Page** — Latest hotel listings grid linking to detail pages
- **Responsive UI** — Tailwind CSS utility classes, mobile-friendly layout
- **Toast Notifications** — Auto-dismissing success/error toasts
- **E2E Testing** — Playwright tests covering auth and hotel management flows
- **Validation** — Both client-side (react-hook-form) and server-side (express-validator)

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/register` | No | Register new user |
| GET | `/api/users/me` | Yes | Get current user profile |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/validate-token` | Yes | Verify JWT cookie |
| POST | `/api/auth/logout` | No | Clear auth cookie |
| GET | `/api/hotels/search` | No | Search hotels with filters |
| GET | `/api/hotels/:id` | No | Get single hotel (public) |
| GET | `/api/my-hotels` | Yes | List user's hotels |
| POST | `/api/my-hotels` | Yes | Create hotel (multipart) |
| GET | `/api/my-hotels/:id` | Yes | Get hotel by ID (owner) |
| PUT | `/api/my-hotels/:id` | Yes | Update hotel (multipart) |

---

## Running Locally

```bash
# Backend
cd backend
npm install
npm run dev          # http://localhost:7000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev          # http://localhost:5174
```

> Both servers must run simultaneously during development. The frontend dev server is pinned to port **5174** to match the backend's CORS config.

**Required environment variables — `backend/.env`:**
```
DB_CONNECTION_STRING=   # MongoDB Atlas URI
JWT_SECRET_KEY=         # JWT signing secret
FRONTEND_URL=http://localhost:5174
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Required environment variables — `frontend/.env`:**
```
VITE_API_BASE_URL=http://localhost:7000
```

---

## Code Quality

- **Full TypeScript** — Strict mode, shared types between frontend and backend
- **Component Decomposition** — Hotel form split into 5 focused sub-components; booking page split into `BookingDetailsSummary` and `BookingForm`
- **Custom Hooks** — `useAppContext`, `useSearchContext` for clean state consumption
- **Error Handling** — try/catch on all async routes, consistent error responses
- **Security** — Passwords hashed with bcrypt (salt rounds: 8), JWT in HttpOnly cookies, CORS configured, Mongoose ObjectId validation on public routes
- **Linting** — ESLint with typescript-eslint flat config

---

## Pages / Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/` | No | Home — latest hotel listings |
| `/search` | No | Search results with filters, sort, and pagination |
| `/detail/:hotelId` | No | Hotel detail — images, facilities, booking panel |
| `/booking/:hotelId` | Yes | Checkout — booking summary + payment form |
| `/register` | No | User registration |
| `/sign-in` | No | User login |
| `/add-hotel` | Yes | Add a new hotel |
| `/edit-hotel/:hotelId` | Yes | Edit existing hotel |
| `/my-hotels` | Yes | List my hotels |
| `/my-bookings` | Yes | My bookings (in progress) |

---

## Status

| Phase | Description | Status |
|-------|-------------|--------|
| **Auth & Hotel CRUD** | Register, login, logout, create/edit/list hotels, image upload | ✅ Complete |
| **Search & Discovery** | Hotel search with filters, sort, pagination; detail page | ✅ Complete |
| **Booking UI** | Checkout page, booking summary, card form, user pre-fill | ✅ Complete |
| **Booking Backend** | Booking model, creation route, My Bookings page | 🔄 In Progress |
| **Payment** | Stripe integration, payment-intent flow, webhook | ⏳ Planned |
| **Hardening** | Rate limiting, helmet, centralized error handling | ⏳ Planned |
