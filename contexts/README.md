# Cart Context Usage Guide

## Overview

The Cart Context provides global state management for shopping cart functionality in the AI Marketplace application.

## Features

- ✅ Add/Remove products from cart
- ✅ Clear entire cart
- ✅ Calculate total price and item count
- ✅ LocalStorage persistence
- ✅ SSR-safe hydration
- ✅ Duplicate product prevention
- ✅ TypeScript support
- ✅ Performance optimized with useMemo and useCallback

## Installation

The CartProvider is already integrated in `/app/layout.tsx` and wraps the entire application.

## Basic Usage

### 1. Import the hook

```tsx
import { useCart } from '@/contexts/cart-context';
```

### 2. Use in your component

```tsx
'use client';

import { useCart } from '@/contexts/cart-context';

export function ProductCard({ product }) {
  const { addToCart, items, removeFromCart } = useCart();

  const isInCart = items.some(item => item.id === product.id);

  return (
    <div>
      <h3>{product.title}</h3>
      <p>${product.price}</p>

      {isInCart ? (
        <button onClick={() => removeFromCart(product.id)}>
          Remove from Cart
        </button>
      ) : (
        <button onClick={() => addToCart(product)}>
          Add to Cart
        </button>
      )}
    </div>
  );
}
```

### 3. Display cart count

```tsx
'use client';

import { useCart } from '@/contexts/cart-context';
import Link from 'next/link';

export function CartIcon() {
  const { count } = useCart();

  return (
    <Link href="/cart">
      🛒 Cart ({count})
    </Link>
  );
}
```

### 4. Display cart total

```tsx
'use client';

import { useCart } from '@/contexts/cart-context';

export function CartSummary() {
  const { total, count, items } = useCart();

  return (
    <div>
      <h2>Cart Summary</h2>
      <p>Items: {count}</p>
      <p>Total: ${total.toFixed(2)}</p>

      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.title} - ${item.price} × {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5. Clear cart

```tsx
'use client';

import { useCart } from '@/contexts/cart-context';

export function ClearCartButton() {
  const { clearCart, count } = useCart();

  if (count === 0) return null;

  return (
    <button onClick={clearCart}>
      Clear Cart
    </button>
  );
}
```

## API Reference

### `useCart()` Hook

Returns an object with the following properties and methods:

#### Properties

- **`items: CartItem[]`** - Array of all items in the cart
- **`total: number`** - Total price of all items
- **`count: number`** - Total number of items

#### Methods

- **`addToCart(product: any): void`**
  - Adds a product to the cart
  - Prevents duplicates (shows console warning if already exists)
  - Automatically validates product has required fields

- **`removeFromCart(productId: string): void`**
  - Removes a product from the cart by ID
  - Safe to call even if product doesn't exist

- **`clearCart(): void`**
  - Removes all items from the cart
  - Also clears localStorage

### CartItem Type

```typescript
interface CartItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  verification_level: number;
  seller: {
    name: string;
    seller_tier?: string;
  };
  quantity: number;
}
```

## Advanced Usage

### Check if specific product is in cart

```tsx
const { items } = useCart();
const productId = 'prod_123';
const isInCart = items.some(item => item.id === productId);
```

### Get specific cart item details

```tsx
const { items } = useCart();
const productId = 'prod_123';
const cartItem = items.find(item => item.id === productId);
```

### Format total with currency

```tsx
const { total, items } = useCart();
const currency = items[0]?.currency || 'USD';

const formattedTotal = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: currency,
}).format(total);
```

## Important Notes

### Client Component Required

Any component using `useCart()` must be a Client Component:

```tsx
'use client';  // Required!

import { useCart } from '@/contexts/cart-context';
```

### Error Handling

The hook will throw an error if used outside CartProvider:

```tsx
// ❌ This will throw an error
function MyComponent() {
  const { items } = useCart(); // Error: must be within CartProvider
  // ...
}
```

### LocalStorage

- Cart data is automatically saved to localStorage
- Key: `'ai_marketplace_cart'`
- Data persists across page refreshes and browser sessions
- Safe for SSR - only accesses localStorage on client side

### Duplicate Products

Currently, adding a duplicate product shows a console warning and doesn't add it again. In the future, this could be modified to increment quantity instead.

## Integration Examples

### Product Listing Page

```tsx
'use client';

import { useCart } from '@/contexts/cart-context';

export function ProductGrid({ products }) {
  const { addToCart, items } = useCart();

  return (
    <div className="grid">
      {products.map(product => {
        const isInCart = items.some(item => item.id === product.id);

        return (
          <div key={product.id}>
            <h3>{product.title}</h3>
            <button
              onClick={() => addToCart(product)}
              disabled={isInCart}
            >
              {isInCart ? 'In Cart ✓' : 'Add to Cart'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

### Cart Page

```tsx
'use client';

import { useCart } from '@/contexts/cart-context';
import Link from 'next/link';

export default function CartPage() {
  const { items, total, removeFromCart, clearCart, count } = useCart();

  if (count === 0) {
    return (
      <div>
        <h1>Your Cart is Empty</h1>
        <Link href="/products">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Shopping Cart ({count} items)</h1>

      <ul>
        {items.map(item => (
          <li key={item.id}>
            <h3>{item.title}</h3>
            <p>Price: ${item.price}</p>
            <p>Seller: {item.seller.name}</p>
            <button onClick={() => removeFromCart(item.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div>
        <h2>Total: ${total.toFixed(2)}</h2>
        <button onClick={clearCart}>Clear Cart</button>
        <Link href="/checkout">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
```

## Future Enhancements

Potential features for future implementation:

1. **Quantity Management**
   - Increment/decrement quantity
   - Update quantity input field

2. **Price Calculations**
   - Tax calculations
   - Discount codes
   - Shipping costs

3. **Multi-Currency Support**
   - Currency conversion
   - Display in user's preferred currency

4. **Cart Validation**
   - Stock availability check
   - Price update notifications
   - Expired items removal

5. **Analytics**
   - Track add-to-cart events
   - Abandoned cart recovery
   - Conversion tracking
