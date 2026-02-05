# Lumenia - AI Chat Application

## Overview

Lumenia is a cyberpunk-themed AI chat application built with a full-stack TypeScript architecture. The application provides a conversational AI interface with support for text and voice interactions, featuring a neon-styled UI design. Users can create multiple chat sessions, configure AI behavior through settings, and interact with OpenAI-powered models through the Replit AI Integrations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with custom cyberpunk theme variables, shadcn/ui components
- **Build Tool**: Vite with hot module replacement
- **UI Components**: Radix UI primitives wrapped in shadcn/ui, plus custom components like CyberButton
- **Animations**: Framer Motion for smooth transitions

Path aliases configured:
- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript compiled with tsx
- **API Pattern**: RESTful endpoints defined in shared route contracts
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Build**: esbuild for production bundling with selective dependency bundling

The server serves both API routes and the built frontend static files in production. In development, Vite middleware handles frontend serving with HMR.

### Shared Code Structure
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions, Zod schemas, and TypeScript types
- `routes.ts`: API contract definitions with paths, methods, and response schemas

This pattern ensures type safety across the full stack without duplication.

### Data Layer
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **ORM**: Drizzle ORM with node-postgres driver
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization
- **Tables**:
  - `settings`: AI configuration (system prompt, model, temperature)
  - `conversations`: Chat session metadata
  - `messages`: Individual chat messages with role and content

### AI Integration Pattern
The application uses Replit AI Integrations for OpenAI access:
- Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`
- Supports text chat, voice transcription, text-to-speech, and image generation
- Modular integration code in `server/replit_integrations/` organized by feature (audio, chat, image, batch)

### Client Integration Utilities
Voice chat utilities in `client/replit_integrations/audio/`:
- AudioWorklet for streaming PCM16 playback
- React hooks for recording (`useVoiceRecorder`) and playback (`useAudioPlayback`)
- SSE streaming handler (`useVoiceStream`)

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage (if sessions are enabled)

### AI Services
- **OpenAI API**: Accessed through Replit AI Integrations
  - Text completions for chat
  - Speech-to-text transcription
  - Text-to-speech synthesis
  - Image generation (gpt-image-1)

### Key NPM Packages
- **drizzle-orm** / **drizzle-kit**: Database ORM and migration tooling
- **@tanstack/react-query**: Async state management
- **react-markdown**: Markdown rendering in chat messages
- **framer-motion**: Animation library
- **react-textarea-autosize**: Auto-growing input fields
- **date-fns**: Date formatting utilities
- **zod**: Runtime schema validation
- **lucide-react**: Icon library

### Build and Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay