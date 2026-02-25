# SwiftJonny POS

A full-stack Point of Sale management system built for small to medium businesses. SwiftJonny POS covers everything from ringing up a sale at the counter to reviewing monthly revenue trends from the dashboard — all in one place.

The system is split into a REST API backend and a React frontend, both written in TypeScript.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [User Roles](#user-roles)
- [Scripts](#scripts)
- [License](#license)

---

## Overview

SwiftJonny POS is designed around a two-role system: **administrators** who manage the store, and **cashiers** who process transactions at the terminal. Admins have full access to products, categories, inventory, analytics, cashier accounts, and POS configuration. Cashiers access only the POS terminal and their own profile.

Access to the system requires email verification after registration. Admin accounts additionally require manual approval before access is granted, giving the store owner full control over who can log in.

---

## Features

**Authentication & Access Control**

- User registration with email verification via Resend
- Admin approval gate before new accounts gain access
- JWT-based session management
- Forgot password and reset password via secure email tokens
- Role-based route protection (admin vs. cashier)

**Dashboard**

- At-a-glance revenue, sales count, and inventory stats
- Quick action shortcuts for common tasks
- Recent transactions summary

**Products & Categories**

- Full CRUD for products with image upload support
- Category management with product count tracking
- Search, sort, and paginate the product catalogue

**Inventory**

- Track stock levels across all products
- View low-stock and out-of-stock items
- Inventory adjustment history

**POS Terminal**

- Fast product search with barcode scanning support (high-rate search endpoint)
- Cart management with quantity control
- Multiple payment method support
- Receipt generation and print

**Sales Management**

- View all transactions with filtering and sorting
- Detailed sale view including individual line items
- Admin void capability with reason logging
- Voided sale details (voided by, reason, timestamp) tracked for audit

**Analytics**

- Revenue over time charts
- Top-selling products
- Sales by category breakdown
- Trend comparisons

**Cashier Management** (admin only)

- Create, edit, and delete cashier accounts
- View individual cashier activity

**Settings**

- Profile management (name, avatar upload)
- Password change with current password verification

**POS Settings**

- Configure terminal behaviour, receipt details, and store information

**Support & Legal Pages**

- Help & Support page with contact channels, FAQs, and support hours
- Privacy Policy
- Terms of Service

**UI / UX**

- Light and dark mode with persistent preference
- Fully responsive — works on mobile and desktop
- Smooth page transitions with Framer Motion
- Toast notifications and confirmation dialogs throughout

---

## Tech Stack

### Backend

| Package             | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| Node.js + Express 5 | HTTP server and routing                        |
| TypeScript          | Type safety across the entire API              |
| mysql2              | MySQL connection pool                          |
| jsonwebtoken        | JWT generation and verification                |
| bcrypt              | Password hashing                               |
| multer              | File upload handling (avatars, product images) |
| zod                 | Request body validation                        |
| resend              | Transactional email delivery                   |
| helmet              | HTTP security headers                          |
| cors                | Cross-origin request control                   |
| express-rate-limit  | Per-endpoint rate limiting                     |
| cookie-parser       | Cookie parsing middleware                      |
| dotenv              | Environment variable loading                   |
| uuid                | Unique ID generation                           |

### Frontend

| Package              | Purpose                             |
| -------------------- | ----------------------------------- |
| React 19             | UI library                          |
| TypeScript           | Type safety                         |
| Vite (rolldown-vite) | Build tool and dev server           |
| Tailwind CSS v4      | Utility-first styling               |
| React Router v7      | Client-side routing                 |
| Axios                | HTTP client                         |
| Framer Motion        | Animations and transitions          |
| Recharts             | Charts and analytics visualizations |
| SweetAlert2          | Toast and dialog notifications      |
| react-loader-spinner | Loading indicators                  |

---

## Project Structure

```
swiftjonny_pos/
├── backend/
│   ├── src/
│   │   ├── configs/          # Database, CORS, Helmet, rate limiter, env
│   │   ├── controllers/      # Route handler logic per resource
│   │   ├── emails/           # Email templates and Resend mailer
│   │   ├── middlewares/      # Auth, role check, upload, UUID validation
│   │   ├── routes/           # Express routers per resource
│   │   ├── services/         # Complex business logic (analytics, sales, settings)
│   │   ├── types/            # Shared TypeScript types and Express extensions
│   │   ├── utils/            # Helpers: hashing, JWT, tokens, file deletion
│   │   ├── validators/       # Zod schemas for all request bodies
│   │   └── server.ts         # Express app entry point
│   ├── uploads/              # Persisted file uploads (avatars, product images)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/           # Static assets
│   │   ├── components/       # Reusable UI components (Header, Sidebar, modals, etc.)
│   │   ├── contexts/         # React contexts (Auth, Theme, Sidebar)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # AppLayout (protected) and AuthPagesLayout (public)
│   │   ├── pages/
│   │   │   ├── private/      # Dashboard, Sales, Products, Categories, Inventory,
│   │   │   │                   Analytics, Cashiers, Settings, POS Terminal, POS Settings
│   │   │   └── public/       # Login, Register, Verify Email, Forgot/Reset Password,
│   │   │                       Homepage, Help & Support, Privacy Policy, Terms of Service
│   │   ├── services/         # Axios service modules per resource
│   │   ├── types/            # Shared TypeScript types
│   │   └── utils/            # Formatting and helper utilities
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- pnpm (`npm install -g pnpm`)
- A running MySQL database
- A [Resend](https://resend.com) account for email delivery

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the `backend/` directory. See [Environment Variables](#environment-variables) below.

4. Create the required database tables in your MySQL database. The schema should include tables for: `users`, `products`, `categories`, `sales`, `sale_items`, `inventory_log`.

5. Start the development server:

   ```bash
   pnpm dev
   ```

   The API will be available at `http://localhost:5000` by default.

6. To build for production:
   ```bash
   pnpm build
   pnpm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the `frontend/` directory:

   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:5173` by default.

5. To build for production:
   ```bash
   pnpm build
   ```

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server
NODE_ENV=development
PORT=5000

# CORS — comma-separated list of allowed origins
CORS_ORIGIN=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=swiftjonny_pos

# JWT
JWT_ACCESS_TOKEN_SECRET=your_jwt_access_secret_key
JWT_REFRESH_TOKEN_SECRET=your_jwt_refresh_secret_key

# Email (Resend)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Base URL (used to construct image URLs in API responses)
BASE_URL=http://localhost:5000

# Rate limiting (optional — defaults are applied if omitted)
# Auth endpoints
RATE_LIMIT_AUTH_WINDOW=(a number)
RATE_LIMIT_AUTH_MAX=(a number)

# POS action endpoints
RATE_LIMIT_POS_WINDOW=(a number)
RATE_LIMIT_POS_MAX=(a number)

# Product search
RATE_LIMIT_SEARCH_WINDOW=(a number)
RATE_LIMIT_SEARCH_MAX=(a number)

# Global public baseline
RATE_LIMIT_PUBLIC_WINDOW=(a number)
RATE_LIMIT_PUBLIC_MAX=(a number)
```

---

## API Overview

All API routes are prefixed with `/api`.

| Resource     | Base Path           | Description                                                                    |
| ------------ | ------------------- | ------------------------------------------------------------------------------ |
| Auth / Users | `/api/user`         | Register, login, verify email, approve account, forgot/reset password, profile |
| Products     | `/api/product`      | CRUD for products, image upload                                                |
| Categories   | `/api/category`     | CRUD for product categories                                                    |
| Inventory    | `/api/inventory`    | Stock levels and adjustment history                                            |
| Sales        | `/api/sale`         | Create sales, list transactions, void sales, receipts                          |
| Cashiers     | `/api/admin`        | Admin management of cashier accounts                                           |
| Analytics    | `/api/analytics`    | Revenue trends, top products, category breakdowns                              |
| Dashboard    | `/api/dashboard`    | Summary stats for the dashboard                                                |
| POS Settings | `/api/pos-settings` | Terminal configuration                                                         |

Static uploaded files are served directly at `/uploads/avatars/` and `/uploads/products/`.

---

## User Roles

**Admin**

- Full access to all pages and API endpoints
- Can manage products, categories, inventory, and sales
- Can edit role, activeness, and delete cashier accounts
- Can approve newly registered users
- Can void transactions with a logged reason
- Can configure POS settings and store information

**Cashier**

- Access to POS terminal only
- Can process sales and view their own transaction history
- Can update their own profile and change their password
- Cannot access admin-only pages or perform write operations on the catalogue

---

## Scripts

### Backend

| Script       | Description                                                          |
| ------------ | -------------------------------------------------------------------- |
| `pnpm dev`   | Start development server with nodemon (auto-restart on file changes) |
| `pnpm build` | Compile TypeScript to `dist/`                                        |
| `pnpm start` | Run compiled production build                                        |

### Frontend

| Script         | Description                          |
| -------------- | ------------------------------------ |
| `pnpm dev`     | Start Vite development server        |
| `pnpm build`   | Type-check and build for production  |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint`    | Run ESLint                           |

---

## License

This project is for personal and commercial use by the owner. All rights reserved.

© 2026 SwiftJonny POS
