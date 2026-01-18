# Installation Guide - AI Marketplace

Complete installation and setup instructions for the AI Marketplace Next.js 14 application.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev
```

Visit http://localhost:3000

## Detailed Setup

### 1. System Requirements

- **Node.js**: 20.0.0 or higher
- **npm**: 10.0.0 or higher (or pnpm 8.0.0+)
- **Operating System**: macOS, Linux, or Windows (WSL2)

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- Next.js 16.1.1
- React 19.2.3
- TypeScript 5.9.3
- Tailwind CSS 4.1.18
- shadcn/ui components
- Lucide React icons

### 3. Environment Configuration

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NEXT_PUBLIC_APP_NAME="AI Marketplace"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at:
- Local: http://localhost:3000
- Network: http://[your-ip]:3000

### 5. Build for Production

```bash
# Create production build
npm run build

# Start production server
npm run start
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |
| `npm run format` | Format code with Prettier |

## Project Structure

```
AI_marketplace/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes (grouped)
│   │   ├── login/
│   │   └── register/
│   ├── (marketplace)/           # Marketplace routes (grouped)
│   │   ├── products/
│   │   └── dashboard/
│   ├── api/                     # API routes
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles with CSS variables
├── components/
│   ├── ui/                      # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   └── layout/                  # Layout components
│       ├── header.tsx           # Main header with navigation
│       ├── footer.tsx           # Footer with links
│       ├── navigation.tsx       # Sidebar navigation
│       └── index.ts             # Layout exports
├── lib/
│   └── utils/
│       ├── cn.ts                # Tailwind class utility
│       └── index.ts
├── types/
│   └── index.ts                 # TypeScript type definitions
├── public/                      # Static assets
│   ├── images/
│   └── fonts/
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── postcss.config.js            # PostCSS configuration
└── package.json                 # Dependencies and scripts
```

## Configuration Files

### next.config.js

Features:
- React strict mode enabled
- Image optimization (AVIF, WebP)
- Security headers
- Turbopack support (Next.js 16+)
- Production optimizations

### tsconfig.json

Features:
- Strict type checking
- Path aliases (@/*)
- Modern ES2022 target
- JSX preserve mode

### tailwind.config.ts

Features:
- Custom color palette
- Extended spacing scale
- Custom animations
- Dark mode support
- Container utilities

## UI Components

### shadcn/ui Components

Pre-configured components:
- **Button**: Multiple variants (default, outline, ghost, link)
- **Card**: Card container with header, content, footer
- **Input**: Form input with focus states
- **Label**: Form label component

### Layout Components

- **Header**: Responsive navigation with mobile menu
- **Footer**: Site footer with links and social icons
- **Navigation**: Sidebar navigation for dashboard

## Styling System

### Tailwind CSS

Custom theme with:
- Primary color: Blue (#0ea5e9)
- Dark mode ready
- Responsive breakpoints
- Custom animations (accordion, fade, slide)

### CSS Variables

Global CSS variables for theming:
```css
--background
--foreground
--primary
--secondary
--accent
--muted
--destructive
```

## Development Workflow

### Code Quality

```bash
# Check code quality
npm run lint

# Format code
npm run format
```

### Hot Reload

The development server supports hot module replacement (HMR):
- Instant feedback on changes
- Preserves component state
- Fast refresh

## Troubleshooting

### Port Already in Use

```bash
# Use different port
PORT=3001 npm run dev
```

### Clear Build Cache

```bash
rm -rf .next
npm run dev
```

### TypeScript Errors

```bash
# Clear cache
rm -rf node_modules/.cache
npm install
```

## Next Steps

1. **Customize Theme**: Edit `tailwind.config.ts` for brand colors
2. **Add Components**: Create new components in `components/`
3. **Add Routes**: Create new pages in `app/`
4. **Configure Backend**: Set up API routes in `app/api/`
5. **Add Authentication**: Implement auth flow
6. **Add Database**: Configure Prisma and PostgreSQL

## Support

For issues or questions:
- Check documentation files (README.md, SETUP.md)
- Review Next.js 14 documentation
- Check shadcn/ui documentation

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
