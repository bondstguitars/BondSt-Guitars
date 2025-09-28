# Guitar Marketplace Application

## Overview

This is a full-stack guitar marketplace application built with React, Express, and PostgreSQL. The application allows users to browse, search, filter, and manage guitar listings with features like image uploads, detailed guitar specifications, and inventory management. It's designed as a modern web application with a clean, responsive interface for both buying and selling guitars.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system and CSS variables
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **File Upload**: Integration with Google Cloud Storage via object storage service
- **Data Storage**: In-memory storage with interface for future database integration
- **Error Handling**: Centralized error handling with custom error types

### Data Storage Solutions
- **Database**: PostgreSQL configured with Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Guitars table with comprehensive fields (brand, model, type, year, condition, price, images, etc.)
- **Migrations**: Drizzle Kit for database schema management
- **File Storage**: Google Cloud Storage for guitar images with ACL-based access control

### Authentication and Authorization
- **Object Access**: Custom ACL (Access Control List) system for file permissions
- **Access Groups**: Flexible group-based access control for different user types
- **File Security**: Public and private object access patterns with configurable search paths

### External Service Integrations
- **Google Cloud Storage**: Primary file storage with credential-based authentication via Replit sidecar
- **Uppy File Uploader**: Modern file upload interface with progress tracking and AWS S3 compatibility
- **Replit Integration**: Development tools including error overlays, cartographer, and dev banners

## External Dependencies

### Cloud Services
- **Google Cloud Storage**: Object storage for guitar images with ACL management
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Sidecar**: Authentication service for Google Cloud credentials

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless environments
- **drizzle-orm**: Type-safe SQL toolkit and query builder
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Comprehensive primitive UI components
- **@uppy/core, @uppy/react, @uppy/aws-s3**: File upload handling with cloud storage integration

### Development Tools
- **Vite**: Fast build tool with HMR and TypeScript support
- **@replit/vite-plugin-***: Development enhancement plugins for Replit environment
- **tailwindcss**: Utility-first CSS framework
- **zod**: TypeScript-first schema validation
- **react-hook-form**: Performant form library with minimal re-renders

## Recent Changes

### September 28, 2025 - Initial Replit Setup
- Configured Node.js 20 environment with full dependency installation
- Set up PostgreSQL database using Replit's built-in Neon database service
- Created database schema and pushed to PostgreSQL using Drizzle ORM
- Fixed development CSP (Content Security Policy) issues for Vite compatibility in Replit environment
- Configured workflow to serve on port 5000 with proper host configuration (0.0.0.0)
- Set up deployment configuration for autoscale with build and start commands
- Application successfully running with frontend/backend integration
- Note: Google Cloud Storage integration requires manual setup with service account credentials