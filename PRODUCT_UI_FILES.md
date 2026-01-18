# Product UI - Complete File List

## All Files Created/Modified

### Core Infrastructure (6 files)

1. **React Query Provider**
   - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/lib/providers/query-provider.tsx`
   - Provides React Query client to all components

2. **API Client**
   - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/lib/api/products.ts`
   - All product API functions (fetch, create, update, delete, upload)

3. **Validation Schemas**
   - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/lib/validations/product.ts`
   - Zod schemas for product validation
   - Type exports and label constants

4. **React Query Hooks**
   - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/hooks/use-products.ts`
   - useProducts, useProduct, useMyProducts
   - useCreateProduct, useUpdateProduct, useDeleteProduct
   - useUploadFile

5. **Package Dependencies**
   - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/package.json`
   - Added: @tanstack/react-query, react-hook-form, @hookform/resolvers, etc.

### UI Components (10 files)

6. **Badge**
   - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/ui/badge.tsx`
   - Status badges, category badges, verification badges

7. **Skeleton**
   - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/ui/skeleton.tsx`
   - Loading skeletons for all components

8. **Select**
   - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/ui/select.tsx`
   - Dropdown select component

9. **Textarea**
   - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/ui/textarea.tsx`
   - Multi-line text input

10. **Slider**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/ui/slider.tsx`
    - Range slider for price filters

11. **Toast**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/ui/toast.tsx`
    - Toast notification system with provider

### Product Components (6 files)

12. **ProductCard**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/products/product-card.tsx`
    - Individual product card for grid display

13. **ProductGrid**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/products/product-grid.tsx`
    - Responsive grid layout for products

14. **ProductSkeleton**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/products/product-skeleton.tsx`
    - Loading skeleton for product cards

15. **ProductFilters**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/products/product-filters.tsx`
    - Search, filters, and sort controls

16. **ProductForm**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/products/product-form.tsx`
    - Multi-step form for create/edit

17. **FileUpload**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/components/products/file-upload.tsx`
    - Drag-and-drop file upload component

### Pages (7 files)

18. **Marketplace Layout**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/app/(marketplace)/layout.tsx`
    - Navigation header and footer

19. **Product Listing**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/app/(marketplace)/products/page.tsx`
    - Browse all products with filters

20. **Product Detail**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/app/(marketplace)/products/[id]/page.tsx`
    - Detailed product view

21. **Create Product**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/app/(marketplace)/products/new/page.tsx`
    - Create new product page

22. **Edit Product**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/app/(marketplace)/products/[id]/edit/page.tsx`
    - Edit existing product page

23. **Seller Dashboard**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/app/(marketplace)/dashboard/products/page.tsx`
    - Seller product management

### Documentation (2 files)

24. **Product UI README**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/PRODUCT_UI_README.md`
    - Complete implementation guide

25. **This File**
    - `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/PRODUCT_UI_FILES.md`
    - File listing reference

## Total: 25 Files

- **Infrastructure**: 6 files
- **UI Components**: 10 files
- **Product Components**: 6 files
- **Pages**: 7 files
- **Documentation**: 2 files

## Quick Access Paths

### Most Important Files

**To modify product display:**
```
components/products/product-card.tsx
components/products/product-grid.tsx
```

**To modify filters:**
```
components/products/product-filters.tsx
```

**To modify create/edit forms:**
```
components/products/product-form.tsx
```

**To modify API calls:**
```
lib/api/products.ts
```

**To modify data fetching:**
```
hooks/use-products.ts
```

**To modify validation:**
```
lib/validations/product.ts
```

**To modify pages:**
```
app/(marketplace)/products/page.tsx          # Listing
app/(marketplace)/products/[id]/page.tsx     # Detail
app/(marketplace)/products/new/page.tsx      # Create
app/(marketplace)/products/[id]/edit/page.tsx # Edit
app/(marketplace)/dashboard/products/page.tsx # Dashboard
```

## File Sizes (Approximate)

- Pages: 100-300 lines each
- Components: 50-200 lines each
- Hooks: 100-150 lines
- API Client: 150 lines
- Validation: 120 lines

## Dependencies Breakdown

### Production Dependencies
```
@tanstack/react-query: ^5.90.12    # Data fetching and caching
@hookform/resolvers: ^5.2.2        # Form validation resolver
react-hook-form: ^7.69.0           # Form management
class-variance-authority: ^0.7.1    # Component variants
clsx: ^2.1.1                       # Class name utility
tailwind-merge: ^3.4.0             # Tailwind class merging
lucide-react: ^0.562.0             # Icons
```

### Already Installed
```
next: ^14.0.4
react: ^18.2.0
react-dom: ^18.2.0
zod: ^3.22.4
```

## Routes Overview

```
/products                          # Browse all products
/products?category=n8n             # Filter by category
/products?min_price=10&max_price=100 # Price range filter
/products/:id                      # Product detail
/products/new                      # Create product (seller only)
/products/:id/edit                 # Edit product (owner only)
/dashboard/products                # Seller dashboard (seller only)
```

## Component Hierarchy

```
MarketplaceLayout
├── QueryProvider
│   └── ToastProvider
│       ├── ProductsPage
│       │   ├── ProductFilters
│       │   └── ProductGrid
│       │       └── ProductCard[]
│       │
│       ├── ProductDetailPage
│       │   └── Product sections
│       │
│       ├── CreateProductPage
│       │   └── ProductForm
│       │       └── FileUpload
│       │
│       ├── EditProductPage
│       │   └── ProductForm
│       │       └── FileUpload
│       │
│       └── DashboardProductsPage
│           └── Product table
```

## State Management

### Global State
- React Query cache (products, my products, product details)
- Toast notifications (ToastProvider)

### Local State
- Form state (react-hook-form)
- Filter state (useState in ProductsPage)
- File upload state (useState in ProductForm)

## API Endpoints Expected

```
GET    /api/products              # List with filters
GET    /api/products/:id          # Get by ID
POST   /api/products              # Create
PATCH  /api/products/:id          # Update
DELETE /api/products/:id          # Delete
GET    /api/products/me           # Seller's products
POST   /api/products/upload       # File upload
POST   /api/products/:id/view     # Increment views
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api  # API base URL (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000      # App base URL
```

## Next Steps

1. **Test all pages locally**
   ```bash
   npm run dev
   # Visit http://localhost:3000/products
   ```

2. **Implement backend API** (if not already done)
   - Create API routes in `app/api/products/`
   - Match expected endpoints

3. **Add authentication guards**
   - Protect seller-only routes
   - Add ownership verification for edit/delete

4. **Add image optimization**
   - Configure next.config.js for remote images
   - Set up CDN for product images

5. **Test with real data**
   - Create test products
   - Test all CRUD operations
   - Verify filtering and search

6. **Optimize performance**
   - Add virtual scrolling for long lists
   - Implement infinite scroll option
   - Add debounce to search

7. **Enhance UX**
   - Add loading animations
   - Improve error messages
   - Add success confirmations

## Contact

For issues or questions about these files, refer to:
- PRODUCT_UI_README.md (comprehensive guide)
- Individual file comments
- React Query documentation
- Next.js documentation
