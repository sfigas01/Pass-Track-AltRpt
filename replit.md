# Overview

FitPass is a mobile-first fitness class pass tracking application that helps users manage their gym and studio memberships. The app allows users to track remaining classes, monitor expiration dates, and check into classes across multiple fitness studios. Built with a React frontend and Express backend, it focuses on clean, accessible design patterns inspired by fitness apps like Nike Training Club and productivity tools like Linear.

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
- **API Design**: RESTful endpoints with `/api` prefix
- **Error Handling**: Centralized middleware for consistent error responses
- **Development**: Hot module replacement via Vite integration

## Data Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless driver
- **Schema**: Strongly typed with Zod validation schemas
- **Models**: Class passes and class bookings with UUID primary keys
- **Storage Interface**: Abstract storage layer for CRUD operations

## Design System
- **Theme**: Light/dark mode support with CSS custom properties
- **Typography**: Inter font family from Google Fonts
- **Color Palette**: Teal primary colors with semantic variants for status indication
- **Components**: Consistent spacing with Tailwind's 4-8 unit system
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## Application Features
- **Pass Management**: Create, view, and track fitness class passes
- **Usage Tracking**: Monitor remaining classes and expiration dates
- **Studio Support**: Multi-studio pass management
- **Check-in System**: Record class attendance and update remaining counts
- **Status Indicators**: Visual feedback for active, expiring, and expired passes

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **express**: Web application framework for API endpoints
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