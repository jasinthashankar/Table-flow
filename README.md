# TableFlow

**Restaurant Reservation and Operations Management System**

TableFlow is a premium full-stack MERN application for coordinating restaurant reservations, table availability, waitlists, customer records, and in-restaurant service requests. It is designed as a professional operations product rather than a food-ordering or e-commerce website.

## Core modules

- Secure guest and administrator authentication
- Guest reservation creation, history, details, updates, and cancellation
- Admin reservation registry with table assignment and status workflows
- Restaurant table CRUD with capacity, location, seating type, and operational status
- Guest waitlist entry and administrator queue management
- Service-request tickets linked to active dining reservations
- Live guest and administrator dashboards backed by MongoDB Atlas
- Responsive premium UI with role-aware navigation and accessible states

## MERN stack

| Layer | Technology |
|---|---|
| Database | MongoDB Atlas + Mongoose |
| Backend | Node.js + Express |
| Frontend | React + Vite |
| State | Zustand |
| Validation | Zod + React Hook Form |
| Authentication | JWT in HTTP-only cookies |
| Styling | Tailwind CSS v4 + custom design system |

## Project structure

```text
tableflow/
├── client/   # React application
├── server/   # Express API and Mongoose models
├── package.json
└── README.md
```

## Local setup

### 1. Install dependencies

```bash
npm install
npm run install:all
```

### 2. Configure the backend

Copy the environment template:

```bash
copy server\.env.example server\.env
```

Set the following values inside `server/.env`:

```env
MONGODB_URI=mongodb+srv://...
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_DAYS=7
```

Never commit `server/.env`.

### 3. Seed restaurant tables

```bash
npm run seed:tables --prefix server
```

### 4. Optional administrator account

Add `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` to `server/.env`, then run:

```bash
npm run seed:admin --prefix server
```

### 5. Start TableFlow

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health endpoint: `http://localhost:5000/api/health`

## Main routes

### Guest

- `/dashboard`
- `/reservations`
- `/reservations/new`
- `/waitlist`
- `/service-requests`
- `/profile`

### Administrator

- `/admin/dashboard`
- `/admin/reservations`
- `/admin/tables`
- `/admin/waitlist`
- `/admin/service-requests`
- `/admin/customers`

## Security notes

- Authentication tokens are stored only in HTTP-only cookies.
- Public registration always creates a customer role.
- Admin routes are protected through server-side role checks.
- Request bodies and query parameters are validated using Zod.
- MongoDB connection strings and JWT secrets remain in ignored environment files.

## Build

```bash
npm run build:client
```

## Academic project classification

**A MERN-based Restaurant Reservation and Operations Management CRUD System.**
