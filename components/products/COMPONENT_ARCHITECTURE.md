# Product Filter Components - Architecture

## Component Hierarchy

```
ProductFiltersEnhanced (Main Container)
├── ProductSearchBar
│   ├── Input (UI)
│   ├── Search Icon
│   ├── Clear Button
│   ├── Loading Indicator
│   └── Recent Searches Dropdown
│       └── Recent Search Items
│
├── ProductFilterSummary
│   ├── Results Count
│   ├── Active Filter Chips
│   └── Clear All Button
│
├── ProductSortSelect
│   ├── Select Trigger
│   │   ├── Sort Icon
│   │   └── Sort Label
│   └── Select Content
│       └── Sort Options (with icons)
│
├── Mobile Filter Drawer (Sheet)
│   └── ProductFiltersPanel
│
└── Desktop Filter Sidebar
    └── ProductFiltersPanel
        ├── Active Filters Section
        │   ├── Filter Count
        │   ├── Active Filter Chips
        │   └── Clear All Button
        │
        ├── Category Filter Section
        │   ├── Collapsible Header
        │   └── Category Items
        │       ├── Checkbox
        │       ├── CategoryIcon
        │       ├── Category Label
        │       └── Count Badge
        │
        ├── Price Range Section
        │   ├── Collapsible Header
        │   ├── Price Labels (Min/Max)
        │   └── Dual-Handle Slider
        │
        └── Verification Level Section
            ├── Collapsible Header
            └── Verification Items
                ├── Checkbox
                └── VerificationBadge
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Interactions                     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              ProductFiltersEnhanced (State)              │
│  ┌───────────────────────────────────────────────────┐  │
│  │  filters: ProductSearchParams                     │  │
│  │  - page, limit                                    │  │
│  │  - search                                         │  │
│  │  - category                                       │  │
│  │  - min_price, max_price                          │  │
│  │  - verification_level                            │  │
│  │  - sort_by                                       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│               useProductFilters (Hook)                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │  • Parse filters from URL searchParams           │  │
│  │  • Update URL on filter changes                  │  │
│  │  • Provide resetFilters function                 │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                useProducts (React Query)                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │  • Fetch products with filters                   │  │
│  │  • Cache results                                 │  │
│  │  • Return data, isLoading, error                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Product Search API Service                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  advancedProductSearch(params)                   │  │
│  │  ├── buildProductWhereClause()                   │  │
│  │  ├── buildProductOrderBy()                       │  │
│  │  └── prisma.product.findMany()                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Database Query                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  SELECT * FROM products                          │  │
│  │  WHERE ...filters...                             │  │
│  │  ORDER BY ...sort...                             │  │
│  │  LIMIT ...pagination...                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────┐
│                    Component State                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ProductSearchBar State:                                 │
│  ├── localValue (immediate input)                        │
│  ├── debouncedValue (delayed by 300ms) ───────┐          │
│  └── recentSearches (localStorage)             │          │
│                                                 │          │
│  ProductFiltersPanel State:                    │          │
│  ├── expandedSections (collapsible UI)         │          │
│  └── filter selections                         │          │
│                                                 │          │
│  ProductFiltersEnhanced State:                 │          │
│  └── showMobileFilters (drawer open/close)     │          │
│                                                 │          │
├─────────────────────────────────────────────────┼─────────┤
│                  Debounce Layer                 │          │
│                   (300ms delay)        ◄────────┘          │
├─────────────────────────────────────────────────┬─────────┤
│                                                  │          │
│              Parent Component State              │          │
│              (filters: ProductSearchParams)      │          │
│                                                  │          │
├──────────────────────────────────────────────────┼─────────┤
│                    URL State                     │          │
│            (searchParams via Next.js)   ◄────────┘          │
│                                                             │
│  URL Format:                                                │
│  /products?search=ai&category=ai_agent&min_price=10&...   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                  React Query Cache                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Query Key: ['products', 'list', filters]           │  │
│  │  Data: { products: [], pagination: {} }             │  │
│  │  staleTime: 30s                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Interaction Flow Diagram

```
User Types in Search Bar
        │
        ▼
ProductSearchBar receives input
        │
        ▼
Local state updates immediately (UI feedback)
        │
        ▼
Debounce timer starts (300ms)
        │
        ▼
Timer completes
        │
        ▼
onFiltersChange callback triggered
        │
        ▼
Parent updates filters state
        │
        ▼
useProductFilters updates URL params
        │
        ▼
URL change detected
        │
        ▼
useProducts hook refetches with new filters
        │
        ▼
API call to /api/products
        │
        ▼
Database query executed
        │
        ▼
Results returned to React Query
        │
        ▼
Component re-renders with new data
        │
        ▼
User sees updated product list
```

## Performance Optimization Points

```
┌─────────────────────────────────────────────────────────┐
│              Performance Optimizations                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Search Debouncing                                   │
│     └── Reduces API calls by ~70%                       │
│                                                          │
│  2. React Query Caching                                 │
│     ├── Cache duration: 30s                             │
│     ├── Automatic background refetching                 │
│     └── Optimistic updates on mutations                 │
│                                                          │
│  3. Component Memoization                               │
│     ├── React.memo for child components                 │
│     ├── useCallback for event handlers                  │
│     └── useMemo for computed values                     │
│                                                          │
│  4. Lazy Loading                                        │
│     ├── Mobile drawer loads on demand                   │
│     └── Aggregations load separately                    │
│                                                          │
│  5. LocalStorage Caching                                │
│     ├── Recent searches (max 5)                         │
│     └── User preferences                                │
│                                                          │
│  6. URL State Management                                │
│     ├── Reduces prop drilling                           │
│     ├── Enables shareable links                         │
│     └── Browser back/forward support                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Mobile vs Desktop Rendering

```
┌─────────────────────────────────────────────────────────┐
│                  Desktop (≥1024px)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┬──────────────────────────────┐    │
│  │  Sidebar (25%)   │  Main Content (75%)          │    │
│  │                  │                              │    │
│  │  [Search Bar]    │  [Results Summary]          │    │
│  │  [Sort Select]   │  [Sort Dropdown]            │    │
│  │                  │                              │    │
│  │  Filters Panel:  │  ┌──────────────────────┐   │    │
│  │  ├─ Categories   │  │  Product Grid        │   │    │
│  │  ├─ Price Range  │  │  ┌────┐ ┌────┐ ┌────┐  │    │
│  │  └─ Verification │  │  │Card│ │Card│ │Card│  │    │
│  │                  │  │  └────┘ └────┘ └────┘  │    │
│  │  [Active Chips]  │  │  ┌────┐ ┌────┐ ┌────┐  │    │
│  │                  │  │  │Card│ │Card│ │Card│  │    │
│  │                  │  │  └────┘ └────┘ └────┘  │    │
│  │                  │  └──────────────────────┘   │    │
│  │                  │                              │    │
│  │                  │  [Pagination]                │    │
│  └──────────────────┴──────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   Mobile (<1024px)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  [Search Bar]  [Filter Button (with badge)]      │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  [Results Summary]  [Sort Dropdown]              │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  [Active Filter Chips...]                        │   │
│  ├──────────────────────────────────────────────────┤   │
│  │                                                   │   │
│  │  Product Grid (Single Column):                   │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │         Product Card                       │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │         Product Card                       │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │                                                   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  When Filter Button Clicked:                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  [← Back]  Filters                               │   │
│  ├──────────────────────────────────────────────────┤   │
│  │                                                   │   │
│  │  [Categories]                                     │   │
│  │  [Price Range Slider]                            │   │
│  │  [Verification Levels]                           │   │
│  │                                                   │   │
│  │  [Clear All] [Apply Filters]                     │   │
│  └──────────────────────────────────────────────────┘   │
│  (Drawer overlay, closes when filter selected)          │
└─────────────────────────────────────────────────────────┘
```

## Event Flow Chart

```
┌────────────────────────────────────────────────────┐
│              User Interaction Events                │
└────────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬──────────────┐
        │             │             │              │
        ▼             ▼             ▼              ▼
   [Search]    [Category]    [Price Slider]  [Sort]
        │             │             │              │
        ▼             ▼             ▼              ▼
  Debounce      Immediate      Immediate     Immediate
   (300ms)       Update        Update         Update
        │             │             │              │
        └─────────────┴─────────────┴──────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │  onFiltersChange()    │
          └───────────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │  Update URL Params    │
          └───────────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │  useProducts Refetch  │
          └───────────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │  UI Re-render         │
          └───────────────────────┘
```

## Component Dependencies

```
ProductFiltersEnhanced
  ├─ Depends on:
  │   ├─ ProductSearchBar
  │   ├─ ProductFiltersPanel
  │   ├─ ProductSortSelect
  │   ├─ ProductFilterSummary
  │   ├─ Sheet (UI)
  │   ├─ Button (UI)
  │   └─ Badge (UI)
  │
  └─ Uses:
      ├─ useState (React)
      ├─ CATEGORY_LABELS (constants)
      └─ cn (utils)

ProductSearchBar
  ├─ Depends on:
  │   ├─ Input (UI)
  │   ├─ Button (UI)
  │   └─ Badge (UI)
  │
  └─ Uses:
      ├─ useDebounce (hook)
      ├─ useLocalStorage (hook)
      ├─ useKeyboardShortcut (hook)
      ├─ useState, useEffect, useRef (React)
      └─ lucide-react icons

ProductFiltersPanel
  ├─ Depends on:
  │   ├─ Checkbox (UI)
  │   ├─ Slider (UI)
  │   ├─ Badge (UI)
  │   ├─ Separator (UI)
  │   ├─ CategoryIcon (component)
  │   └─ VerificationBadge (component)
  │
  └─ Uses:
      ├─ useState (React)
      ├─ CATEGORY_LABELS (constants)
      └─ lucide-react icons
```
