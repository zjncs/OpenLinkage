# Backend API Server

Express-based API server for health data management.

## Tech Stack

- **Framework**: Express
- **Language**: TypeScript
- **Database**: MySQL
- **Cache**: Redis
- **Authentication**: JWT with bcrypt
- **Validation**: Joi
- **Logging**: Winston
- **HTTP Client**: Axios

## Features

- User authentication and authorization
- Health data CRUD operations
- API endpoints for all health modules
- Request validation
- Error handling and logging
- Database connection management

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build TypeScript
npm run build

# Run production server
npm run start

# Run tests
npm run test
```

## Project Structure

- `src/` - Source code
  - `config/` - Configuration files
  - `common/` - Common utilities
  - `modules/` - Feature modules
- `dist/` - Compiled JavaScript (generated)

## Environment Variables

Create a `.env` file with:
- Database connection settings
- Redis connection settings
- JWT secret
- Other API keys as needed

## API Documentation

API endpoints are organized by modules. See source code for detailed endpoint documentation.

## License

MIT
