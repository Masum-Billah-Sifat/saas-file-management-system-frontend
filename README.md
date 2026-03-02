
---

FRONTEND README.md (repo: saas-file-management-system-frontend)

```md
# SaaS File Management System — Frontend

Technical Assessment: A SaaS-style UI for managing subscription-based limits, nested folders, and file uploads with strict backend enforcement.

## Live URLs
- Frontend (Vercel): https://saas-file-management-system-fronten.vercel.app/
- Backend (Render): https://saas-file-management-system.onrender.com

## Repositories
- Frontend Repo: https://github.com/Masum-Billah-Sifat/saas-file-management-system-frontend  
- Backend Repo: https://github.com/Masum-Billah-Sifat/saas-file-management-system  

## Tech Stack
- Next.js 13.5.6 (App Router) + TypeScript
- Zustand (auth store + persistence)
- Axios (API client + Authorization header + 401 auto-logout)
- Tailwind CSS
- react-hot-toast (notifications)
- lucide-react (icons)

## Features Implemented

### Public Landing
- Shows active packages using `GET /public/packages`

### Auth Flow
- Register / Login / Logout
- Persistent auth using Zustand + localStorage hydration
- `/auth/me` session rehydration on reload
- Mock Email Verification:
  - Banner shown when `isEmailVerified=false`
  - Request link → verify in modal
- Mock Password Reset:
  - Forgot password generates reset link (mock)
  - Reset password page updates password and redirects to login
  - Admin reset disabled by backend

### Role-based Routing
- User Panel (`/app/*`):
  - `/app/files`: folder tree + file list + upload/preview/download/rename/archive
  - `/app/subscription`: view packages, switch plan, view history
- Admin Panel (`/admin`):
  - Package CRUD: create/update/deactivate packages

### Error Handling (Industry Standard)
- Only 401 errors clear token and force re-login
- 403 errors (limit enforcement) show toasts without logout

## Default Credentials

Admin:
- Email: admin@zoomit.com
- Password: Admin@12345

User:
- Register any account, or test with:
- Email: m.sifat1666690@gmail.com
- Password: 1234567890

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000