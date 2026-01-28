# Core Package

Shared core utilities, types, and services used across applications.

## Contents

This package contains extracted core functionality from the desktop application:

### Services
- **context.ts** - Application context management
- **cookies.ts** - Cookie handling utilities
- **dataApi.ts** - Data API client
- **doubao.ts** - Doubao AI integration
- **env.ts** - Environment configuration
- **imageGeneration.ts** - Image generation service
- **llm.ts** - Large Language Model integration
- **map.ts** - Map services integration
- **notification.ts** - Notification system
- **oauth.ts** - OAuth authentication
- **sdk.ts** - SDK utilities
- **systemRouter.ts** - System routing
- **trpc.ts** - tRPC configuration
- **vite.ts** - Vite integration
- **voiceTranscription.ts** - Voice transcription service

### Types
- **types/** - TypeScript type definitions
- **errors.ts** - Error handling utilities

## Usage

This package can be imported by other applications in the monorepo to share common functionality.

```typescript
import { invokeDoubao } from '@openlinkage/core';
import { ENV } from '@openlinkage/core';
```

## Future Improvements

- Add proper package.json with exports
- Set up build process for distribution
- Add comprehensive tests
- Document all APIs

## License

MIT
