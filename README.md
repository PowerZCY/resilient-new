# WindRun·Huaiin - Positive Life Journal

A full-stack application built with Next.js 14 for recording positive events and experiences in life.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Type System**: TypeScript
- **UI Components**:
  - shadcn/ui (based on Radix UI)
  - Tailwind CSS (styling system)
  - Lucide React (icon library)
- **Data Visualization**: 
  - React Calendar Heatmap (calendar heatmap)
  - Tremor (data visualization components)

### Backend
- **API**: Next.js API Routes (REST API)
- **Database**: PostgreSQL (relational database providing robust data consistency and query capabilities)
- **ORM**: Prisma (modern database toolkit for type-safe database access)
- **Logging System**: Custom Logger

## Requirements

- Node.js 18+ 
- PostgreSQL 15+ (database service)
- pnpm 8+ (high-performance package manager)

## Local Development Setup

1. Clone the repository and install dependencies
```bash
git clone <repository-url>
cd resilient-new
pnpm install
```

2. Environment Variables Configuration
Create a `.env` file and add the following configuration:
```plaintext
POSTGRES_PRISMA_URL="postgresql://username:password@localhost:5432/your-database"
POSTGRES_URL_NON_POOLING="postgresql://username:password@localhost:5432/your-database"
```

3. Database Migration
```bash
pnpm prisma migrate dev
```

4. Start Development Server
```bash
pnpm dev
```

Access the application at http://localhost:3000

## Project Structure

```plaintext
src/
├── app/                   # Next.js application directory
│   ├── api/               # API routes
│   ├── new/               # New record page
│   └── page.tsx           # Homepage
├── components/            # React components
├── lib/                   # Utility functions and configurations
└── middleware.ts          # Next.js middleware
```

## API Documentation

### 1. Get Timeline Data
- **Endpoint**: `/api/entries`
- **Method**: GET
- **Parameters**: 
  - `nickname`: User nickname (required)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
- **Response Example**:
```json
{
  "entries": [
    {
      "id": "string",
      "date": "2024-03-20T00:00:00.000Z",
      "content": "string",
      "nickname": "string"
    }
  ],
  "total": 100
}
```

### 2. Create New Record
- **Endpoint**: `/api/entries`
- **Method**: POST
- **Request Body**:
```json
{
  "date": "2024-03-20T00:00:00.000Z",
  "nickname": "string",
  "content": "string"
}
```

### 3. Get Heatmap Data
- **Endpoint**: `/api/entries/heatmap`
- **Method**: GET
- **Parameters**: 
  - `nickname`: User nickname (required)
- **Response Example**:
```json
[
  {
    "id": "string",
    "date": "2024-03-20T00:00:00.000Z"
  }
]
```

## Database Model

```prisma
model detail {
  id        String   @id @default(cuid())
  date      DateTime
  nickname  String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Deployment

The project is configured for direct deployment to Vercel platform:

1. Import project in Vercel
2. Configure environment variables
3. Deployment process will automatically handle database migration and build

## Development Guide

### Adding New Pages
Create a new directory and `page.tsx` file in the `src/app` directory.

### Adding New API Endpoints
Create a new directory and `route.ts` file in the `src/app/api` directory.

### Style Modifications
The project uses Tailwind CSS, with configuration in `tailwind.config.ts`.

### Common Commands Reference

#### pnpm Commands
```bash
# Install dependencies
pnpm install

# Add new dependency
pnpm add <package-name>

# Add development dependency
pnpm add -D <package-name>

# Update dependencies
pnpm update

# Run scripts
pnpm run <script-name>

# Clean dependency cache
pnpm store prune
```

#### Prisma Commands
```bash
# Generate Prisma Client
pnpm prisma generate

# Create new migration
pnpm prisma migrate dev --name <migration-name>

# Deploy migrations
pnpm prisma migrate deploy

# Reset database
pnpm prisma migrate reset

# View database
pnpm prisma studio
```

#### PostgreSQL Common Operations
```bash
# Create database
creatdb <database-name>

# Delete database
dropdb <database-name>

# Connect to database
psql -d <database-name>

# Common psql commands
\l          # List all databases
\c <dbname> # Connect to specified database
\dt         # Show all tables
\d <table>  # Show table structure
\q          # Quit
```

## Logging System

The project implements a custom logging system that automatically records all API requests and responses through middleware:

- Request logs include: timestamp, method, URL, query parameters, request body, etc.
- Response logs include: status code, response time, response headers, etc.
- Each request has a unique `X-Request-ID` for tracking

## Contributing Guide

1. Fork the project
2. Create a feature branch
3. Commit your changes, please do follow the [Git Commit Guidelines](docs/GitRules.md)
4. Push to the branch
5. Submit a Pull Request

## License

[MIT](LICENSE) - Copyright (c) 2025 D8ger