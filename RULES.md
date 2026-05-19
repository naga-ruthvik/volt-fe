# Frontend Engineering Standards

This document establishes the absolute, non-negotiable engineering standards for all frontend codebases. It is designed to transform abstract architectural patterns into explicit, measurable, and machine-enforceable rules.

---

## Core Principles

* **Predictability over Cleverness:** Code must be deterministic, easy to reason about, and follow established patterns. Avoid highly abstract, "magical" code patterns.
* **Type Safety as a Foundation:** Types are not documentation; they are strict architectural constraints. Compile-time safety prevents runtime failures.
* **Maintainability at Scale:** Write code under the assumption that a different engineer will modify it tomorrow under a tight deadline.
* **Defensive Engineering:** Explicitly handle all failure states, edge cases, null/undefined values, and network anomalies.

---

## Project Architecture

### MUST DO

* Enforce a **Feature-Based (Colocated) Architecture**. Group code by domain feature rather than by technical type (e.g., group components, hooks, and types for a "Billing" feature inside a single folder).
* Enforce strict **Dependency Boundaries**. Features may import from a shared global layer but must *never* cross-import from other features directly. Communication between features must pass through an explicit public API or shared global state.
* Implement **Container vs. Presentation Separation**. Decouple data fetching/state orchestration (Containers) from pure, stateless UI presentation (Presentation).

### MUST NOT DO

* Do not use flat folder structures where hundreds of components reside in a single directory.
* Do not allow circular dependencies between modules or features under any circumstance.

### Preferred Patterns

```
src/
├── assets/             # Static assets (images, fonts, global SVGs)
├── config/             # App-wide configuration, environment variables, constants
├── features/           # Domain-driven feature modules
│   ├── authentication/
│   │   ├── components/ # Feature-specific UI components
│   │   ├── hooks/      # Feature-specific hooks (e.g., useAuth)
│   │   ├── services/   # Feature-specific API requests & transformers
│   │   ├── types/      # Domain type definitions
│   │   └── index.ts    # Public API entry point for the feature
│   └── dashboard/
├── shared/             # Global reusable infrastructure
│   ├── components/     # Design system primitive UI components (Button, Input)
│   ├── hooks/          # Domain-agnostic utility hooks (useDebounce, useMediaQuery)
│   ├── providers/      # React Context providers (Theme, Toast)
│   ├── services/       # Core API client instance (Axios/Fetch wrapper)
│   ├── utils/          # Pure utility functions (formatting, validation)
│   └── types/          # Global shared TypeScript interfaces
└── main.tsx            # Application entry point

```

---

## Folder Structure

All file and folder naming conventions must be rigidly adhered to for consistency and automated linting compatibility.

| Asset Type | Naming Convention | Example |
| --- | --- | --- |
| **Components** | PascalCase | `UserProfileCard.tsx` |
| **Hooks** | camelCase (prefixed with `use`) | `useLocalStorage.ts` |
| **Utilities / Services** | camelCase | `formatCurrency.ts`, `apiClient.ts` |
| **Folders / Modules** | kebab-case | `user-profile`, `shopping-cart` |
| **Styles / Assets** | kebab-case | `global-styles.css`, `hero-background.jpg` |

---

## Component Standards

### MUST DO

* Limit component files to a maximum of **250 lines of code**. If a component exceeds this threshold, it must be refactored into smaller sub-components or its logic extracted into a custom hook.
* Extract complex business logic, data formatting, and state management out of the JSX and into a dedicated custom hook colocated with the component.
* Enforce **Composition over Inheritance**. Use children props or explicit slot props to build flexible layouts.

### MUST NOT DO

* Do not declare components inside other components. This causes complete sub-tree unmounting and massive performance regressions on every render loop.
* Do not exceed a prop-drilling depth of **two levels**. Beyond two levels, you must use React Context or a dedicated state management store.

### Code Example: Container/Presentation Split

```tsx
// Preferred: Presentation Component (src/features/users/components/UserCard.tsx)
import React from 'react';
import type { User } from '../types';

interface UserCardProps {
  user: User;
  onUpdateStatus: (id: string, status: 'active' | 'inactive') => void;
  isUpdating: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onUpdateStatus, isUpdating }) => {
  return (
    <div className="rounded-lg border border-slate-200 p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
      <p className="text-sm text-slate-500">{user.email}</p>
      <button
        disabled={isUpdating}
        onClick={() => onUpdateStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}
        className="mt-4 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isUpdating ? 'Updating...' : `Mark as ${user.status === 'active' ? 'Inactive' : 'Active'}`}
      </button>
    </div>
  );
};

```

---

## API Standards

### MUST DO

* Centralize all HTTP requests within an abstract API client instance.
* Enforce runtime validation using schema libraries (e.g., Zod) at the network perimeter to guarantee that backend mutations do not break frontend expectations.
* Implement explicit request timeouts (default to **10,000ms**) and standard error mapping.

### MUST NOT DO

* Do not make raw `fetch` or `axios` calls directly inside UI components or raw `useEffect` hooks.
* Do not allow unhandled promise rejections. Every API interaction must pass through an explicit catch/error lifecycle.

### Code Example: Centralized API Client with Validation

```typescript
// src/shared/services/apiClient.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.production.internal',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Runtime Schema Verification & Request Definition
export const UserDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  status: z.enum(['active', 'inactive']),
});

export type UserDto = z.infer<typeof UserDtoSchema>;

export const fetchUser = async (userId: string): Promise<UserDto> => {
  const response = await apiClient.get(`/v1/users/${userId}`);
  const result = UserDtoSchema.safeParse(response.data);
  
  if (!result.success) {
    console.error('API Schema Validation Failure:', result.error);
    throw new Error('Malformed server response payload.');
  }
  
  return result.data;
};

```

---

## State Management

### MUST DO

* Segregate server state from client UI state. Use **TanStack Query (React Query)** for all server-cache management, and standard React hooks or minimal global stores for pure local state.
* Normalize structural/relational data arrays into key-value map objects when storing them in client-side global state to ensure constant-time updates ($O(1)$) and prevent layout thrashing.

### MUST NOT DO

* Do not use global state management systems (Redux, Zustand) to mirror server data that could otherwise be handled by a server-cache management library.
* Do not use React Context for highly dynamic, rapidly changing state values. This triggers catastrophic unoptimized re-renders across all consuming down-tree nodes.

### Code Example: Server State Management Pattern

```tsx
// src/features/users/hooks/useUserMutation.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUser, apiClient } from '../services/apiClient';
import type { UserDto } from '../services/apiClient';

export const useUser = (userId: string) => {
  return useQuery<UserDto, Error>({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const response = await apiClient.patch(`/v1/users/${id}`, { status });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
};

```

---

## UI & Accessibility

### MUST DO

* Adhere strictly to WCAG 2.1 AA guidelines. Ensure explicit keyboard navigability (`tabIndex`), visible focus rings, and proper semantic HTML element choices.
* Ensure every input element has an explicitly bound `<label>` element or an `aria-label` / `aria-labelledby` attribute.
* Implement layout stabilization principles. Set explicit dimensions, `aspect-ratio` bounds, or custom skeletons to fully neutralize layout shifts (CLS).

### Anti-patterns

* Using `<div>` or `<span>` elements as click targets without adding an explicit `role="button"`, `tabIndex={0}`, and an accompanying `onKeyDown` key handler.
* Relying purely on color indicators to convey crucial semantic information (e.g., error validation, status updates).

---

## Performance

### MUST DO

* Enforce **Code Splitting / Lazy Loading** across all top-level application routing boundaries via `React.lazy()` and `Suspense`.
* Enforce list virtualization (e.g., via `@tanstack/react-virtual`) whenever rendering complex, continuous DOM data lists containing more than **100 rows**.
* Explicitly memoize computed derivation functions inside your components using the `useMemo` hook if they process arrays containing more than **50 elements** or execute heavy calculations.

### Anti-patterns

* Passing un-memoized, inline object literals or anonymous lambda functions downward to heavily-memoized child elements inside deep render hierarchies.
* Importing huge third-party utility packages as whole monolithic units instead of targeting individual sub-modules.

---

## Security

### MUST DO

* Sanitize any dynamic HTML injection blocks explicitly with a dedicated parsing tool like `DOMPurify` before injecting strings into `dangerouslySetInnerHTML`.
* Store sensitive credentials, authentication tokens, and JWTs in secure, stateless memory contexts or client-side HTTP-Only cookies. Never store credentials in plaintext inside `localStorage` or `sessionStorage`.
* Prefix all public environment variable definitions with strict, framework-validated scopes (e.g., `NEXT_PUBLIC_` or `VITE_`) to block inadvertent compilation leaks of backend secrets.

---

## Error Handling

### MUST DO

* Enclose isolated modular features within localized component **Error Boundaries** to trap internal application execution faults without crashing the entire UI shell.
* Implement type-safe, centralized runtime error-mapping objects to parse generic API network errors into actionable, localized UI warning states.

### Code Example: Feature-Level Fallback Error Boundary

```tsx
// src/shared/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export class FeatureErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
    // Integrate external log collection pipelines here (Sentry, LogRocket)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="rounded-md border border-red-200 bg-red-50 p-4" role="alert">
          <h2 className="text-sm font-semibold text-red-800">Something went wrong within this feature.</h2>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-xs font-medium text-red-700 underline"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

```

---

## Testing

### MUST DO

* Maintain a strict threshold of **80% code coverage** for critical business logic, custom state-orchestration hooks, and shared mathematical or logical transformations.
* Isolate components from external live systems by explicitly mocking all network layers using an interceptor standard like **MSW (Mock Service Worker)**.
* Target accessibility hooks and tangible user landmarks (e.g., `screen.getByRole('button', { name: /submit/i })`) inside testing environments rather than querying arbitrary DOM selector classes.

### Anti-patterns

* Writing assertions against brittle, internal implementation variables or local component states rather than observing predictable exterior visual mutations.

---

## Code Quality

### MUST DO

* Enforce absolute static type analysis. Ensure that `noImplicitAny: true` and `strictNullChecks: true` remain persistently active inside the project configurations.
* Organize and clean module imports cleanly using automated toolchains. Group blocks down by external core platforms first, shared internal utilities next, feature assets third, and style assets last.

### MUST NOT DO

* Do not bypass static check validations using the raw `any` cast directive. Use the strictly scoped `unknown` primitive combined with descriptive type guards when dealing with structural data of unknown origins.

---

## Styling

### MUST DO

* Build application styling on top of standardized design token systems provided by utility architectures like **Tailwind CSS**.
* Maintain clear responsive structure flows using **mobile-first media query utilities** (e.g., using `min-width` base classes and scaling layout parameters upward).

### MUST NOT DO

* Do not inject arbitrary, untracked, un-linted magic numeric variables directly into UI style rules.
* Do not use raw inline style strings inside individual React elements.

### Code Example: Standardized Tailwind Tokens

```tsx
// Preferred Layout Variant Orchestration
import React from 'react';

interface InteractiveAlertProps {
  variant: 'info' | 'critical';
  message: string;
}

const VARIANT_MAP = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  critical: 'bg-red-50 border-red-200 text-red-800',
};

export const InteractiveAlert: React.FC<InteractiveAlertProps> = ({ variant, message }) => {
  return (
    <div 
      className={`flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center ${VARIANT_MAP[variant]}`}
      role="alert"
    >
      <span className="text-sm font-medium leading-relaxed">{message}</span>
    </div>
  );
};

```

---

## AI Failure Prevention Checklist

This checklist contains explicit guardrails to prevent common code generation mistakes:

* [ ] **No Raw State Syncing:** Do not duplicate incoming props into local components' internal state hooks. Always derive computational structures dynamically inline.
* [ ] **No Race Conditions:** Do not handle data operations directly inside plain `useEffect` calls without embedding an explicit `active` boolean toggle or `AbortController` signal to drop late network arrivals.
* [ ] **No Unsafe Chaining:** Never execute evaluations against deeply nested server entities without inserting safe navigation checks (`?.`) and fallback default values (`??`).
* [ ] **No Memory Leaks:** Unbind structural global EventListener callbacks, Interval sequences, and resize watchers instantly inside cleanup methods when unmounting custom elements.
* [ ] **No Empty States Forgotten:** Always bundle dedicated UX presentation view blocks to cover zero-length array data results returned from queries.

---

## Production Readiness Checklist

Before signing off code for production deployment, verify compliance across these checkpoints:

* [ ] **Schema Soundness:** All dynamic endpoints use validation guards to isolate frontend operations from unexpected payload field shifts.
* [ ] **Semantic Structure:** Key layouts pass accessibility checks, container components are interactive via keyboard navigation, and structural tags follow standard HTML conventions.
* [ ] **Zero Injections:** Context allocations, variable lookups, and DOM bindings pass sanitization filters to prevent raw token extraction vulnerabilities.
* [ ] **Bundle Minimization:** Route split boundaries divide operational page scopes cleanly to prevent shipping un-executed view modules upfront.
* [ ] **Resilience Engineering:** Local feature blocks operate behind isolated error boundary guards to protect application execution lifecycles from single-point-of-failure component crashes.

---

## AI Execution Rules

As an elite AI assistant, follow these strict execution rules during every coding session:

### Phase 1: Architectural Analysis (Before Writing Code)

1. Assess the feature's placement within the feature-based folder architecture. Identify its dependency boundaries.
2. Determine state requirements: server state vs. local UI state. Choose appropriate tools (e.g., TanStack Query for server state).
3. Plan component breakdown to ensure no single file exceeds 250 lines and container/presentational concerns are separated.
4. Identify required validation schemas for external data entry points.

### Phase 2: Generation Guardrails (While Generating Code)

1. **Always** implement a tripartite state response layout: Loading, Error (using bounded hooks/components), and Empty (zero-state handling).
2. **Always** define explicit, robust TypeScript types or interfaces. Avoid `any` at all costs; use strict data transfer object (DTO) shapes.
3. **Always** enforce defensive coding via null-safe chaining (`?.`) and fallback coalescing (`??`).
4. **Always** apply a mobile-first responsive approach with utility styles, eliminating arbitrary, non-tokenized inline values.
5. **Always** separate UI markup from data side-effects by extracting fetching orchestrations into dedicated hooks or services.

### Phase 3: Rigid Verification Protocol (Before Outputting Code)

Run a thorough self-validation loop against the generated output. Ensure every box is checked before returning code:

* [ ] Is the responsive layout verified using a mobile-first philosophy?
* [ ] Do distinct loading, error, and empty views exist for every asynchronous operation?
* [ ] Are inputs, interactive tokens, and custom elements keyboard-accessible and compliant with WCAG standards?
* [ ] Have all components been checked to ensure they stay well within the 250-line boundary?
* [ ] Is all backend structure validated using explicit schemas at the network boundary?