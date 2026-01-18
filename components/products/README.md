# Enhanced Product Search & Filter Components

Comprehensive search and filter UI components for the AI Marketplace with enhanced UX and mobile-friendly design.

## Components

### 1. ProductSearchBar
Enhanced search bar with autocomplete and recent searches.

**Features:**
- Debounced search input (300ms)
- Recent searches stored in localStorage (max 5)
- Clear button
- Loading indicator
- Keyboard shortcut: Press `/` to focus search
- Click outside to close suggestions

**Usage:**
```tsx
import { ProductSearchBar } from '@/components/products/product-search-bar';

<ProductSearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  isLoading={isLoading}
  placeholder="Search products..."
/>
```

### 2. ProductFiltersPanel
Comprehensive filter panel with collapsible sections.

**Features:**
- Category filter with icons and counts
- Price range slider (dual-handle)
- Verification level badges
- Active filter chips with remove buttons
- Collapsible sections
- Filter count badges

**Usage:**
```tsx
import { ProductFiltersPanel } from '@/components/products/product-filters-panel';

<ProductFiltersPanel
  filters={filters}
  onFiltersChange={setFilters}
  priceRange={{ min: 0, max: 1000 }}
  categoryCounts={{ n8n: 45, ai_agent: 32 }}
/>
```

### 3. ProductSortSelect
Sort dropdown with icons and visual indicators.

**Features:**
- Sort by: newest, popular, rating, price (asc/desc)
- Visual icons for each sort option
- Active sort indicator

**Usage:**
```tsx
import { ProductSortSelect } from '@/components/products/product-sort-select';

<ProductSortSelect
  value={filters.sort_by || 'newest'}
  onChange={handleSortChange}
/>
```

### 4. ProductFilterSummary
Results summary with active filters display.

**Features:**
- Total results count
- Active filter chips
- Quick clear options
- Loading state

**Usage:**
```tsx
import { ProductFilterSummary } from '@/components/products/product-filter-summary';

<ProductFilterSummary
  totalResults={totalResults}
  activeFilters={activeFilterChips}
  onClearAll={clearAllFilters}
  isLoading={isLoading}
/>
```

### 5. ProductFiltersEnhanced (Main Component)
All-in-one filter component integrating all sub-components.

**Features:**
- Responsive design (mobile drawer, desktop sidebar)
- URL state management ready
- Integrated search, filters, and sort
- Active filter summary
- Mobile-friendly sheet drawer

**Usage:**
```tsx
import { ProductFiltersEnhanced } from '@/components/products/product-filters-enhanced';

<ProductFiltersEnhanced
  filters={filters}
  onFiltersChange={setFilters}
  totalResults={totalResults}
  isLoading={isLoading}
  priceRange={{ min: 0, max: 1000 }}
  categoryCounts={categoryCounts}
/>
```

## Helper Components

### CategoryIcon
Visual icons for product categories.

```tsx
import { CategoryIcon } from '@/components/products/category-icons';

<CategoryIcon category="ai_agent" className="h-4 w-4" />
```

### VerificationBadge
Badges for verification levels.

```tsx
import { VerificationBadge } from '@/components/products/verification-badge';

<VerificationBadge level={2} showLabel={true} />
```

## Hooks

### useDebounce
Debounce values to reduce API calls.

```tsx
import { useDebounce } from '@/hooks/use-debounce';

const debouncedSearch = useDebounce(searchQuery, 300);
```

### useLocalStorage
Persist state to localStorage.

```tsx
import { useLocalStorage } from '@/hooks/use-local-storage';

const [recentSearches, setRecentSearches] = useLocalStorage('searches', []);
```

### useKeyboardShortcut
Register keyboard shortcuts.

```tsx
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';

useKeyboardShortcut([
  {
    key: '/',
    callback: () => searchInputRef.current?.focus(),
  },
]);
```

## Integration Example

```tsx
'use client';

import { useState } from 'react';
import { ProductFiltersEnhanced } from '@/components/products/product-filters-enhanced';
import { useProducts } from '@/hooks/use-products';
import type { ProductSearchParams } from '@/lib/validations/product';

export function ProductsPage() {
  const [filters, setFilters] = useState<ProductSearchParams>({
    page: 1,
    limit: 20,
    sort_by: 'newest',
  });

  const { data, isLoading } = useProducts(filters);

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar (Desktop) / Drawer (Mobile) */}
        <aside className="lg:col-span-1">
          <ProductFiltersEnhanced
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={data?.pagination.total || 0}
            isLoading={isLoading}
            priceRange={{ min: 0, max: 1000 }}
            categoryCounts={data?.categoryCounts}
          />
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          {/* Product list rendering */}
        </main>
      </div>
    </div>
  );
}
```

## URL State Management

For persistent filter state across page navigations:

```tsx
import { useSearchParams, useRouter } from 'next/navigation';

function useFilterState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: ProductSearchParams = {
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 20,
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    min_price: searchParams.get('min_price')
      ? Number(searchParams.get('min_price'))
      : undefined,
    max_price: searchParams.get('max_price')
      ? Number(searchParams.get('max_price'))
      : undefined,
    verification_level: searchParams.get('verification_level')
      ? Number(searchParams.get('verification_level'))
      : undefined,
    sort_by: (searchParams.get('sort_by') as any) || 'newest',
  };

  const updateFilters = (newFilters: ProductSearchParams) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

    router.push(`/products?${params.toString()}`);
  };

  return { filters, updateFilters };
}
```

## Performance Considerations

1. **Debouncing**: Search input debounced to 300ms to reduce API calls
2. **LocalStorage**: Recent searches cached locally (max 5 items)
3. **Memoization**: Filter components use React.memo where appropriate
4. **Lazy Loading**: Mobile drawer loaded only when opened
5. **URL State**: Filters persist in URL for shareability and back button support

## Accessibility

- Keyboard navigation support
- ARIA labels for all interactive elements
- Focus management for modal/drawer
- Screen reader friendly
- Semantic HTML structure

## Mobile Responsiveness

- Desktop: Sidebar layout with filters always visible
- Mobile: Drawer/sheet overlay for filters
- Touch-friendly tap targets (min 44x44px)
- Responsive typography and spacing
