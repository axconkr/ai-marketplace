# Product Filters - Quick Reference

## Component Quick Links

```tsx
// Main Component (Use this for most cases)
import { ProductFiltersEnhanced } from '@/components/products/product-filters-enhanced';

// Individual Components (For custom layouts)
import { ProductSearchBar } from '@/components/products/product-search-bar';
import { ProductFiltersPanel } from '@/components/products/product-filters-panel';
import { ProductSortSelect } from '@/components/products/product-sort-select';
import { ProductFilterSummary } from '@/components/products/product-filter-summary';

// Helper Components
import { CategoryIcon } from '@/components/products/category-icons';
import { VerificationBadge } from '@/components/products/verification-badge';

// Hooks
import { useProductFilters } from '@/hooks/use-product-filters';
import { useDebounce } from '@/hooks/use-debounce';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
```

## Quick Start (5 minutes)

```tsx
'use client';

import { ProductFiltersEnhanced } from '@/components/products/product-filters-enhanced';
import { useProductFilters } from '@/hooks/use-product-filters';
import { useProducts } from '@/hooks/use-products';

export function ProductsPage() {
  const { filters, updateFilters } = useProductFilters();
  const { data, isLoading } = useProducts(filters);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <aside className="lg:col-span-1">
        <ProductFiltersEnhanced
          filters={filters}
          onFiltersChange={updateFilters}
          totalResults={data?.pagination.total || 0}
          isLoading={isLoading}
        />
      </aside>
      <main className="lg:col-span-3">
        {/* Your product grid here */}
      </main>
    </div>
  );
}
```

## Props Cheat Sheet

### ProductFiltersEnhanced
```tsx
interface Props {
  filters: ProductSearchParams;           // Required
  onFiltersChange: (filters) => void;     // Required
  totalResults: number;                   // Required
  isLoading?: boolean;                    // Optional
  priceRange?: { min: number; max: number }; // Optional
  categoryCounts?: Record<string, number>;   // Optional
  className?: string;                     // Optional
}
```

### ProductSearchBar
```tsx
interface Props {
  value: string;                          // Required
  onChange: (value: string) => void;      // Required
  isLoading?: boolean;                    // Optional
  placeholder?: string;                   // Optional
  className?: string;                     // Optional
}
```

### ProductFiltersPanel
```tsx
interface Props {
  filters: ProductSearchParams;           // Required
  onFiltersChange: (filters) => void;     // Required
  priceRange?: { min: number; max: number }; // Optional
  categoryCounts?: Record<string, number>;   // Optional
  className?: string;                     // Optional
}
```

### ProductSortSelect
```tsx
interface Props {
  value: string;                          // Required (sort_by value)
  onChange: (value: string) => void;      // Required
  className?: string;                     // Optional
}
```

## Filter Parameters

```tsx
interface ProductSearchParams {
  page?: number;              // Current page (default: 1)
  limit?: number;             // Items per page (default: 20)
  search?: string;            // Search query
  category?: ProductCategory; // Product category filter
  min_price?: number;         // Minimum price
  max_price?: number;         // Maximum price
  verification_level?: number; // Min verification level (0-3)
  sort_by?: SortOption;       // Sort order
}

type ProductCategory = 'n8n' | 'make' | 'ai_agent' | 'app' | 'api' | 'prompt';
type SortOption = 'newest' | 'popular' | 'rating' | 'price_asc' | 'price_desc';
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search input |
| `Esc` | Close filter drawer (mobile) |

## Common Patterns

### Pattern 1: Basic Filters
```tsx
const [filters, setFilters] = useState<ProductSearchParams>({
  page: 1,
  limit: 20,
  sort_by: 'newest',
});

<ProductFiltersEnhanced
  filters={filters}
  onFiltersChange={setFilters}
  totalResults={100}
/>
```

### Pattern 2: URL State
```tsx
const { filters, updateFilters } = useProductFilters();

<ProductFiltersEnhanced
  filters={filters}
  onFiltersChange={updateFilters}
  totalResults={data?.pagination.total || 0}
/>
```

### Pattern 3: With Aggregations
```tsx
// Fetch aggregations separately
const { data: aggregations } = useQuery({
  queryKey: ['product-aggregations'],
  queryFn: async () => ({
    priceRange: await getProductPriceRange(),
    categoryCounts: await getProductCategoryAggregation(),
  }),
});

<ProductFiltersEnhanced
  filters={filters}
  onFiltersChange={updateFilters}
  totalResults={data?.pagination.total || 0}
  priceRange={aggregations?.priceRange}
  categoryCounts={aggregations?.categoryCounts}
/>
```

### Pattern 4: Custom Layout
```tsx
// Build your own layout with individual components
<div>
  <ProductSearchBar value={search} onChange={setSearch} />
  <div className="flex gap-4">
    <ProductFiltersPanel filters={filters} onFiltersChange={setFilters} />
    <div>
      <ProductSortSelect value={sort} onChange={setSort} />
      <ProductFilterSummary totalResults={100} activeFilters={[]} />
      {/* Your product grid */}
    </div>
  </div>
</div>
```

## Customization Examples

### Custom Search Placeholder
```tsx
<ProductSearchBar
  value={search}
  onChange={setSearch}
  placeholder="AI 에이전트 검색..."
/>
```

### Custom Price Range
```tsx
<ProductFiltersPanel
  filters={filters}
  onFiltersChange={setFilters}
  priceRange={{ min: 10, max: 500 }}
/>
```

### Custom Category Counts
```tsx
<ProductFiltersPanel
  filters={filters}
  onFiltersChange={setFilters}
  categoryCounts={{
    n8n: 45,
    ai_agent: 32,
    app: 18,
    api: 12,
    prompt: 67,
    make: 23,
  }}
/>
```

## Styling Customization

### Custom Colors
```tsx
// Tailwind config
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    }
  }
}
```

### Custom Component Styles
```tsx
<ProductFiltersEnhanced
  className="my-custom-class"
  filters={filters}
  onFiltersChange={updateFilters}
/>
```

### Override Individual Components
```tsx
// Use individual components for full control
<ProductSearchBar className="custom-search" />
<ProductFiltersPanel className="custom-filters" />
```

## Performance Tips

1. **Memoize filter changes**
```tsx
const handleFiltersChange = useCallback((newFilters) => {
  setFilters(newFilters);
}, []);
```

2. **Debounce search separately if needed**
```tsx
const debouncedSearch = useDebounce(search, 500); // Custom delay
```

3. **Lazy load aggregations**
```tsx
const { data: counts } = useQuery({
  queryKey: ['counts', filters.category],
  queryFn: fetchCategoryCounts,
  enabled: showFilters, // Only fetch when needed
});
```

## Troubleshooting

### Search not debouncing
- Check that `ProductSearchBar` is being used (has built-in debounce)
- Verify delay is appropriate (default: 300ms)

### Filters not persisting
- Use `useProductFilters()` hook for URL state
- Check that router is properly configured

### Mobile drawer not showing
- Verify breakpoint (lg:hidden for drawer button)
- Check that Sheet component is imported

### Price slider not updating
- Ensure `value` is an array: `[min, max]`
- Check `onChange` receives array back

## Common Issues

**Issue**: Filter state resets on navigation
**Solution**: Use URL state with `useProductFilters()`

**Issue**: Too many API calls during search
**Solution**: Search is auto-debounced to 300ms

**Issue**: Recent searches not saving
**Solution**: Check browser localStorage is enabled

**Issue**: Mobile filters not accessible
**Solution**: Ensure Sheet component dependencies installed

## Need Help?

- Full Documentation: `/components/products/README.md`
- Integration Example: `/components/products/INTEGRATION_EXAMPLE.tsx`
- Enhancement Summary: `/FILTER_ENHANCEMENT_SUMMARY.md`
