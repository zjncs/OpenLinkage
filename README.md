# OpenLinkage

> 🔗 构建健康连接的智能底座
> A comprehensive health management platform with multi-agent AI framework and multiple client applications.

---

## 🚀 Overview / 简介

**OpenLinkage** is an open-source health management ecosystem that combines:
- 🧠 **Multi-Agent AI Framework** - Intelligent health assistants powered by AI
- 📱 **Multiple Client Applications** - Desktop, mobile, web, and WeChat mini-program
- 💾 **AI Memory Engine** - Short-term and long-term health data intelligence
- 🔒 **Privacy-First Architecture** - Local data processing and encryption
- 📊 **Health Data Integration** - Unified platform for all health metrics

---

## 📁 Project Structure

```
OpenLinkage/
├── openlinkage/           # Python Multi-Agent AI Framework
│   ├── agents.py          # Health Butler, Nutrition, Exercise, Medication agents
│   └── app.py             # FastAPI application
├── apps/                  # Client Applications
│   ├── desktop/           # Electron desktop app (灵犀健康)
│   ├── mobile/            # Mobile app (iOS/Android via Capacitor)
│   ├── miniprogram/       # WeChat mini program
│   └── web/               # Web applications (doctor/user portals)
├── packages/              # Shared Packages
│   ├── backend/           # Express API server
│   ├── core/              # Core utilities and types
│   └── health-data/       # WellAlly Health data management system
├── docs/                  # Documentation
└── tests/                 # Unit tests
```

---

## 🧩 Multi-Agent Framework

The Python-based multi-agent system provides intelligent health analysis:

```
User
└── Linkage Core
    ├── Health Butler Agent    # Overall health coordination
    ├── Nutrition Agent        # Dietary recommendations
    ├── Exercise Agent         # Fitness planning
    ├── Medication Agent       # Drug safety checks
    ├── Security Agent         # Privacy protection
    └── Memory Engine          # Context-aware intelligence
```

### Quick Start - AI Framework

```bash
# Setup Python environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run the FastAPI server
python run.py

# Run tests
python -m unittest discover -s tests -v
```

Visit [http://localhost:8000/docs](http://localhost:8000/docs) for API documentation.

### Example API Request

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
        "user_id": "demo-user",
        "symptoms": ["fatigue"],
        "goals": ["weight management"],
        "lifestyle_notes": "prefers evening workouts"
      }'
```

---

## 📱 Client Applications

### Desktop App (灵犀健康)
- **Location**: [apps/desktop](apps/desktop)
- **Tech Stack**: Electron, React, tRPC, Express, SQLite
- **Features**: Full-featured health management with offline support

### Mobile App
- **Location**: [apps/mobile](apps/mobile)
- **Tech Stack**: Vue 3, Capacitor, Vant UI
- **Platforms**: iOS, Android

### WeChat Mini Program
- **Location**: [apps/miniprogram](apps/miniprogram)
- **Platform**: WeChat ecosystem

### Web Applications
- **Doctor Portal**: [apps/web/doctor](apps/web/doctor)
- **User Portal**: [apps/web/portal](apps/web/portal)

### Quick Start - Client Apps

```bash
# Desktop App
cd apps/desktop
pnpm install
pnpm dev

# Mobile App
cd apps/mobile
npm install
npm run dev

# Backend API
cd packages/backend
npm install
npm run dev
```

---

## 📦 Shared Packages

### Backend API Server
- **Location**: [packages/backend](packages/backend)
- **Tech**: Express, TypeScript, MySQL, Redis
- **Features**: Authentication, health data CRUD, API endpoints

### Core Utilities
- **Location**: [packages/core](packages/core)
- **Contents**: AI integration, OAuth, notifications, shared types

### Health Data System
- **Location**: [packages/health-data](packages/health-data)
- **Features**: 28+ health analysis modules powered by Claude AI

---

## ⚙️ Tech Stack

### AI Framework
- **Backend**: Python, FastAPI, LangGraph
- **AI Integration**: OpenAI GPT, Qwen, Claude
- **Vector DB**: pgvector, Qdrant

### Client Applications
- **Desktop**: Electron, React, tRPC, SQLite
- **Mobile**: Vue 3, Capacitor
- **Web**: HTML/CSS/JavaScript, Node.js
- **Mini Program**: WeChat framework

### Infrastructure
- **Databases**: MySQL, SQLite, Redis
- **Privacy**: Decentralized encryption
- **Build Tools**: Vite, esbuild, TypeScript

---

## 📚 Documentation

- [Migration Guide](docs/MIGRATION.md) - Project reorganization details
- [Architecture Overview](docs/ARCHITECTURE.md) - System design
- [Project Structure](STRUCTURE.txt) - Directory layout

Each application and package has its own README with detailed setup instructions.

---

## 🔒 Privacy & Security

- Local-first data processing
- End-to-end encryption
- Privacy-preserving AI analysis
- GDPR compliance considerations
- User data ownership

---

## 🤝 Contributing

We welcome contributions! This project is open source under dual licensing:
- **AI Framework**: Apache 2.0
- **Client Applications**: MIT

Please submit issues, feature requests, or pull requests on GitHub.

---

## 📄 License

- Multi-Agent Framework: Apache 2.0
- Client Applications & Packages: MIT

---

## 🌟 Features

✅ Multi-agent AI health analysis
✅ Cross-platform client applications
✅ Privacy-first architecture
✅ Comprehensive health data tracking
✅ AI-powered insights and recommendations
✅ Offline-capable desktop and mobile apps
✅ WeChat integration for Chinese users
✅ Open API for third-party integrations

---

© 2025 Linkage Team & OpenLinkage Contributors. All rights reserved.
