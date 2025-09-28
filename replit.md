# Guitar Marketplace Application

## Overview

GuitarVault is a modern full-stack web application for buying and selling guitars. It features a responsive React user interface backed by a Node/Express API and a PostgreSQL database. The application supports comprehensive guitar listings with image uploads, search/filter functionality, and a custom design system with a warm brown/orange aesthetic theme.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development experience
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for accessible, polished components
- **Styling**: Tailwind CSS with custom design system using CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **File Upload**: Uppy with dashboard interface for modern file upload experience

### Backend Architecture
- **Runtime**: Node.js with Express.js framework using TypeScript and ES modules
- **API Design**: RESTful API with JSON responses and comprehensive error handling
- **Database Layer**: Drizzle ORM for type-safe SQL queries and schema management
- **Middleware**: Helmet for security headers, compression for gzip responses, and request logging
- **Session Management**: Express-session with connect-pg-simple for database-persisted sessions
- **File Handling**: Integration with Google Cloud Storage for scalable image storage

### Data Storage Solutions
- **Primary Database**: PostgreSQL configured for Neon serverless deployment
- **ORM**: Drizzle ORM with migration support via Drizzle Kit
- **Schema Design**: Guitars table with comprehensive fields including brand, model, type, year, condition, price, description, status, and image arrays
- **File Storage**: Google Cloud Storage with signed URLs for secure access
- **Session Store**: PostgreSQL-based session persistence for user state management

### Authentication and Authorization
- **File Access Control**: Custom ACL (Access Control List) system for object-level permissions
- **Access Groups**: Flexible group-based access control supporting various membership types
- **Object Security**: Public and private access patterns with configurable search paths
- **Signed URLs**: Server-side generation of temporary access URLs for protected resources

## External Dependencies

### Cloud Services
- **Google Cloud Storage**: Primary file storage service with credential-based authentication
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit Integration**: Development environment with error overlays and debugging tools

### Third-Party Libraries
- **File Upload**: Uppy ecosystem (@uppy/core, @uppy/dashboard, @uppy/aws-s3, @uppy/react)
- **UI Framework**: Comprehensive Radix UI component suite for accessible primitives
- **Database**: @neondatabase/serverless for optimized PostgreSQL connections
- **Validation**: Zod for runtime type checking and schema validation
- **Development**: TSX for TypeScript execution, Vite plugins for enhanced development experience

### Build and Development Tools
- **TypeScript**: Full type safety across frontend, backend, and shared schemas
- **ESBuild**: Fast bundling for production server builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **Drizzle Kit**: Database schema management and migration tooling