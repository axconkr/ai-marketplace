# Product UI Implementation - Complete Guide

## Overview

This document provides a comprehensive guide to the Product UI implementation for the AI Marketplace. The implementation includes all necessary pages, components, and utilities for a fully functional product browsing and management system.

## Features Implemented

### 1. Product Browsing
- Product listing page with grid layout
- Advanced filtering (category, price range, verification level)
- Real-time search
- Pagination with page numbers
- Responsive design (1-4 columns based on screen size)

### 2. Product Details
- Detailed product information
- Seller profile display
- Product statistics (views, downloads, ratings)
- Verification badges
- Purchase/download actions
- Related product recommendations (ready for implementation)

### 3. Product Management
- Multi-step product creation form
- Product editing functionality
- File upload with drag-and-drop
- Form validation with Zod
- Draft saving capability
- Preview before submission

### 4. Seller Dashboard
- Statistics cards (total products, active, pending, revenue)
- Product management table
- Quick actions (view, edit, delete)
- Status badges for product states
- Empty state for new sellers

## File Structure

```
AI_marketplace/
├── app/
│   ├── (marketplace)/
│   │   ├── layout.tsx                          # Marketplace layout with navigation
│   │   ├── products/
│   │   │   ├── page.tsx                        # Product listing page
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx                    # Product detail page
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx                # Edit product page
│   │   │   └── new/
│   │   │       └── page.tsx                    # Create product page
│   │   └── dashboard/
│   │       └── products/
│   │           └── page.tsx                    # Seller dashboard
│   └── globals.css                             # Global styles (existing)
│
├── components/
│   ├── ui/                                     # shadcn/ui components
│   │   ├── badge.tsx                           # Badge component
│   │   ├── button.tsx                          # Button component (existing)
│   │   ├── card.tsx                            # Card component (existing)
│   │   ├── input.tsx                           # Input component (existing)
│   │   ├── label.tsx                           # Label component (existing)
│   │   ├── select.tsx                          # Select component
│   │   ├── skeleton.tsx                        # Loading skeleton
│   │   ├── slider.tsx                          # Slider component
│   │   ├── textarea.tsx                        # Textarea component
│   │   └── toast.tsx                           # Toast notification system
│   │
│   └── products/                               # Product-specific components
│       ├── product-card.tsx                    # Product card for grid
│       ├── product-grid.tsx                    # Product grid layout
│       ├── product-skeleton.tsx                # Loading skeleton for cards
│       ├── product-filters.tsx                 # Search and filter controls
│       ├── product-form.tsx                    # Create/edit product form
│       └── file-upload.tsx                     # File upload with drag-drop
│
├── hooks/
│   └── use-products.ts                         # React Query hooks
│
├── lib/
│   ├── api/
│   │   └── products.ts                         # API client functions
│   ├── providers/
│   │   └── query-provider.tsx                  # React Query provider
│   ├── validations/
│   │   └── product.ts                          # Zod schemas (modified)
│   └── utils/                                  # Utility functions (existing)
│
└── package.json                                # Dependencies added
```

## Dependencies Added

```json
{
  "@tanstack/react-query": "^5.90.12",
  "@hookform/resolvers": "^5.2.2",
  "react-hook-form": "^7.69.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0",
  "lucide-react": "^0.562.0"
}
```

## Usage Guide

### 1. Product Listing Page

**Route:** `/products`

**Features:**
- Browse all products in a responsive grid
- Filter by category, price range, verification level
- Search products by title/description
- Sort by newest, price, rating, downloads
- Pagination with page controls

**Example:**
```tsx
// Navigate to products page
<Link href="/products">Browse Products</Link>

// Navigate with filters
<Link href="/products?category=n8n&min_price=10&max_price=100">
  n8n Workflows $10-$100
</Link>
```

### 2. Product Detail Page

**Route:** `/products/[id]`

**Features:**
- Full product information
- Seller profile
- Statistics (views, downloads, ratings)
- Purchase/download buttons
- Verification badges
- Related products section (placeholder)

**Example:**
```tsx
// Link to product detail
<Link href={`/products/${productId}`}>View Product</Link>
```

### 3. Create Product Page

**Route:** `/products/new`

**Features:**
- Multi-step form (4 steps)
  1. Basic Info (title, category, description, tags)
  2. Pricing (model, price, currency)
  3. Files (upload product files)
  4. Preview (review before submit)
- Form validation with Zod
- Save as draft functionality
- File upload with progress

**Protected Route:** Requires seller authentication

**Example:**
```tsx
// Link to create product
<Link href="/products/new">
  <Button>Sell Product</Button>
</Link>
```

### 4. Edit Product Page

**Route:** `/products/[id]/edit`

**Features:**
- Same multi-step form as create
- Pre-filled with existing product data
- Update functionality
- File replacement

**Protected Route:** Requires seller authentication + ownership verification

**Example:**
```tsx
// Link to edit product
<Link href={`/products/${productId}/edit`}>Edit Product</Link>
```

### 5. Seller Dashboard

**Route:** `/dashboard/products`

**Features:**
- Statistics cards
  - Total products
  - Active products
  - Pending review
  - Estimated revenue
- Product management table
  - View all seller's products
  - Quick actions (view, edit, delete)
  - Status badges
- Empty state for new sellers

**Protected Route:** Requires seller authentication

**Example:**
```tsx
// Link to dashboard
<Link href="/dashboard/products">My Products</Link>
```

## Component Usage Examples

### ProductCard

```tsx
import { ProductCard } from '@/components/products/product-card';

<ProductCard product={product} />
```

### ProductGrid

```tsx
import { ProductGrid } from '@/components/products/product-grid';

<ProductGrid
  products={products}
  isLoading={isLoading}
  emptyMessage="No products found"
/>
```

### ProductFilters

```tsx
import { ProductFilters } from '@/components/products/product-filters';

const [filters, setFilters] = useState<ProductSearchParams>({
  page: 1,
  limit: 20,
});

<ProductFilters
  filters={filters}
  onFiltersChange={setFilters}
/>
```

### ProductForm

```tsx
import { ProductForm } from '@/components/products/product-form';

// Create mode
<ProductForm mode="create" />

// Edit mode
<ProductForm mode="edit" product={existingProduct} />
```

### FileUpload

```tsx
import { FileUpload } from '@/components/products/file-upload';

const [file, setFile] = useState<File | null>(null);

<FileUpload
  onFileSelect={setFile}
  onFileRemove={() => setFile(null)}
  currentFile={file}
  accept=".zip,.json,.yaml"
  maxSize={50 * 1024 * 1024} // 50MB
/>
```

## React Query Hooks

### useProducts (List)

```tsx
import { useProducts } from '@/hooks/use-products';

const { data, isLoading, error } = useProducts({
  page: 1,
  limit: 20,
  category: 'n8n',
  sort_by: 'created_at',
  sort_order: 'desc',
});

// data.products - array of products
// data.pagination - pagination info
```

### useProduct (Detail)

```tsx
import { useProduct } from '@/hooks/use-products';

const { data: product, isLoading, error } = useProduct(productId);
```

### useMyProducts (Seller Dashboard)

```tsx
import { useMyProducts } from '@/hooks/use-products';

const { data: products, isLoading, error } = useMyProducts();
```

### useCreateProduct (Mutation)

```tsx
import { useCreateProduct } from '@/hooks/use-products';

const createMutation = useCreateProduct();

const handleCreate = async (data: ProductCreateInput) => {
  try {
    const product = await createMutation.mutateAsync(data);
    console.log('Created:', product);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### useUpdateProduct (Mutation)

```tsx
import { useUpdateProduct } from '@/hooks/use-products';

const updateMutation = useUpdateProduct(productId);

const handleUpdate = async (data: ProductUpdateInput) => {
  try {
    const product = await updateMutation.mutateAsync(data);
    console.log('Updated:', product);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### useDeleteProduct (Mutation)

```tsx
import { useDeleteProduct } from '@/hooks/use-products';

const deleteMutation = useDeleteProduct();

const handleDelete = async (productId: string) => {
  try {
    await deleteMutation.mutateAsync(productId);
    console.log('Deleted');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### useUploadFile (Mutation)

```tsx
import { useUploadFile } from '@/hooks/use-products';

const uploadMutation = useUploadFile();

const handleUpload = async (file: File) => {
  try {
    const { url } = await uploadMutation.mutateAsync(file);
    console.log('Uploaded:', url);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## API Integration

All API calls are handled through `/lib/api/products.ts`. The backend API endpoints expected:

### Endpoints

```
GET    /api/products              - List products with filters
GET    /api/products/:id          - Get product by ID
POST   /api/products              - Create product
PATCH  /api/products/:id          - Update product
DELETE /api/products/:id          - Delete product
GET    /api/products/me           - Get seller's products
POST   /api/products/upload       - Upload product file
POST   /api/products/:id/view     - Increment view count
```

### Authentication

All API calls include `credentials: 'include'` to send cookies for authentication.

Protected endpoints (create, update, delete, seller dashboard) require valid seller authentication.

## Form Validation

Form validation uses Zod schemas from `/lib/validations/product.ts`:

### ProductCreateSchema

```typescript
{
  title: string (3-100 chars)
  description: string (50-5000 chars)
  category: enum (n8n, make, ai_agent, app, api, prompt)
  tags: string[] (1-10 items)
  pricing_model: enum (one_time, subscription, license)
  price: number (positive, max 999999.99)
  currency: enum (USD, KRW)
  file_url?: string (URL)
  demo_url?: string (URL)
  status?: enum (draft, pending, active, suspended)
}
```

### ProductSearchSchema

```typescript
{
  query?: string
  category?: ProductCategory
  min_price?: number
  max_price?: number
  verification_level?: number (0-3)
  sort_by?: 'created_at' | 'price' | 'rating' | 'downloads'
  sort_order?: 'asc' | 'desc'
  page?: number (default: 1)
  limit?: number (default: 20, max: 100)
}
```

## Styling

### Tailwind CSS

All components use Tailwind CSS with custom theme:

- Primary color: Blue (hsl(199, 89%, 48%))
- Responsive breakpoints: sm, md, lg, xl
- Custom animations: fade-in, slide-in
- Dark mode support (ready but not activated)

### Custom Classes

```css
/* Grid layouts */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

/* Container */
container mx-auto px-4

/* Cards with hover effects */
hover:shadow-lg transition-shadow

/* Text truncation */
line-clamp-1
line-clamp-2

/* Custom spacing */
space-y-4
gap-6
```

## Performance Optimizations

### 1. Image Optimization

```tsx
<Image
  src={product.demo_url}
  alt={product.title}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority // for above-fold images
/>
```

### 2. React Query Caching

- Stale time: 30-60 seconds
- Cache time: 5 minutes
- Automatic refetch on window focus disabled
- Optimistic updates for mutations

### 3. Lazy Loading

- Images lazy load by default (next/image)
- Components load on demand via Next.js app router
- Skeleton loaders during data fetching

### 4. Debounced Search

Search input is debounced (300ms) to avoid excessive API calls.

## Accessibility

### ARIA Labels

All interactive elements have proper ARIA labels:

```tsx
<button aria-label="Close">
  <X className="h-4 w-4" />
</button>

<Input aria-invalid={!!errors.title} />
```

### Keyboard Navigation

- Tab navigation works throughout
- Form inputs properly labeled
- Focus states visible

### Screen Reader Support

- Semantic HTML (nav, main, footer, article)
- Proper heading hierarchy (h1, h2, h3)
- Alt text for images

## Error Handling

### API Errors

```tsx
if (error) {
  return (
    <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
      <p className="font-semibold">Error loading products</p>
      <p className="text-sm">{error.message}</p>
    </div>
  );
}
```

### Form Validation Errors

```tsx
{errors.title && (
  <p className="text-sm text-destructive">{errors.title.message}</p>
)}
```

### Toast Notifications

```tsx
import { useToast } from '@/components/ui/toast';

const { addToast } = useToast();

addToast({
  title: 'Success',
  description: 'Product created successfully',
});

addToast({
  title: 'Error',
  description: error.message,
  variant: 'destructive',
});
```

## Empty States

All lists have proper empty states:

- Product listing: "No products found"
- Seller dashboard: "No products yet" with CTA
- Search results: "Try adjusting your filters"

## Loading States

All data fetching shows loading states:

- Product grid: Skeleton cards (8 cards)
- Product detail: Full page skeleton
- Dashboard: Stats and table skeletons

## Mobile Responsiveness

### Breakpoints

- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns
- Large Desktop (xl): 4 columns

### Navigation

- Mobile menu toggle (hamburger icon)
- Responsive header
- Touch-friendly tap targets (min 44x44px)

## Testing Recommendations

### Unit Tests

```bash
# Test components
- ProductCard rendering
- ProductFilters state management
- FileUpload file validation

# Test hooks
- useProducts data fetching
- useCreateProduct mutation
- Form validation
```

### Integration Tests

```bash
# Test user flows
- Browse products and filter
- View product details
- Create new product (full flow)
- Edit existing product
- Delete product with confirmation
```

### E2E Tests (Playwright)

```bash
# Critical paths
- Product discovery flow
- Product creation flow
- Dashboard management flow
```

## Future Enhancements

### Phase 2 Features

1. **Reviews Section**
   - Display product reviews
   - Add review functionality
   - Seller replies

2. **Related Products**
   - Recommendation algorithm
   - "Customers also viewed"
   - Category-based suggestions

3. **Shopping Cart**
   - Add to cart functionality
   - Cart management
   - Checkout flow

4. **Advanced Filters**
   - Seller tier filter
   - Date range filter
   - Multi-select categories

5. **Product Analytics**
   - View detailed analytics
   - Traffic sources
   - Conversion tracking

6. **Bulk Operations**
   - Bulk product upload
   - Batch status changes
   - Export product data

## Troubleshooting

### Common Issues

**1. Images not loading**
```
Solution: Check demo_url format and CORS settings
Use placeholder for missing images
```

**2. Form validation errors**
```
Solution: Ensure schema matches API expectations
Check ProductCreateSchema in validations
```

**3. React Query cache issues**
```
Solution: Invalidate queries after mutations
Use queryClient.invalidateQueries()
```

**4. File upload failing**
```
Solution: Check file size limits (50MB default)
Verify accepted file types
Check backend /api/products/upload endpoint
```

## Screenshots Description

### Product Listing Page
- Header with search bar and filters button
- Grid of product cards (4 columns on desktop)
- Each card shows: image, title, category badge, description, stats, seller info, price
- Pagination controls at bottom

### Product Detail Page
- Large product image/preview
- Title, category, verification badge
- Description section
- Tags section
- Product details (pricing model, published date)
- Sidebar with price and purchase buttons
- Seller information card

### Product Creation Form
- Step indicator (1-4 steps)
- Step 1: Basic info fields
- Step 2: Pricing fields
- Step 3: File upload area with drag-drop
- Step 4: Preview of product
- Navigation buttons (Previous, Next, Save Draft, Submit)

### Seller Dashboard
- 4 statistics cards (Total, Active, Pending, Revenue)
- Product table with status badges
- Action buttons (View, Edit, Delete)
- Empty state with "Create Product" CTA

## Support

For questions or issues:
1. Check this README
2. Review component source code
3. Check API documentation
4. Contact development team

## License

Part of AI Marketplace project. All rights reserved.
