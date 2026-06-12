# Volt Core Documentation

## Project Overview
Volt is a modern developer dashboard that aggregates coding metrics and profiles from platforms like GitHub, LeetCode, Codeforces, and others into a unified, brutalist-themed visualization. 

**High-Level Architecture**:
The application relies on a decoupled architecture where the Frontend is built with **Next.js (React + TypeScript)**, and the Backend is handled by **Django (Django REST Framework)**. Django acts as the single source of truth for authentication, database operations, business logic, and APIs, while the Next.js frontend is responsible for the UI layer and data fetching.

**Technology Stack**:
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Framer Motion.
- **Backend**: Django, Django REST Framework.

## Architecture
- **Communication Flow**: Next.js communicates with Django purely via REST API endpoints. Environment variables map to the deployed Django instance.
- **Authentication Flow**: The application uses an OTP-based login system managed entirely by Django. Access tokens are stored in the client, while a refresh token is securely maintained via an HttpOnly cookie.
- **Data Flow**: The frontend initiates state mutations and data requests; Django processes the business logic, interacts with the database, and responds with JSON payloads.

## Project Structure
The application structure is optimized for Next.js App Router best practices:

```text
├── app/                  # Next.js App Router files (Routes, Layouts, Page components)
│   ├── dashboard/        # Dashboard layout and views
│   ├── layout.tsx        # Root layout with global providers
│   └── page.tsx          # Root landing page with auto-auth checks
├── src/
│   ├── components/       # Reusable, stateless UI components
│   ├── features/         # Feature-specific modules (e.g., authentication)
│   ├── hooks/            # Global React hooks
│   ├── screens/          # Legacy screen components consumed by app directory
│   ├── services/         # API integration files and external integrations
│   ├── shared/           # Shared utilities and configurations
│   ├── styles/           # UI design tokens and components config
│   ├── types/            # Global TypeScript interfaces
│   └── utils/            # Helper functions and formatter utilities
├── public/               # Static assets (images, icons)
├── .env.local            # Local environment configurations
└── next.config.ts        # Next.js framework configuration
```

## Routing
Next.js File-Based Routing handles navigation:

- `/` (`app/page.tsx`): The Smart Landing page. If a user is authenticated or successfully restores an HttpOnly session, they are automatically redirected to the dashboard.
- `/dashboard` (`app/dashboard/page.tsx`): The main protected area. Currently operates as a Client Component encompassing internal state for rendering sub-views (`AnalyticsView`, `ProfilesView`, etc.).
- **Layout Hierarchy**: 
  - `app/layout.tsx`: Wraps the entire application with `AppQueryProvider` for React Query caching.
  - `app/dashboard/layout.tsx` (implicitly integrated or can be expanded): Provides the `Sidebar` context to the dashboard.

## Components
- **Shared Components**: Located in `src/components/`, these should be kept pure and stateless where possible to enable future Server Component optimization.
- **Server vs. Client Components**: Currently, the application heavily relies on Client Components (`"use client";`) to preserve existing React `useState` and `useEffect` hooks during the migration from Vite. For future developments, new components should default to Server Components for better SEO and performance unless user interactivity (e.g., `onClick`) or hooks are required.
- **Guidelines**: Keep components modular. If a component grows too large, extract it into smaller functional elements within its feature directory.

## State Management
- **Current Approach**: Local state management using React's `useState` and `useReducer` combined with URL state.
- **Global State**: Minimal. User data and JWT tokens are handled primarily through local storage and helper functions in `src/services/auth.ts`.
- **Server State**: Managed via **React Query** (`@tanstack/react-query`) for caching, background syncing, and request deduplication.

## API Layer
All external communication flows through `src/services/`.

- **API Configuration**: The base URL is configured in `src/services/config.ts` via `process.env.NEXT_PUBLIC_API_BASE_URL`.
- **Request Flow**: API calls are made using native `fetch` or `authFetch` which automatically intercepts requests to attach Bearer tokens.
- **Error Handling**: Standardized response objects handle success and error states. If an endpoint returns 401 Unauthorized, `authFetch` will attempt to refresh the token using the HttpOnly refresh cookie.

## Environment Variables
Environment variables should be defined in a `.env.local` file at the project root.

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | The base URL for the Django REST API backend. Used by all services to connect frontend to backend. | `http://localhost:8000` |

## Authentication
- **Login Flow**: User provides an email -> Django sends OTP -> User verifies OTP -> Django returns `access_token` and sets an HttpOnly `refresh` cookie.
- **Logout Flow**: The client sends a logout request to Django (which clears the refresh cookie) and subsequently clears local storage variables.
- **Protected Routes**: Protected routes (like `/dashboard`) use a `useEffect` inside `app/dashboard/page.tsx` that verifies `isAuthenticated()` and boots unauthenticated users back to `/`.
- **Security Considerations**: Tokens are managed efficiently. The most sensitive token (refresh token) is hidden from JavaScript via HttpOnly cookies, mitigating XSS risks.

## Data Fetching Strategy
- **Client-Side Fetching**: Almost all data fetching is currently done client-side via React Query. This was explicitly maintained during the Next.js migration to preserve existing API contracts and UI behavior.
- **Future Optimizations**: Highly static data (like global configuration) could be fetched server-side in the `app/layout.tsx` or using Server Components in the future.

## SEO
- **Metadata API**: Next.js's built-in Metadata API is used in `app/layout.tsx` to automatically generate `title` and `description` tags.
- **Search Engine Optimization**: Standardized HTML tags and Next.js's optimized App Router shell help with initial load metrics and basic web crawlers.

## Performance Optimizations
- **Next.js Turbopack**: The application is built using Next.js's fast bundler.
- **Client Component Boundaries**: Interactivity is localized to specific routes (`app/page.tsx` and `app/dashboard/page.tsx`), maintaining strict execution boundaries.
- **Bundle Optimization**: Dead code (e.g., `vite`, `react-router-dom`) was removed during the migration process.

## Development Setup

**1. Installation Steps**
```bash
npm install
```

**2. Environment Setup**
Create `.env.local` at the root directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**3. Running Locally**
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

**4. Code Quality Commands**
- Build: `npm run build`
- Start Production: `npm run start`
- Lint: `npm run lint`

## Deployment
- **Build Process**: Run `npm run build` to create an optimized production bundle in the `.next` directory.
- **Production Configuration**: Deploy the application to Vercel or any Node.js environment supporting Next.js.
- **Required Environment Variables**: Ensure `NEXT_PUBLIC_API_BASE_URL` is set in your production host environment mapping to the live Django backend.

## Coding Standards
- **TypeScript**: Strict typing is enabled. Avoid `any`; define interfaces for all API payloads.
- **Naming Conventions**: Use `PascalCase` for React components and `camelCase` for utilities/functions.
- **Organization**: Components should reside near the feature they support (in `src/features/`) unless they are globally shared (`src/components/`).

## Migration Report
**Original Architecture**: A Vite-based Single Page Application (SPA) using React Router DOM for client-side routing.
**Next.js Migration Summary**: Successfully migrated to the Next.js 15 App Router architecture without altering underlying API contracts, authentication behavior, or UI design.

- **Routes Migrated**:
  - `src/pages/Landing.tsx` -> `app/page.tsx`
  - `src/pages/Dashboard.tsx` -> `app/dashboard/page.tsx`
- **Files Added**: 
  - `next.config.ts`, `app/layout.tsx`, `.env.local`, `DOCUMENTATION.md`
- **Breaking Changes**: None.
- **Known Limitations**: The authentication logic remains entirely client-side.
- **Future Recommendations**: Implement Next.js Middleware (`middleware.ts`) for server-side route protection. Convert parts of the Dashboard into Next.js Server Components.

## Troubleshooting
- **API Connection Issues**: Ensure your `.env.local` has the correct `NEXT_PUBLIC_API_BASE_URL` and that the Django backend is actively running.
- **Build Failures**: Check for TypeScript errors. Ensure there are no overlapping `app` and `pages` directories (Note: `src/pages` was renamed to `src/screens` to prevent Next.js from confusing it with the Pages Router).
- **Authentication Issues**: If automatic login fails, clear the browser cache and cookies (specifically the Django `refresh` cookie) and try generating a new OTP.
