# OpenLinkage

A comprehensive health management platform with multiple client applications and shared services.

## Project Structure

```
OpenLinkage/
├── apps/              # Client applications
│   ├── desktop/       # Electron desktop app (灵犀健康)
│   ├── mobile/        # Mobile app (iOS/Android via Capacitor)
│   ├── miniprogram/   # WeChat mini program
│   └── web/           # Web applications
│       ├── doctor/    # Doctor portal
│       └── portal/    # User portal
├── packages/          # Shared packages
│   ├── backend/       # Express API server
│   ├── core/          # Core utilities and types
│   └── health-data/   # WellAlly Health data management system
└── docs/              # Documentation

```

## Applications

### Desktop App
- **Location**: [apps/desktop](apps/desktop)
- **Tech Stack**: Electron, React, tRPC, Express, SQLite
- **Description**: Full-featured desktop application for health management

### Mobile App
- **Location**: [apps/mobile](apps/mobile)
- **Tech Stack**: Vue 3, Capacitor, Vant UI
- **Description**: Cross-platform mobile app for iOS and Android

### Mini Program
- **Location**: [apps/miniprogram](apps/miniprogram)
- **Tech Stack**: WeChat Mini Program
- **Description**: WeChat-based health management interface

### Web Applications
- **Doctor Portal**: [apps/web/doctor](apps/web/doctor)
- **User Portal**: [apps/web/portal](apps/web/portal)

## Packages

### Backend
- **Location**: [packages/backend](packages/backend)
- **Description**: Express-based API server with authentication and health data management

### Core
- **Location**: [packages/core](packages/core)
- **Description**: Shared core utilities, types, and services

### Health Data
- **Location**: [packages/health-data](packages/health-data)
- **Description**: WellAlly Health data management system with Claude AI integration

## Getting Started

Each application and package has its own README with specific setup instructions.

### Prerequisites
- Node.js >= 18.0.0
- Python >= 3.8 (for health-data package)
- pnpm (recommended) or npm

### Quick Start

1. Install dependencies for a specific app:
```bash
cd apps/desktop
pnpm install
```

2. Run development server:
```bash
pnpm dev
```

## License

MIT
