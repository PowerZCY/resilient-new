# WindRun·Huaiin - Positive Life Journal[中文版本](README.zh.md)

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

## UI Design and Components

The application features a modern, minimalist, and elegant design style that follows JetBrains design language, focusing on user experience and visual consistency.

### Core Components

#### Timeline Component
- **Design Features**: Vertical flowing timeline displaying positive events recorded by users
- **Interactive Experience**:
  - Smooth scroll loading animations
  - Progressive content display with fade-in effects for new entries
  - Virtual list rendering ensuring performance with large datasets
- **Visual Elements**:
  - Card-style design for each entry with subtle shadows and rounded corners
  - Time markers with distinctive colors for differentiation
  - Content areas with clear typography and appropriate whitespace

#### Progress Indicator
- **Design Features**: Spherical progress indicator showing data loading status and currently selected item
- **Interactive Experience**:
  - Smooth animation transitions
  - Tooltip displaying detailed information on hover
- **Visual Elements**:
  - Concentric circle design with outer and inner circles
  - Dynamic color feedback based on loading progress
  - Highlight indication for currently selected item

#### User Switcher (NicknameFilter)
- **Design Features**:
  - Tab-style switching interface replacing traditional dropdown menus, providing more intuitive user identity switching
  - Combination of user icons and text labels enhancing visual recognition
  - Gradient background providing a premium feel while conveying state information through color changes
  - Compact yet elegant layout, occupying appropriate space while maintaining visual appeal
  - Seamless integration into the application's top navigation area, allowing for easy user identity switching

- **Interactive Experience**:
  - Smooth transition animations when switching between users, implemented with Framer Motion for visual continuity during state changes
  - Hover states providing subtle scaling and background changes, enhancing clickability perception
  - Click states with clear visual feedback, including background color changes and indicator dot movement
  - Related data (timeline, heatmap, etc.) updates following user switching, maintaining contextual consistency
  - Current user selection persisted to URL parameters, supporting state preservation after page refresh

- **Visual Elements**:
  - Gradient background transitioning from pink to indigo, creating a modern and energetic feel
  - Active user identified through triple indicators: white background, color dot, and text style changes
  - Circular user icon area with dynamic coloring based on the currently selected user
  - Subtle glow animation around icons, enhancing visual hierarchy and focus
  - Text labels with clear font and appropriate weight, ensuring readability across various screen sizes

- **Technical Implementation**:
  - Built on React state management and Next.js routing system
  - Current selection stored in URL query parameters (`?nickname=username`), supporting navigation between pages and refresh
  - Component internally uses `useSearchParams` and `useRouter` hooks to handle routing state
  - Debouncing implemented to prevent excessive route updates during frequent switching
  - Default user automatically set on first load, ensuring the application always has a valid user context

- **Customizability**:
  - User data (names and colors) defined through configuration objects, easily extensible or modifiable
  - Visual styling implemented through a combination of Tailwind classes and inline styles, facilitating theme adjustments
  - Component structure modularized, allowing features to be added or removed as needed (such as user avatars, additional information, etc.)
  - Animation parameters adjustable to accommodate different performance requirements or visual preferences

- **Use Cases**:
  - Multi-user shared device applications requiring quick user identity switching
  - Dashboards or management interfaces needing to switch between different roles or perspectives
  - Family sharing applications such as family notebooks, shared calendars, etc.
  - Any modern web application requiring an elegant user switching solution

#### Heatmap
- **Design Features**: Calendar-style heatmap visually representing recording frequency
- **Interactive Experience**:
  - Hover displays specific dates and record counts
  - Clicking navigates to detailed records for corresponding dates
- **Visual Elements**:
  - Color intensity indicating record density
  - Grid layout ensuring date alignment
  - Clear month and weekday markers

### Page Designs

#### Homepage
- **Layout**: Sectioned design with user switching and statistics overview at the top, timeline in the middle, and heatmap on the right
- **Responsiveness**: Layout automatically adjusts for different screen sizes ensuring optimal display
- **Theme**: Bright background tones paired with soft accent colors creating a positive and cheerful atmosphere

#### New Record Page
- **Layout**: Clean form design focused on content creation
- **Interaction**: Real-time preview and form validation providing immediate feedback
- **Auxiliary Features**: Date picker, rich text editor, and emoji selector

### Design Principles
- **Consistency**: All components follow a unified design language including colors, fonts, and spacing
- **Accessibility**: Complies with WCAG standards ensuring usability for users with different abilities
- **Performance Priority**: Optimized rendering and animations ensuring smooth user experience
- **Intuitive Operation**: Reduced learning curve with self-explanatory interface elements

### Animations and Transitions
- Framer Motion implementation for smooth state transitions and micro-interactions
- Progressive animations for loading states reducing perceived waiting time
- Page transition effects enhancing navigation coherence

### Backend
- **API**: Next.js API Routes (REST API)
- **Database**: PostgreSQL (relational database providing robust data consistency and query capabilities)
- **ORM**: Prisma (modern database toolkit for type-safe database access)
- **Logging System**: Custom Logger

## Requirements

- Node.js 18+ 
- PostgreSQL 15+ (database service)
- pdadmin4 (database management tool)
- pnpm 8+ (high-performance package manager)

## Local Development Setup

1. Clone the repository and install dependencies
```bash
git clone https://github.com/PowerZCY/resilient-new/
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
3. Commit your changes, please do follow the [Git Commit Guidelines](./docs/GitRule.md)
4. Push to the branch
5. Submit a Pull Request

## License

[MIT](LICENSE) - Copyright (c) 2025 D8ger