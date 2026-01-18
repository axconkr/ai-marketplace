# Setup Guide

Complete setup instructions for the AI Marketplace project.

## 1. Environment Setup

### System Requirements

- **Node.js**: 20.0.0 or higher
- **Package Manager**: npm (v10+) or pnpm (v8+)
- **Database**: PostgreSQL 14+
- **OS**: macOS, Linux, or Windows (WSL2 recommended)

### IDE Setup (Recommended)

#### VS Code Extensions

Install the following extensions for the best development experience:

```
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- TypeScript Vue Plugin (Vue.volar)
- Prisma (Prisma.prisma)
```

#### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 2. Installation Steps

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd AI_marketplace

# Install dependencies
npm install
# or
pnpm install
```

### Step 2: Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env  # or your preferred editor
```

**Required Variables**:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_marketplace"
JWT_SECRET="generate-a-secure-random-string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generate JWT Secret**:

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed database with sample data
npm run db:seed
```

### Step 4: Development Server

```bash
# Start development server
npm run dev

# Server will be available at http://localhost:3000
```

## 3. Development Workflow

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run type-check
```

### Database Operations

```bash
# Open Prisma Studio (Database GUI)
npm run db:studio

# Create migration
npm run db:migrate

# Reset database (development only)
npm run db:reset
```

### Testing (Future)

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 4. Production Deployment

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm run start
```

### Environment Variables (Production)

Set the following in your production environment:

```env
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
```

### Deployment Checklist

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Enable security headers
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up error tracking (e.g., Sentry)

## 5. Troubleshooting

### Common Issues

#### Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

#### Database Connection Error

```bash
# Verify PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l

# Create database if needed
createdb ai_marketplace
```

#### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules
npm install
```

#### Prisma Issues

```bash
# Regenerate Prisma Client
npm run db:generate

# Reset Prisma (warning: deletes all data)
npm run db:reset
```

### Getting Help

- Check existing [GitHub Issues](<repository-url>/issues)
- Read [Next.js Documentation](https://nextjs.org/docs)
- Read [Prisma Documentation](https://www.prisma.io/docs)
- Contact: support@example.com

## 6. Next Steps

After successful setup:

1. **Explore the Codebase**: Review project structure and components
2. **Read Documentation**: Check `/docs` folder for detailed guides
3. **Run Tests**: Ensure everything works correctly
4. **Start Developing**: Create your first feature!

## Additional Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
