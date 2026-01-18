# Product Search API - Developer Guide

## Quick Start

### Basic Search

```typescript
// Fetch all active products
const response = await fetch('/api/products/search');
const { products, pagination } = await response.json();
```

### Filter by Category

```typescript
// Get all AI Agent products
const response = await fetch('/api/products/search?category=ai_agent');
```

### Price Range Filter

```typescript
// Products between $5,000 and $15,000
const response = await fetch(
  '/api/products/search?min_price=5000&max_price=15000'
);
```

### Rating Filter (NEW in Phase 3)

```typescript
// Products with 4.5+ star rating
const response = await fetch('/api/products/search?min_rating=4.5');
```

### Combined Filters

```typescript
// Highly-rated AI agents in price range
const params = new URLSearchParams({
  category: 'ai_agent',
  min_price: '5000',
  max_price: '15000',
  min_rating: '4.0',
  verification_level: '2',
  sort_by: 'rating',
  page: '1',
  limit: '20'
});

const response = await fetch(`/api/products/search?${params}`);
```

### With Aggregations (for Filter UI)

```typescript
// Get products + available filter options
const response = await fetch(
  '/api/products/search?category=ai_agent&include_aggregations=true'
);

const { products, pagination, aggregations } = await response.json();

// Use aggregations to build filter UI
console.log('Available categories:', aggregations.categories);
console.log('Price range:', aggregations.price_range);
console.log('Rating range:', aggregations.rating_range);
console.log('Verification levels:', aggregations.verification_levels);
```

## API Reference

### Endpoint

```
GET /api/products/search
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (1+) |
| `limit` | integer | No | 20 | Items per page (1-100) |
| `search` | string | No | - | Search in name/description |
| `category` | string | No | - | Filter by category |
| `min_price` | number | No | - | Minimum price (inclusive) |
| `max_price` | number | No | - | Maximum price (inclusive) |
| `min_rating` | number | No | - | Minimum rating 0-5 |
| `verification_level` | integer | No | - | Min verification (0-3) |
| `seller_id` | string | No | - | Filter by seller |
| `sort_by` | enum | No | newest | Sort option |
| `include_aggregations` | boolean | No | false | Include filter metadata |

### Sort Options

- `newest` - Most recent first
- `popular` - Most downloads first
- `price_asc` - Lowest price first
- `price_desc` - Highest price first
- `rating` - Highest rating first

### Response Schema

```typescript
interface SearchResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    aggregations?: {  // Only if include_aggregations=true
      categories: Array<{
        category: string;
        count: number;
      }>;
      price_range: {
        min_price: number;
        max_price: number;
      };
      rating_range: {
        min_rating: number;
        max_rating: number;
      };
      verification_levels: Array<{
        verification_level: number;
        count: number;
      }>;
    };
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  verification_level: number;
  verification_badges: string[];
  verification_score: number;
  status: string;
  download_count: number;
  rating_average: number;
  rating_count: number;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
}
```

## React/Next.js Examples

### Custom Hook

```typescript
// hooks/useProductSearch.ts
import { useState, useEffect } from 'react';

interface SearchFilters {
  category?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  verification_level?: number;
  sort_by?: string;
  page?: number;
  limit?: number;
}

export function useProductSearch(filters: SearchFilters) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [aggregations, setAggregations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(
          Object.entries(filters)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        );

        const response = await fetch(`/api/products/search?${params}`);
        const data = await response.json();

        if (data.success) {
          setProducts(data.data.products);
          setPagination(data.data.pagination);
          setAggregations(data.data.aggregations);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(filters)]);

  return { products, pagination, aggregations, loading, error };
}
```

### Usage in Component

```typescript
// components/ProductSearch.tsx
'use client';

import { useState } from 'react';
import { useProductSearch } from '@/hooks/useProductSearch';

export function ProductSearch() {
  const [filters, setFilters] = useState({
    category: '',
    min_price: undefined,
    max_price: undefined,
    min_rating: undefined,
    page: 1,
    limit: 20,
  });

  const { products, pagination, loading, error } = useProductSearch(filters);

  const handleCategoryChange = (category: string) => {
    setFilters({ ...filters, category, page: 1 });
  };

  const handlePriceChange = (min: number, max: number) => {
    setFilters({ ...filters, min_price: min, max_price: max, page: 1 });
  };

  const handleRatingChange = (rating: number) => {
    setFilters({ ...filters, min_rating: rating, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <select onChange={(e) => handleCategoryChange(e.target.value)}>
          <option value="">All Categories</option>
          <option value="ai_agent">AI Agent</option>
          <option value="n8n">n8n Workflow</option>
          <option value="make">Make Scenario</option>
        </select>

        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          onChange={(e) => handleRatingChange(Number(e.target.value))}
        />

        {/* Price range slider */}
        {/* ... */}
      </div>

      {/* Results */}
      <div className="products">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="pagination">
          <button
            disabled={!pagination.has_prev}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <button
            disabled={!pagination.has_next}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

### Server Component Example

```typescript
// app/products/page.tsx
import { ProductSearchSchema } from '@/lib/validations/product';
import { advancedProductSearch } from '@/lib/services/product-search';

interface SearchParams {
  category?: string;
  min_price?: string;
  max_price?: string;
  min_rating?: string;
  page?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Validate and parse search params
  const params = ProductSearchSchema.parse({
    category: searchParams.category,
    min_price: searchParams.min_price,
    max_price: searchParams.max_price,
    min_rating: searchParams.min_rating,
    page: searchParams.page || '1',
    limit: '20',
    sort_by: 'newest',
  });

  // Fetch products server-side
  const { products, pagination } = await advancedProductSearch(params);

  return (
    <div>
      <h1>Products</h1>
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination pagination={pagination} />
    </div>
  );
}
```

## Performance Best Practices

### 1. Use Pagination

```typescript
// ❌ Bad: Fetching all products
const response = await fetch('/api/products/search?limit=1000');

// ✅ Good: Use pagination
const response = await fetch('/api/products/search?page=1&limit=20');
```

### 2. Request Aggregations Only When Needed

```typescript
// ❌ Bad: Always requesting aggregations
const response = await fetch('/api/products/search?include_aggregations=true');

// ✅ Good: Only request when building filter UI
const shouldIncludeAggregations = isFilterPanelOpen;
const params = new URLSearchParams({
  include_aggregations: shouldIncludeAggregations.toString(),
});
```

### 3. Debounce Search Input

```typescript
// ✅ Debounce search to avoid excessive API calls
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebouncedValue(searchQuery, 500); // 500ms delay

useEffect(() => {
  if (debouncedSearch) {
    fetchProducts({ search: debouncedSearch });
  }
}, [debouncedSearch]);
```

### 4. Cache Results

```typescript
// ✅ Use React Query for automatic caching
import { useQuery } from '@tanstack/react-query';

function useProductSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

## Error Handling

### Validation Errors

```typescript
try {
  const response = await fetch('/api/products/search?min_rating=10'); // Invalid: max is 5
  const data = await response.json();

  if (!data.success) {
    console.error('Validation error:', data.error);
    // Error: min_rating must be between 0 and 5
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### Common Error Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request | Invalid parameter value | Check parameter ranges |
| 500 Internal Error | Server/database issue | Retry with exponential backoff |
| Slow response | Complex query | Reduce filters or page size |

## Testing

### Unit Test Example

```typescript
import { buildProductWhereClause } from '@/lib/services/product-search';

describe('buildProductWhereClause', () => {
  it('should build WHERE clause with min_rating', () => {
    const params = {
      min_rating: 4.5,
      page: 1,
      limit: 20,
      sort_by: 'newest' as const,
    };

    const where = buildProductWhereClause(params);

    expect(where.rating_average).toEqual({ gte: 4.5 });
    expect(where.status).toBe('ACTIVE');
  });
});
```

### Integration Test Example

```typescript
import { GET } from '@/app/api/products/search/route';

describe('GET /api/products/search', () => {
  it('should return products with min_rating filter', async () => {
    const request = new Request(
      'http://localhost:3000/api/products/search?min_rating=4.0'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.products).toBeDefined();
    expect(data.data.pagination).toBeDefined();
  });
});
```

## Troubleshooting

### Issue: Slow Search Queries

**Symptoms:** API responses > 2s

**Solutions:**
1. Check if database indexes are created
2. Reduce page size (`limit`)
3. Remove unnecessary aggregations
4. Optimize filter combinations

```sql
-- Check if indexes exist
\d+ "Product"

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM "Product" WHERE ...;
```

### Issue: No Results Found

**Symptoms:** Empty products array

**Solutions:**
1. Check if filters are too restrictive
2. Verify product status is 'ACTIVE'
3. Check if category/seller_id exists
4. Test without filters first

```typescript
// Debug: Test without filters
const response = await fetch('/api/products/search');
console.log('Total products:', data.pagination.total);

// Then add filters one by one
const response = await fetch('/api/products/search?category=ai_agent');
console.log('AI Agents:', data.pagination.total);
```

### Issue: Pagination Not Working

**Symptoms:** Wrong page or missing results

**Solutions:**
1. Ensure `page` is >= 1
2. Check `limit` is between 1-100
3. Verify `total_pages` calculation

```typescript
// ✅ Correct pagination
const page = Math.max(1, Number(searchParams.page) || 1);
const limit = Math.min(100, Math.max(1, Number(searchParams.limit) || 20));
```

## Migration from Old API

If you were using the old search API:

```typescript
// ❌ Old API (if existed)
const response = await fetch('/api/products?category=ai_agent');

// ✅ New API (Phase 3)
const response = await fetch('/api/products/search?category=ai_agent');

// New features available:
// - min_rating filter
// - Composite indexes (faster queries)
// - Rating range aggregation
// - Better performance
```

## Additional Resources

- [Phase 3 Implementation Summary](../PHASE_3_IMPLEMENTATION_SUMMARY.md)
- [Database Migration Notes](../prisma/migrations/PHASE_3_SEARCH_OPTIMIZATION.md)
- [Integration Tests](./__tests__/integration/api/product-search.test.ts)

## Support

For issues or questions:
1. Check this guide first
2. Review test examples
3. Check application logs
4. Contact development team
