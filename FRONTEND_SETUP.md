# Frontend Setup Documentation

## Overview
This document describes the foundational Next.js application structure for the AI Marketplace frontend.

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: React Query (@tanstack/react-query)
- **Authentication**: Custom JWT-based auth with Context API
- **HTTP Client**: Native fetch with custom error handling

### Project Structure

```
/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Homepage
│   └── globals.css               # Global styles
├── components/
│   ├── auth/
│   │   ├── logout-button.tsx     # Logout button component
│   │   └── protected-route.tsx   # HOC for protected routes
│   ├── layout/
│   │   ├── header.tsx            # Main navigation header
│   │   ├── footer.tsx            # Footer component
│   │   ├── navigation.tsx        # Navigation component
│   │   └── index.ts              # Exports
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── form.tsx
│       ├── dropdown-menu.tsx
│       ├── dialog.tsx
│       ├── toast.tsx
│       └── ...
├── lib/
│   ├── api/
│   │   ├── error-handler.ts      # HTTP client with retry logic
│   │   ├── auth.ts               # Auth API functions
│   │   ├── products.ts           # Products API functions
│   │   ├── orders.ts             # Orders API functions
│   │   ├── payment.ts            # Payment API functions
│   │   ├── verifications.ts      # Verifications API functions
│   │   └── index.ts              # API exports
│   ├── hooks/
│   │   └── use-products.ts       # React Query hooks for products
│   ├── auth-context.tsx          # Authentication context & hooks
│   ├── react-query.tsx           # React Query setup & query keys
│   └── utils.ts                  # Utility functions
├── contexts/
│   └── cart-context.tsx          # Shopping cart context
└── src/
    └── lib/
        └── auth/
            └── types.ts           # Auth type definitions
```

## Core Components

### 1. Root Layout (`app/layout.tsx`)

The root layout provides:
- HTML structure with Inter font
- Comprehensive metadata (SEO, Open Graph, Twitter Cards)
- Provider hierarchy:
  1. QueryProvider (React Query)
  2. AuthProvider (Authentication)
  3. ToastProvider (Notifications)
  4. CartProvider (Shopping cart)

### 2. React Query Setup (`lib/react-query.tsx`)

**Configuration:**
- Stale time: 60 seconds
- Cache time: 5 minutes
- Retry: 3 attempts for queries, 1 for mutations
- No refetch on window focus by default

**Query Keys:**
Centralized query keys for consistency:
```typescript
queryKeys.products.list(filters)
queryKeys.products.detail(id)
queryKeys.products.myProducts()
queryKeys.orders.list(filters)
queryKeys.user.current
// etc.
```

### 3. API Client (`lib/api/error-handler.ts`)

**Features:**
- Automatic JWT token injection from localStorage
- Retry logic with exponential backoff
- Comprehensive error handling
- 401 auto-redirect to login
- User-friendly error messages (Korean)

**Usage:**
```typescript
import { apiFetch } from '@/lib/api/error-handler';

const data = await apiFetch<ResponseType>('/endpoint', {
  method: 'POST',
  body: JSON.stringify(payload),
}, {
  retry: { maxRetries: 3 },
  skipAuth: false, // optional
});
```

### 4. Auth Context (`lib/auth-context.tsx`)

**Features:**
- Global authentication state
- JWT token management
- Login/logout/register functions
- User data refresh
- Cross-tab synchronization

**Hooks:**
```typescript
// Basic auth hook
const { user, isAuthenticated, login, logout, register } = useAuth();

// Auto-redirect if not authenticated
const { user, isLoading } = useRequireAuth();
```

### 5. Protected Route Component (`components/auth/protected-route.tsx`)

**Usage:**
```typescript
// Wrap entire page
<ProtectedRoute>
  <YourPage />
</ProtectedRoute>

// With role requirements
<ProtectedRoute requiredRole="service_provider">
  <SellerDashboard />
</ProtectedRoute>

// HOC version
export default withAuth(YourPage, {
  requiredRole: 'admin'
});
```

### 6. Layout Components

**Header (`components/layout/header.tsx`):**
- Responsive navigation
- Authentication state display
- Mobile menu
- Shopping cart link
- User profile dropdown

**Footer (`components/layout/footer.tsx`):**
- Product/Company/Support/Legal links
- Social media links
- Copyright notice

## API Integration

### Backend Endpoints Available

**Authentication:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

**Products:**
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/me` - Get my products

### React Query Integration Example

```typescript
import { useProducts, useProduct, useCreateProduct } from '@/lib/hooks/use-products';

function ProductsList() {
  const { data, isLoading, error } = useProducts({
    category: 'workflow',
    page: 1,
    limit: 20,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function CreateProduct() {
  const { mutate, isPending } = useCreateProduct();

  const handleSubmit = (data) => {
    mutate(data, {
      onSuccess: () => {
        // Handle success
      },
      onError: (error) => {
        // Handle error
      },
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## UI Components (shadcn/ui)

### Installed Components
- ✅ Button
- ✅ Card
- ✅ Input
- ✅ Label
- ✅ Form (with react-hook-form integration)
- ✅ Dialog
- ✅ Dropdown Menu
- ✅ Toast
- ✅ Badge
- ✅ Checkbox
- ✅ Select
- ✅ Tabs
- ✅ Table
- ✅ Textarea
- ✅ Progress
- ✅ Slider
- ✅ Separator
- ✅ Skeleton
- ✅ Avatar
- ✅ Sheet

### Adding New Components

```bash
npx shadcn@latest add [component-name]
```

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=/api
```

## Best Practices

### 1. Server Components by Default
Use React Server Components unless you need:
- Client-side interactivity (onClick, useState, etc.)
- Browser APIs
- React hooks

Mark client components with `'use client'` directive.

### 2. API Calls
- Always use the API client functions from `lib/api/`
- Use React Query hooks for data fetching
- Handle loading and error states

### 3. Authentication
- Use `useAuth()` hook for auth state
- Wrap protected pages with `<ProtectedRoute>`
- Check user roles before showing admin/seller features

### 4. Type Safety
- Import types from `@/src/lib/auth/types`
- Use TypeScript strict mode
- Define interfaces for all API responses

### 5. Styling
- Use Tailwind utility classes
- Follow existing component patterns
- Use `cn()` utility for conditional classes

## Next Steps

### Pages to Implement
1. Login page (`/login`)
2. Register page (`/register`)
3. Products list page (`/products`)
4. Product detail page (`/products/[id]`)
5. Create product page (`/products/new`)
6. User profile page (`/profile`)
7. Dashboard (`/dashboard`)
8. Shopping cart (`/cart`)
9. Checkout (`/checkout`)

### Features to Add
1. Search functionality
2. Filtering and sorting
3. Shopping cart operations
4. Payment integration
5. Review system
6. Notification system
7. User verification flow

## File Paths Reference

All file paths are absolute from the project root:
- `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/`

### Key Files Created
1. `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/lib/react-query.tsx`
2. `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/lib/auth-context.tsx`
3. `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/auth/protected-route.tsx`
4. `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/lib/api/auth.ts`
5. `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/lib/api/index.ts`
6. `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/lib/hooks/use-products.ts`
7. `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/ui/dropdown-menu.tsx`
8. `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/ui/form.tsx`

### Key Files Updated
1. `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/app/layout.tsx` - Added providers
2. `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/layout/header.tsx` - Updated to use auth context

## Testing the Setup

1. Start the development server:
```bash
npm run dev
```

2. Visit http://localhost:3000
3. Check that the homepage loads correctly
4. Test navigation between pages
5. Verify that the header shows/hides based on auth state

## Troubleshooting

### Common Issues

1. **Import errors**: Check that paths use `@/` prefix
2. **Type errors**: Ensure all types are imported correctly
3. **Provider errors**: Check provider hierarchy in layout.tsx
4. **API errors**: Verify backend is running and endpoints are correct

### Debug Tools
- React Query DevTools (can be added if needed)
- Browser Console (for auth state)
- Network tab (for API calls)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
