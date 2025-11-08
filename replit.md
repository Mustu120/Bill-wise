# FlowChain

## Overview

FlowChain is a secure, role-based authentication platform built for project management and team collaboration. The application provides admin-controlled user management with a clean authentication flow implementing JWT-based authentication and role-based access control.

The platform supports four user roles: Project Manager, Team Member, Finance, and Admin. **Only administrators can create new user accounts and assign roles**, ensuring controlled access to the system. It features a Material Design 3-inspired interface using shadcn/ui components with a neutral color scheme optimized for professional productivity workflows.

## Recent Changes (November 2025)

- **Removed public signup**: Users can no longer self-register; only admins can create accounts
- **Admin-only user management**: Implemented dedicated admin dashboard for user creation and role management
- **Role-based routing**: Admins are redirected to `/admin`, regular users to `/dashboard` after login
- **Protected admin routes**: All user management endpoints require admin authentication
- **Bootstrap flow**: Implemented first-time setup wizard for creating the initial admin account
- **Database provisioned**: PostgreSQL database is configured and schema is deployed

## First-Time Setup

When you first access the application, you'll be prompted to create your administrator account through a bootstrap setup wizard:

1. Navigate to the login page
2. The system will detect no users exist and show "Setup Administrator" form
3. Enter your name, email, and password (minimum 8 characters, must include uppercase letter and number)
4. Click "Create Admin Account"
5. You'll be automatically logged in and redirected to the admin dashboard

**Bootstrap Security**: The bootstrap endpoint is protected - it only works when no users exist in the database. Once the first admin is created, the bootstrap route becomes unavailable.

To create additional users, log in as admin and use the "Create User" button in the admin dashboard.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing

**UI Component System:**
- shadcn/ui component library (New York variant) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- React Hook Form with Zod for form validation and schema enforcement
- TanStack Query (React Query) for server state management

**Design System:**
- Material Design 3 principles adapted for productivity applications
- Inter font family via Google Fonts CDN with system font fallbacks
- Custom color system using HSL values with CSS variables for theming
- Consistent spacing scale using Tailwind units (2, 4, 6, 8, 12)
- Centralized card-based layouts for authentication flows

**State Management:**
- TanStack Query handles all server state and API interactions
- React hooks (useState, useEffect) for local component state
- Cookie-based authentication state persistence

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and routing
- Node.js with ES modules (ESM)
- TypeScript for type safety across the backend

**Authentication System:**
- JWT (JSON Web Tokens) for stateless authentication with 7-day expiration
- bcrypt for password hashing with 10 salt rounds
- HTTP-only cookies for secure token storage
- Role-based access control (RBAC) with four defined roles

**API Design:**
- RESTful endpoints under `/api` namespace
- JSON request/response format
- Zod schema validation for request payloads
- Authentication middleware for protected routes

**Data Layer:**
- Drizzle ORM for type-safe database queries
- PostgreSQL as the primary database (via Neon serverless)
- Schema-first approach with TypeScript inference
- Shared schema definitions between client and server

**Development Features:**
- Custom request logging middleware for API endpoints
- Vite integration for HMR in development
- Static file serving for production builds

### Database Schema

**Users Table:**
- Primary key: UUID (auto-generated)
- Fields: name, email (unique), password (hashed), role (enum)
- Role types: project_manager, team_member, finance, admin
- Enforced constraints: email uniqueness, password complexity

**Validation Rules:**
- Password: minimum 8 characters, requires uppercase letter and number
- Email: standard email format validation
- Name: minimum 2 characters

### External Dependencies

**Database:**
- Neon Serverless PostgreSQL with WebSocket support
- Connection pooling via @neondatabase/serverless
- Drizzle Kit for schema migrations

**UI Component Libraries:**
- Radix UI primitives for accessible, unstyled components
- Lucide React for iconography
- class-variance-authority for component variant management
- cmdk for command palette functionality

**Development Tools:**
- Replit-specific plugins for runtime error overlay and development banner
- tsx for TypeScript execution in development
- esbuild for production server bundling

**Authentication:**
- jsonwebtoken for JWT creation and verification
- bcrypt for password hashing
- cookie-parser for cookie handling middleware

**Build & Bundling:**
- Vite with React plugin for frontend builds
- PostCSS with Tailwind CSS and Autoprefixer
- Path aliasing for clean imports (@/, @shared/, @assets/)

**Type Safety:**
- Zod for runtime schema validation
- drizzle-zod for database schema to Zod conversion
- TypeScript strict mode enabled across the entire codebase