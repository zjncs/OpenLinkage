# Architecture Overview

## System Architecture

OpenLinkage is a comprehensive health management platform consisting of multiple client applications and shared backend services.

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Desktop    │    Mobile    │ Mini Program │   Web Apps     │
│  (Electron)  │ (Capacitor)  │   (WeChat)   │ (Doctor/User)  │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                            │
       ┌────────────────────┴────────────────────┐
       │                                         │
┌──────▼──────┐                         ┌───────▼────────┐
│   Backend   │                         │  Core Package  │
│  API Server │                         │   (Utilities)  │
└─────────────┘                         └────────────────┘
       │
┌──────▼──────────────────────────────────────────────┐
│              External Services                      │
├─────────────┬──────────────┬────────────────────────┤
│  Doubao AI  │   Database   │  Health Data System   │
│             │ (MySQL/SQLite)│    (WellAlly)        │
└─────────────┴──────────────┴────────────────────────┘
```

## Application Details

### Desktop App
- **Technology**: Electron + React + tRPC
- **Database**: SQLite (local)
- **Features**: Full-featured health management with offline support
- **Target Users**: Desktop users wanting comprehensive features

### Mobile App
- **Technology**: Vue 3 + Capacitor
- **Platforms**: iOS, Android
- **Features**: On-the-go health tracking with native capabilities
- **Target Users**: Mobile users needing portable access

### Mini Program
- **Technology**: WeChat Mini Program
- **Platform**: WeChat ecosystem
- **Features**: Lightweight health tracking within WeChat
- **Target Users**: WeChat users in China

### Web Applications
- **Doctor Portal**: Interface for healthcare providers
- **User Portal**: Web-based interface for end users
- **Technology**: HTML/CSS/JavaScript with Node.js backend

## Package Details

### Backend Package
- **Purpose**: Centralized API server
- **Technology**: Express + TypeScript
- **Database**: MySQL
- **Cache**: Redis
- **Features**: Authentication, health data CRUD, API endpoints

### Core Package
- **Purpose**: Shared utilities and services
- **Contents**: AI integration, OAuth, notifications, data APIs
- **Usage**: Imported by desktop app and potentially other apps

### Health Data Package
- **Purpose**: Claude AI-powered health analysis
- **Features**: 28+ health analysis modules
- **Technology**: Claude Code skills and specialists
- **Usage**: Standalone health data management system

## Data Flow

### Health Data Recording
```
User Input → Client App → Validation → Local/Remote Storage → Database
```

### AI Analysis
```
Health Data → Backend API → AI Service (Doubao) → Analysis Results → Client Display
```

### Report Generation
```
Historical Data → Aggregation → AI Analysis → Report Generation → PDF/Display
```

## Technology Stack Summary

### Frontend
- **Desktop**: React 19, Tailwind CSS, Wouter
- **Mobile**: Vue 3, Vant UI, Pinia
- **Mini Program**: WeChat Mini Program framework

### Backend
- **API Server**: Express, TypeScript
- **Desktop Backend**: Express, tRPC
- **Database**: MySQL (backend), SQLite (desktop)
- **ORM**: Drizzle (desktop)

### AI & Services
- **AI Provider**: Doubao AI
- **Health Analysis**: Claude AI (WellAlly)
- **Authentication**: JWT, OAuth
- **Maps**: Map service integration
- **Voice**: Voice transcription service

### Build Tools
- **Desktop**: Vite, esbuild, Electron Builder
- **Mobile**: Vite, Capacitor CLI
- **Backend**: TypeScript compiler

## Security Considerations

### Authentication
- JWT-based authentication
- OAuth integration for third-party login
- Session management with secure cookies

### Data Protection
- Local encryption for sensitive data (desktop)
- HTTPS for all API communications
- Input validation and sanitization

### Privacy
- Local-first approach for desktop app
- User data ownership
- GDPR compliance considerations

## Scalability

### Current Architecture
- Monolithic backend API
- Client-side rendering
- Local databases for desktop/mobile

### Future Considerations
- Microservices architecture
- API gateway
- Distributed caching
- Load balancing
- Database sharding

## Development Workflow

### Local Development
1. Each app runs independently
2. Backend API runs separately
3. Mock data for testing

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows

### Deployment
- Desktop: Electron Builder → DMG/NSIS installers
- Mobile: Capacitor → App Store/Play Store
- Web: Static hosting or Node.js server
- Backend: Docker containers or traditional hosting

## Future Roadmap

### Short Term
- Unified authentication across all apps
- Real-time data synchronization
- Enhanced offline support

### Long Term
- Microservices architecture
- GraphQL API layer
- Advanced analytics dashboard
- Third-party integrations (wearables, EHR systems)
- Multi-language support
- Telemedicine features

## Contributing

When contributing to the architecture:
1. Maintain separation of concerns
2. Follow existing patterns
3. Document architectural decisions
4. Consider backward compatibility
5. Update this document with significant changes
