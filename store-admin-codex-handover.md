# Store Admin / PC Service Management - Codex Handover

Last updated: 2026-07-19

## 1. Purpose

This document is the current implementation handover for the Store Admin application.

The application has evolved into a multi-store PC repair and service-management system. It manages:

- Cities
- Stores
- Application Users
- Customers
- Service Types
- Repair Services
- Technician assignments
- Service status history
- User-level module permissions
- Role-aware dashboards

Use this file as the starting context for a new Codex session. Inspect the real repository before editing because this document summarizes behavior; the source code remains authoritative.

## 2. Mandatory repository instruction

This project uses Next.js 16.2.10 and has local agent instructions in `AGENTS.md`:

> This is NOT the Next.js you know. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code.

Always read the relevant installed Next.js guide before modifying routes, layouts, Server Actions, caching, or other framework APIs.

## 3. Technology stack

### Frontend

- Next.js 16.2.10 App Router
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4
- React Hook Form
- Zod 4
- Zustand
- Lucide React
- Server Components and Client Components

### Backend

- Next.js Server Actions
- Better Auth 1.6.23
- Better Auth Username plugin
- Better Auth Admin plugin with custom roles
- Drizzle ORM 0.45

### Database

- PostgreSQL
- Neon serverless PostgreSQL
- Drizzle Kit migrations

### Required `.env.local` variables

Do not copy secret values into documentation or chat. A working local environment currently uses these variable names:

```text
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
INITIAL_ADMIN_EMAIL
INITIAL_ADMIN_NAME
INITIAL_ADMIN_USERNAME
INITIAL_ADMIN_PASSWORD
```

### Fresh local setup

```bash
npm install
npm run db:migrate
npm run db:seed
npm run auth:create-admin
npm run dev
```

The database seed must run before `auth:create-admin` because the initial Admin App User profile requires an existing Store. The seed is idempotent, so it is safe to run again after Admin creation if profile repair is needed.

## 4. Core architecture and data-flow rules

The project follows this structure:

```text
src/
  actions/       Server mutations and server-side authorization
  app/           App Router pages, layouts, and auth routes
  components/    Feature and reusable UI components
  data/          Read/query functions
  db/            Drizzle schemas, database client, and seed
  lib/           Authentication, authorization, roles, and utilities
  validations/   Zod validation schemas
```

Preserve the existing flow when adding features:

```text
Zod validation
  -> Server Action authorization
  -> server-side relationship/store validation
  -> Drizzle mutation
  -> revalidatePath / redirect
```

Read flows use:

```text
Server page authorization
  -> role/store scope resolution
  -> src/data query
  -> serialized data passed to client table/form
```

Never authorize from hidden buttons or client state alone.

## 5. Authentication identity model

There are two User records.

### Better Auth User

Stored in Better Auth's `user` table.

Important fields:

- `id`: ULID/string
- `name`
- `email`
- `username`
- `role`
- credential and session relationships

Passwords belong only to Better Auth.

### App User business profile

Stored in `app_users`.

Important fields:

- `id`: integer identity business ID
- `fullName`
- `contact`
- `email`
- `username`
- `storeId`
- `authUserId`: nullable string link to Better Auth
- `isActive`
- timestamps

Relationship:

```text
app_users.auth_user_id -> Better Auth user.id
```

All business relationships, permissions, Service assignment, and history actor references use integer `app_users.id`. They do not reference the Better Auth ULID directly.

Some legacy seeded App User profiles do not initially have `authUserId`. An Admin can use the key icon in the User list to create and link a Better Auth login. These legacy activations receive the safe default `technician` role.

## 6. Roles

The supported application roles are:

```text
admin
store-admin
technician
```

The UI sometimes calls `admin` the super admin. There is no separate `super-admin` role.

Custom roles are registered with Better Auth in:

- `src/lib/auth-permissions.ts`
- `src/lib/auth.ts`

Better Auth administration privileges remain exclusive to `admin`. Store Admin and Technician roles do not receive Better Auth User-administration powers.

### Admin

- Full application access
- Global access across all Stores
- Full module permission bypass on the server
- Can assign User permissions
- Can change or create User login passwords
- Can create Store Admin and Technician accounts
- Can delete repair-domain records when database relationships permit it

### Store Admin

Current data model: each App User belongs to one Store through `app_users.store_id`.

Default access:

- Customers: Create, View, Update
- Service Types: Create, View, Update
- Services: Create, View, Update
- Delete is always denied for these three repair modules
- All reads and writes are scoped to the Store Admin's assigned Store
- Can mark a Service Delivered through the normal Service edit flow

Explicit User permission rows can refine Store Admin access, but repair-module Delete remains hard-denied.

### Technician

- Can view only Services assigned through `services.assigned_technician_id = current app_users.id`
- Cannot access Customer pages or Customer data
- Technician Service queries do not select Customer fields
- Can view Service code, Service Type, description, status, created time, and timeline
- Can update assigned Service status only through the controlled workflow
- Cannot create, edit, delete, assign, or deliver Services

Technician status workflow:

```text
created -> working -> tested -> completed
```

`delivered` is an Admin/Store Admin operation.

## 7. Permission system

Permission modules are seeded by stable code:

```text
cities
stores
users
customers
service-types
services
```

Actions:

```text
create
view
update
delete
```

Tables:

### `modules`

- Integer identity ID
- Unique stable `code`
- Name and description
- Timestamps

### `user_permissions`

- Integer identity ID
- `app_user_id` -> integer `app_users.id`, cascade delete
- `module_id` -> integer `modules.id`, restrict delete
- `can_create`
- `can_view`
- `can_update`
- `can_delete`
- Unique `(app_user_id, module_id)`
- Timestamps

Key files:

- `src/lib/permissions.ts`
- `src/lib/authorization.ts`
- `src/data/permissions.ts`
- `src/validations/permissions.ts`
- `src/actions/permissions.ts`
- `src/components/permissions/permission-form.tsx`
- `src/app/(admin)/users/[id]/permissions/page.tsx`

Permission behavior:

- Admin receives computed full access and ignores permission rows.
- Store Admin receives repair-module defaults, then explicit User overrides.
- Store Admin repair-module Delete is forced false after overrides.
- Technician is hard-capped to Services View only at the module layer.
- Other roles/users without rows fail closed.
- Inactive and missing-profile Users are always denied.

The permission assignment screen is Admin-only.

The shared authenticated layout and sidebar are permission-aware. Dashboard is available to all active linked Users. Module navigation links require effective View permission.

## 8. Store and tenant scoping

The current business relationship is:

```text
City
  -> Store
      -> App User
      -> Customer
      -> Service Type
      -> Service
```

Store Admin access uses `currentUser.storeId` on the server. Client-submitted Store IDs are not trusted for Store Admin operations.

For a Service, the selected Store, Customer, Service Type, and assigned Technician must all belong to the same Store. Server Actions validate these relationships before mutation.

Admin can select any Store and has global reads.

## 9. Database model

### Cities

Table: `cities`

- Unique code
- English name required
- Arabic name optional
- Delete restricted while Stores exist

### Stores

Table: `stores`

- Unique uppercase code
- Belongs to a City
- Optional Arabic name, phone, email, address
- Delete restricted while App Users or repair-domain records exist

### Customers

Table: `customers`

- `id`: integer identity
- `storeId`: required Store FK
- `fullName`: required
- `mobile`: required
- `email`: optional
- `address`: optional
- timestamps
- Unique `(storeId, mobile)`
- Store cannot be changed while Services reference the Customer
- Delete blocked while Services reference the Customer

### Service Types

Table: `service_types`

- `id`: integer identity
- `storeId`: required Store FK
- `name`: required
- `isActive`: defaults true
- `description`: optional
- timestamps
- Unique `(storeId, name)`
- Inactive types cannot be selected for new Services
- Existing Services may retain an inactive type
- Store cannot be changed while Services reference the type
- Delete blocked while Services reference the type

### Services

Table: `services`

- `id`: integer identity
- `code`: unique generated code
- `storeId`
- `serviceTypeId`
- `customerId`
- `description`
- `status`: PostgreSQL `service_status` enum
- `assignedTechnicianId`: nullable App User FK, set null if profile is deleted
- `createdByAppUserId`: required App User FK
- `completedAt`
- `deliveredAt`
- timestamps

Statuses:

```text
created
working
tested
completed
delivered
```

New Services always start as `created`.

### Service code generation

Implemented in `src/lib/service-code.ts`.

Example:

```text
Service Type: Laptop Repair
Customer: John
Date: 19-07-2026
Code: LAPRP-JOH-19726
```

If the base code already exists, the create action retries with:

```text
LAPRP-JOH-19726-2
LAPRP-JOH-19726-3
```

### Service status history

Table: `service_status_history`

- `serviceId`: cascade delete with Service
- `fromStatus`: nullable for creation
- `toStatus`
- `changedByAppUserId`: nullable, set null when actor profile is deleted
- `createdAt`: event timestamp

History records are written for:

- Service creation
- Admin/Store Admin status edits
- Technician workflow updates

The shared Service details page displays a timeline with:

- Previous and new status
- Date and time
- Acting User, or `System` when the actor no longer exists

Existing Services were backfilled during migration `0008` using the timestamps available in the old schema. Missing historical Working/Tested timestamps cannot be reconstructed if they were never stored.

## 10. Completed modules and screens

### Authentication

- Username/password login
- Logout
- Session handling
- Root redirects to `/dashboard`
- Login redirects to `/dashboard`
- No `/portal` route
- Account disabled page
- Missing profile page
- Unauthorized page
- Initial Admin bootstrap script

### Shared layout

- Responsive header/sidebar
- Collapsible desktop sidebar
- Mobile sidebar
- Server-resolved permission navigation
- Dashboard visible to all active linked Users
- Light-only color scheme currently enforced in `src/app/globals.css`

### City CRUD

- List, create, edit, delete
- Duplicate validation
- Foreign-key delete protection
- Page authorization gates

### Store CRUD

- List, create, edit, delete
- City relationship
- Duplicate validation
- Foreign-key delete protection
- Page authorization gates

### User management

- User list with Store and City
- Create Better Auth account plus App User profile
- Role selection: Store Admin or Technician
- Permission shield icon for Admin only
- Password key icon for Admin only
- Password dialog validates 8-128 characters and confirmation
- Linked Users: Admin changes Better Auth password
- Legacy unlinked profiles: Admin creates Technician login, links it, and sets password
- Credentials never stored in `app_users`

### Customer CRUD

Routes:

```text
/customers
/customers/create
/customers/[id]/edit
```

Implemented list, create, edit, delete, Store scoping, duplicate mobile protection, and Service relationship protection.

### Service Type CRUD

Routes:

```text
/service-types
/service-types/create
/service-types/[id]/edit
```

Implemented list, create, edit, active/inactive, delete, Store scoping, duplicate name protection, and Service relationship protection.

### Service CRUD and details

Routes:

```text
/services
/services/create
/services/[id]
/services/[id]/edit
```

Implemented:

- Service list
- Create with automatic code
- Edit
- Delete for authorized Admin
- Store/Customer/Service Type relationship validation
- Technician assignment
- Status updates
- Technician controlled workflow
- Privacy-safe Technician details
- Customer details for Admin/Store Admin
- Technician shown inside Service Details, not in a separate Assignment card
- Full-width details layout
- Shared Service timeline

## 11. Role-aware dashboard

Dashboard route:

```text
/dashboard
```

`top 10` currently means the 10 most recently created Services because the schema has no priority/ranking field.

### Admin dashboard

- Total Cities
- Total Stores
- Total Customers
- Total Services
- Latest 10 Services across all Stores
- Summary cards link to module lists
- Service code and eye icon link to details

### Store Admin dashboard

- Assigned Store count (currently one Store per App User)
- Assigned Store name/code/City
- Customer count for assigned Store
- Service count for assigned Store
- Latest 10 Services for assigned Store only

### Technician dashboard

- Latest 10 Services assigned to that Technician only
- Uses a privacy-safe query without Customer fields
- Links to assigned Service details

Key dashboard files:

- `src/data/dashboard.ts`
- `src/app/(admin)/dashboard/page.tsx`
- `src/components/dashboard/summary-card.tsx`

## 12. Important security behavior

1. Passwords stay in Better Auth only.
2. Permission ownership uses integer `app_users.id`.
3. Admin bypass occurs only on the server.
4. Inactive Users are denied even if permission rows exist.
5. Store Admin data is restricted by server-side Store scope.
6. Technician Service access is restricted by assigned App User ID.
7. Technician-safe queries do not select Customer fields.
8. Technician status actions re-read assignment and current status.
9. Technician transitions cannot skip, reverse, or deliver.
10. Service relationship IDs are validated against the same Store.
11. Permission assignment and password reset remain Admin-only Server Actions.
12. Hidden navigation/buttons are UX only; Server Actions re-authorize.

## 13. Current route protection behavior

`src/app/(admin)/layout.tsx` performs:

```text
No session -> /login
No App User profile -> /profile-required
Inactive profile -> /account-disabled
Active profile -> shared layout
```

It resolves effective View permissions and passes allowed navigation hrefs to the client sidebar.

Module pages use `requirePermission()` where implemented. The repair modules additionally enforce role and Store business rules in their Server Actions and queries.

## 14. Drizzle migrations

Migration files currently run from `drizzle/`:

```text
0000_acoustic_morlocks.sql
0001_gorgeous_speed_demon.sql
0002_aberrant_the_phantom.sql
0003_tense_angel.sql
0004_spicy_turbo.sql
0005_seed-initial-admin-profile.sql
0006_adorable_malcolm_colcord.sql
0007_giant_mercury.sql
0008_amusing_mercury.sql
```

Important additions:

- `0006`: permission modules and User permissions
- `0007`: Customers, Service Types, Services, and service status enum
- `0008`: Service status history plus best-effort backfill

All migrations through `0008` were applied successfully to the database configured in `.env.local` as of this handover.

The seed is idempotent and includes six permission modules.

## 15. Important files

### Auth and authorization

```text
src/lib/auth.ts
src/lib/auth-client.ts
src/lib/auth-permissions.ts
src/lib/current-user.ts
src/lib/permissions.ts
src/lib/authorization.ts
```

### Database

```text
src/db/index.ts
src/db/schema.ts
src/db/auth-schema.ts
src/db/seed.ts
drizzle.config.ts
```

### Repair-domain actions

```text
src/actions/customers.ts
src/actions/service-types.ts
src/actions/services.ts
```

### Repair-domain data

```text
src/data/customers.ts
src/data/service-types.ts
src/data/services.ts
src/data/dashboard.ts
```

### Repair-domain UI

```text
src/components/customers/
src/components/service-types/
src/components/services/
src/components/dashboard/
```

## 16. Known incomplete or legacy areas

The following work remains:

### Permission enforcement completion

- City and Store mutation Server Actions still use `requireActiveAdmin()` rather than module/action `requirePermission()`.
- User creation still performs an Admin-specific check inside the action.
- Existing City/Store/User list buttons are not fully permission-aware; direct pages/actions remain protected.
- Finish converting legacy module mutations one module at a time.

### User management

- Edit User is still a UI placeholder; there is no complete edit route/action.
- Delete User is still a UI placeholder.
- User deletion must coordinate Better Auth User, App User profile, sessions, permission cascade, and Technician assignment history safely.
- Store Admin/Technician role editing is not implemented.
- Self-service User password change is not implemented.

### Other incomplete features

- Localization
- Arabic UI and RTL
- Proper theme switching
- Dark mode
- Pagination/search/filtering for large tables
- Automated test suite
- Detailed device fields, attachments, parts/costs, notes, and invoices are not implemented

### Legacy data note

Seeded Arabic strings appeared encoding-corrupted in terminal output and may need cleanup.

### Repository note

At the time of prior inspection, this directory was not inside a Git repository, so Git diff/status was unavailable. Recheck in a new session.

## 17. Recommended next implementation order

1. Inspect current working tree and reread `AGENTS.md`.
2. Run baseline `npm run lint` and `npm run build`.
3. Complete permission-aware buttons for Cities, Stores, and Users.
4. Replace legacy City/Store/User mutation Admin checks with correct `requirePermission()` checks, one module at a time.
5. Implement User edit, including Store and role synchronization with Better Auth.
6. Implement safe User deletion and session cleanup.
7. Add Service search/filtering and pagination.
8. Add automated authorization tests for Admin, Store Admin, and Technician.

Do not weaken the Technician Customer-data boundary while refactoring shared queries.

## 18. Commands

```bash
npm run dev
npm run lint
npm run build
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
npm run auth:create-admin
```

Migration workflow:

```text
Edit Drizzle schema
  -> npm run db:generate
  -> review generated SQL
  -> npm run db:migrate
  -> run seed only when required
  -> lint and build
```

Do not use `db:push` unless intentionally bypassing the migration workflow for a disposable development database.

## 19. Current verification status

At the end of the implementation session:

- `npm run lint` passed with no warnings or errors.
- `npm run build` passed.
- TypeScript compilation passed.
- Migrations through `0008` were applied.
- Permission module seed contains all six modules.
- Dashboard aggregate queries were read-tested against the configured database.
- Service code example produced `LAPRP-JOH-19726`.
- Existing Service history backfill was verified.

No automated browser/end-to-end test suite exists yet. Perform role-based manual testing after substantial authorization changes.

## 20. Suggested new-session prompt

```text
Read AGENTS.md and store-admin-codex-handover.md completely, then inspect the actual repository before making changes.

This is a Next.js 16 App Router PC repair/service-management application using Better Auth, Drizzle ORM, Neon PostgreSQL, Server Actions, React Hook Form, and Zod.

Important identity rule:
- app_users.id is the integer business ID.
- Better Auth user.id is a string/ULID.
- Permissions, technician assignment, and history reference app_users.id.
- Passwords remain only in Better Auth.

Roles are admin, store-admin, and technician.
- Admin is global and full access.
- Store Admin is restricted to one assigned Store and cannot delete repair-domain records.
- Technician sees only assigned Services, never Customer data, and can advance status only created -> working -> tested -> completed.

Preserve the current Zod -> Server Action -> Drizzle data flow and server-side Store scoping.

Before coding, run lint/build and report any existing issues separately. Implement the next requested feature in controlled units and verify security boundaries.
```
