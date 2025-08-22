# SongVexxt - AI Songwriting Assistant

## Overview

SongVexxt is an AI-powered songwriting assistant that helps users create better lyrics faster. The application features a cyberpunk-themed interface with two main modes: an overlay mode for writing in any text field and an expanded workspace for comprehensive songwriting. It integrates with external APIs for rhyme suggestions and synonyms, uses OpenAI for AI-powered songwriting assistance, and provides real-time collaboration features for lyric creation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern component-based architecture using functional components and hooks
- **Vite**: Fast build tool and development server with hot module replacement
- **Wouter**: Lightweight client-side routing library for navigation
- **TanStack Query**: Server state management for API calls, caching, and synchronization
- **Tailwind CSS + shadcn/ui**: Utility-first styling with pre-built component library using Radix UI primitives
- **Custom Theming**: Cyberpunk aesthetic with neon colors, glass effects, and custom CSS variables

### Backend Architecture
- **Express.js**: RESTful API server with middleware for request logging and error handling
- **TypeScript**: Type-safe server-side development with ESM modules
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Route Organization**: Centralized route registration with authentication middleware

### Database Layer
- **PostgreSQL**: Primary database using Neon serverless connection
- **Drizzle ORM**: Type-safe database operations with schema definition
- **Schema Design**: 
  - Users table for authentication (mandatory for Replit Auth)
  - Projects table for song management with active project tracking
  - Sections table for organizing song parts
  - Sessions table for authentication state persistence

### Authentication System
- **Replit Auth**: OAuth integration using OpenID Connect
- **Passport.js**: Authentication middleware with custom strategy
- **Session-based**: Secure cookie-based sessions with PostgreSQL persistence
- **User Management**: Automatic user creation and profile synchronization

### AI Integration
- **OpenAI GPT-4o**: Advanced language model for generating song suggestions, next lines, and alternative words
- **Structured Responses**: JSON-formatted AI outputs for consistent data handling
- **Context-aware**: AI suggestions based on current lyrics and song section context

## External Dependencies

### Third-party APIs
- **DataMuse API**: Free rhyming and synonym service for word suggestions and vocabulary enhancement
- **OpenAI API**: GPT-4o model for AI-powered songwriting assistance and creative suggestions

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket connections for real-time features
- **Connection Pooling**: Efficient database connections using @neondatabase/serverless

### Authentication Services
- **Replit Auth**: OAuth provider integration for seamless user authentication in Replit environment
- **OpenID Connect**: Standard protocol implementation for secure authentication flows

### Development Tools
- **Replit Integration**: Custom Vite plugins for development environment enhancement and error handling
- **TypeScript**: Full-stack type safety with path mapping and module resolution
- **ESBuild**: Fast production bundling for server-side code compilation