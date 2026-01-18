# AI Marketplace

AI 자동화 솔루션(n8n 템플릿, AI Agent, 바이브코딩 앱)을 거래할 수 있는 신뢰 기반 마켓플레이스 플랫폼

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: JWT

## Project Structure

```
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── layout/          # Global layout components
│   ├── notifications/   # Notification-related components
│   ├── products/        # Product-related components
│   └── ui/              # Shared UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
│   ├── validators/      # Input validation schemas
│   └── auth/            # Authentication utilities
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## Recent Updates

### Latest Features
- ✅ Wishlist UI Integration
- ✅ Enhanced Notification System
- ✅ Secure Password Change Workflow

### Testing
- 82% Test Coverage
- Comprehensive Security Testing
- Full Browser Compatibility

See `DEVELOPMENT_FINAL_STATUS.md` and `TESTING_FINAL_SUMMARY.md` for detailed information.

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- npm or pnpm
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment file: `cp .env.example .env`
4. Set up database: `npm run db:generate && npm run db:push`
5. Run development server: `npm run dev`

Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code

See SETUP.md for detailed instructions.