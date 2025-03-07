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
Create a `.env.local` file and add the following configuration:
```plaintext
# Database connection
POSTGRES_PRISMA_URL="postgresql://username:password@localhost:5432/your-database"
POSTGRES_URL_NON_POOLING="postgresql://username:password@localhost:5432/your-database"

# JWT configuration
JWT_SECRET="your_secure_jwt_secret_key_here"
```bash
# 64 charactors random secret  
openssl rand -hex 32 | tr '[:lower:]' '[:upper:]'
```

# Cookie configuration
COOKIE_MAX_AGE_DAYS="7"
COOKIE_REMEMBER_ME_DAYS="30"

# User credentials configuration
USER1_ID="1"
USER1_USERNAME="admin"
USER1_PASSWORD="admin123"
USER1_NICKNAME="Zia慢成"

USER2_ID="2"
USER2_USERNAME="user"
USER2_PASSWORD="user123"
USER2_NICKNAME="帝八哥"

# API configuration
API_DEFAULT_PAGE_SIZE="20"
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

## Authentication
- Simple Implementation (Phase 1)
  - Role Design:
    User: End user of the system
    Frontend: Client-side of the Next.js application
    Middleware: Next.js middleware for request interception and JWT validation
    Secret Configuration (.env.local): Stores sensitive information like JWT_SECRET
  - JWT Authentication Flow:
    After successful login, server generates and returns JWT token
    Frontend stores JWT token in Cookie
    All API requests pass through Middleware for verification
    Middleware validates JWT token
  - Middleware Implementation:
    Extends existing middleware.ts with JWT validation logic
    Checks JWT token in Cookie for API requests
    Uses JWT_SECRET from environment variables for validation
    Returns 401 error when validation fails
  - Logout Process:
    User clicks on the user icon in the interface
    System displays a confirmation dialog asking for logout confirmation
    Upon confirmation, frontend sends POST request to /api/auth/logout
    Server clears authentication Cookie
    Frontend redirects to login page
  - Security Considerations:
    JWT tokens should have appropriate expiration time
    Cookies should use HttpOnly and Secure flags
    Sensitive APIs should implement CSRF protection

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Middleware
    participant API
    participant ENV as .env.local

    %% Initialization Phase
    Note over Middleware,ENV: Application Startup
    Middleware->>ENV: Read JWT key
    ENV->>Middleware: Return JWT_SECRET

    %% Login Flow
    User->>Frontend: Access application
    Frontend->>Frontend: Check JWT token in Cookie
    
    alt No valid token
        Frontend->>Frontend: Display login interface
        User->>Frontend: Enter username and password
        Frontend->>API: Send login request POST /api/auth/login
        
        Note over API,Middleware: API request passes through Middleware
        Middleware->>API: Forward request (add X-Request-ID)
        
        API->>API: Validate user credentials
        
        alt Validation successful
            API->>API: Generate JWT token (signed with JWT_SECRET)
            API->>Frontend: Return success response and JWT token
            Frontend->>Frontend: Store JWT token in Cookie
            Frontend->>User: Show login success, redirect to homepage
        else Validation failed
            API->>Frontend: Return 401 error
            Frontend->>User: Display login failure message
        end
    else Valid token exists
        Frontend->>User: Directly display application content
    end
    
    %% Protected Resource Access Flow
    User->>Frontend: Request protected resource
    Frontend->>API: Send API request (JWT token in Cookie)
    
    Note over API,Middleware: All API requests pass through Middleware
    Middleware->>Middleware: Extract JWT token from Cookie
    Middleware->>Middleware: Validate token using JWT_SECRET
    
    alt Token valid
        Middleware->>API: Forward request (add user information)
        API->>API: Process business logic
        API->>Frontend: Return requested resource
        Frontend->>User: Display resource
    else Token invalid or expired
        Middleware->>Frontend: Return 401 unauthorized
        Frontend->>Frontend: Clear invalid token
        Frontend->>Frontend: Display login interface
        User->>Frontend: Login again
    end
    
    %% Logout Flow
    User->>Frontend: Click logout
    Frontend->>Frontend: Clear JWT token from Cookie
    Frontend->>API: Send logout request POST /api/auth/logout
    API->>Frontend: Return logout success
    Frontend->>User: Redirect to login page
```

- Future Standard SSO Implementation
```mermaid
sequenceDiagram
    participant User
    participant Client
    participant SSO
    participant Auth
    participant IdP
    participant API
    participant DB

    %% Initial Access Flow
    User->>Client: Access application
    Client->>Client: Check local session
    
    alt No valid session
        Client->>SSO: Redirect to SSO login page
        SSO->>SSO: Check SSO session Cookie
        
        alt No SSO session
            SSO->>User: Display login options
            
            alt Choose third-party login
                User->>SSO: Select identity provider (e.g., GitHub)
                SSO->>IdP: Redirect to IdP login page
                IdP->>User: Request user credentials
                User->>IdP: Provide credentials
                IdP->>IdP: Validate credentials
                IdP->>SSO: Return authentication code
                SSO->>IdP: Request token using auth code
                IdP->>SSO: Return access token and user info
            else Choose username/password login
                User->>SSO: Enter username and password
                SSO->>Auth: Validate credentials
                Auth->>DB: Query user information
                DB->>Auth: Return user data
                Auth->>Auth: Validate password
                Auth->>SSO: Return authentication result
            end
            
            SSO->>DB: Find/create user record
            DB->>SSO: Return user ID and roles
            SSO->>SSO: Generate JWT token and refresh token
            SSO->>SSO: Set SSO session Cookie
        else SSO session exists
            SSO->>SSO: Validate session validity
        end
        
        SSO->>Client: Redirect back to app (with auth code)
        Client->>SSO: Request token using auth code
        SSO->>Client: Return access token and refresh token
        Client->>Client: Store tokens (localStorage/Cookie)
    else Valid session exists
        Client->>Client: Continue using existing session
    end
    
    %% API Access Flow
    User->>Client: Request protected resource
    Client->>API: Request API (with access token)
    API->>API: Validate token
    
    alt Token valid
        API->>DB: Query required data
        DB->>API: Return data
        API->>Client: Return requested resource
        Client->>User: Display resource
    else Token invalid or expired
        API->>Client: Return 401 unauthorized
        Client->>SSO: Request new access token using refresh token
        
        alt Refresh token valid
            SSO->>Client: Return new access token
            Client->>API: Request API again (with new token)
            API->>Client: Return requested resource
            Client->>User: Display resource
        else Refresh token invalid
            SSO->>Client: Return authentication error
            Client->>SSO: Redirect to SSO login page
        end
    end
    
    %% Logout Flow
    User->>Client: Request logout
    Client->>Client: Clear local tokens
    Client->>SSO: Request SSO logout
    SSO->>SSO: Clear SSO session
    SSO->>IdP: Request IdP logout (optional)
    SSO->>Client: Return logout success
    Client->>User: Display logout success page
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
