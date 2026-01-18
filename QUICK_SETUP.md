# Quick Setup Guide - AI Marketplace Frontend

## Prerequisites

- Node.js 20+
- npm or pnpm

## Installation (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## Project Structure

```
AI_marketplace/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   └── layout/            # Layout components
│       ├── header.tsx
│       ├── footer.tsx
│       └── navigation.tsx
├── lib/utils/             # Utilities
├── types/                 # TypeScript types
└── public/                # Static assets
```

## Available Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm run format   # Format code
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React

## What's Included

✅ Next.js 14 with App Router
✅ TypeScript strict mode
✅ Tailwind CSS custom theme
✅ shadcn/ui components (Button, Card, Input, Label)
✅ Layout components (Header, Footer, Navigation)
✅ Responsive design
✅ ESLint + Prettier
✅ Production optimizations

## Next Steps

1. Customize theme: `tailwind.config.ts`
2. Add pages: Create files in `app/`
3. Add components: Create in `components/`
4. Add API routes: Create in `app/api/`

## Documentation

- FRONTEND_SETUP_COMPLETE.md - Complete setup details
- INSTALLATION.md - Installation guide
- README.md - Project overview
- SETUP.md - Detailed setup

## Support

For issues, check the documentation files above.
