# Overview

PassTrack is a secure, mobile-first fitness class pass tracking application that helps users manage both prepaid class passes and usage-based activities with user authentication. The app supports two tracking modes: traditional class packs (countdown from total classes) and pay-per-use activities like golf simulator hours or court reservations. Users can track usage, monitor costs, check into classes, and manage their fitness spending across multiple studios. Built with a React frontend and Express backend with Replit Auth integration, it focuses on clean, accessible design patterns inspired by fitness apps like Nike Training Club and productivity tools like Linear.

## Recent Changes (November 2025)

**Usage-Based Tracking System**:
- Dual tracking modes: Class Packs (prepaid classes) and Pay Per Use (usage-based activities)
- Extended database schema with trackingType discriminator and optional usage fields (unitType, costPerUnit, membershipFee)
- New usageSessions table for logging individual usage sessions with decimal precision units
- Session logging UI with date picker, units input, and auto-calculated cost display
- Real-time usage analytics showing total spent, session count, and accumulated units
- Conditional PassCard rendering: progress bars for class packs, analytics for usage-based activities
- API endpoints: POST /api/usage-sessions for logging sessions, GET /api/class-passes/:passId/analytics for fetching totals

## Previous Changes (October 2025)

**Comprehensive Security Implementation**:
- Added Replit Auth (OIDC) integration for user authentication
- All API endpoints now require authentication and filter data by user
- Landing page for logged-out users with login flow
- Logout functionality with secure session management
- Rate limiting on API endpoints (100 requests per 15 min, 5 login attempts per 15 min)
- Production security headers with Helmet
- CORS configuration for cross-origin security
- Input validation using Zod schemas for all create/update operations
- Database schema updated with users table and userId foreign key on class_passes

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theme support
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Responsive layouts with touch-friendly interfaces and bottom navigation

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth (OIDC) with session-based authentication
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **Security Middleware**: Helmet for security headers, CORS, rate limiting with express-rate-limit
- **API Design**: RESTful endpoints with `/api` prefix, all protected with authentication
- **Error Handling**: Centralized middleware for consistent error responses
- **Development**: Hot module replacement via Vite integration

## Data Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless driver
- **Schema**: Strongly typed with Zod validation schemas
- **Models**: 
  - Users (via Replit Auth)
  - Sessions (PostgreSQL session store)
  - Class passes with trackingType discriminator ('class_pack' | 'usage_based')
  - Usage sessions with doublePrecision units for decimal accuracy
  - All tables use UUID primary keys and userId foreign keys for isolation
- **Storage Interface**: Abstract storage layer for CRUD operations with user-scoped data access
- **Input Validation**: All API mutations validated with Zod schemas (insertClassPassSchema, updateClassPassSchema, insertUsageSessionSchema)

## Design System
- **Theme**: Light/dark mode support with CSS custom properties
- **Typography**: Inter font family from Google Fonts
- **Color Palette**: Teal primary colors with semantic variants for status indication
- **Components**: Consistent spacing with Tailwind's 4-8 unit system
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## Application Features
- **User Authentication**: Secure login with Replit Auth (supports Google, GitHub, email/password)
- **Landing Page**: Welcome screen for logged-out users with app features and login options
- **Dual Tracking Modes**:
  - **Class Packs**: Traditional prepaid class passes with countdown tracking (e.g., 10 yoga classes)
  - **Pay Per Use**: Usage-based activities with cost-per-unit tracking (e.g., $50/hour for golf simulator)
- **Pass Management**: Create, view, and track both class packs and usage-based activities (per-user isolation)
- **Session Logging**: Log usage sessions for pay-per-use activities with date, units, and notes
- **Usage Analytics**: 
  - Pie chart visualization showing class usage by studio
  - Real-time cost tracking for usage-based activities (total spent, sessions, accumulated units)
- **Check-in System**: Record class attendance and update remaining counts for class packs
- **Status Indicators**: Visual feedback for active, expiring, and expired passes
- **Archive System**: Archive passes no longer needed to keep dashboard clean and focused
- **Pass Extensions**: Add additional classes and cost to existing class packs
- **Logout**: Secure logout with session cleanup

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **express**: Web application framework for API endpoints
- **express-session**: Session middleware for authentication
- **connect-pg-simple**: PostgreSQL session store
- **openid-client**: OpenID Connect client for Replit Auth
- **helmet**: Security middleware for HTTP headers
- **cors**: Cross-origin resource sharing configuration
- **express-rate-limit**: Rate limiting middleware to prevent abuse
- **react**: Frontend UI framework with hooks and context
- **vite**: Build tool and development server

## UI and Styling
- **@radix-ui/***: Accessible component primitives (dialogs, dropdowns, forms)
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library for consistent iconography
- **class-variance-authority**: Component variant management
- **clsx**: Conditional CSS class utilities

## Form and Validation
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Form validation resolver integration
- **zod**: Schema validation for forms and API data
- **drizzle-zod**: Integration between Drizzle and Zod schemas

## Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds
- **drizzle-kit**: Database migration and schema management
- **postcss**: CSS post-processing with Tailwind integration

## Date and Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **nanoid**: Unique ID generation for database records
- **wouter**: Lightweight React router for navigation