# Cart Context Quick Start Guide

## 🚀 5-Minute Integration

### Step 1: Import the Hook

```typescript
'use client';  // Required for Client Components!

import { useCart } from '@/contexts/cart-context';
```

### Step 2: Use in Your Component

```typescript
export function YourComponent() {
  const { addToCart, items, total, count, removeFromCart, clearCart } = useCart();

  // Your component logic here
}
```

### Step 3: Common Patterns

#### Add to Cart Button

```typescript
<button onClick={() => addToCart(product)}>
  Add to Cart
</button>
```

#### Show Cart Count

```typescript
<Link href="/cart">
  Cart ({count})
</Link>
```

#### Display Total

```typescript
<div>Total: ${total.toFixed(2)}</div>
```

#### Check if Product in Cart

```typescript
const isInCart = items.some(item => item.id === productId);
```

#### Remove from Cart

```typescript
<button onClick={() => removeFromCart(productId)}>
  Remove
</button>
```

#### Clear Cart

```typescript
<button onClick={clearCart}>
  Clear Cart
</button>
```

## 📋 Product Object Requirements

When adding to cart, product must have:

```typescript
{
  id: string;              // Required
  title: string;           // Required
  price: number;           // Required
  currency: string;        // Required
  verification_level: number;  // Required (0-3)
  seller: {
    name: string;          // Required
    seller_tier?: string;  // Optional
  }
}
```

## ⚠️ Common Mistakes

### ❌ Forgot 'use client'

```typescript
// This will cause an error!
import { useCart } from '@/contexts/cart-context';

export function MyComponent() {
  const { addToCart } = useCart(); // Error: hooks only work in Client Components
}
```

### ✅ Correct

```typescript
'use client';  // Add this!

import { useCart } from '@/contexts/cart-context';

export function MyComponent() {
  const { addToCart } = useCart(); // Works!
}
```

### ❌ Using Outside Provider

```typescript
// This will throw an error if CartProvider is not in the component tree
const { items } = useCart();
```

### ✅ Correct

```typescript
// Make sure CartProvider is in app/layout.tsx (already done!)
// Then use useCart in any child component
```

## 🎯 Real-World Examples

### Product Card with Add to Cart

```typescript
'use client';

import { useCart } from '@/contexts/cart-context';

export function ProductCard({ product }) {
  const { addToCart, items } = useCart();

  const isInCart = items.some(item => item.id === product.id);

  return (
    <div className="border rounded p-4">
      <h3>{product.title}</h3>
      <p className="text-lg font-bold">${product.price}</p>

      <button
        onClick={() => addToCart(product)}
        disabled={isInCart}
        className={isInCart ? 'bg-gray-400' : 'bg-blue-600'}
      >
        {isInCart ? 'In Cart ✓' : 'Add to Cart'}
      </button>
    </div>
  );
}
```

### Mini Cart Dropdown

```typescript
'use client';

import { useCart } from '@/contexts/cart-context';
import Link from 'next/link';

export function MiniCart() {
  const { items, count, total, removeFromCart } = useCart();

  if (count === 0) {
    return <div>Your cart is empty</div>;
  }

  return (
    <div className="w-80 bg-white shadow-lg rounded">
      <div className="p-4">
        <h3>Cart ({count} items)</h3>

        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.id} className="flex justify-between">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">${item.price}</p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
            className="mt-4 block w-full bg-blue-600 text-white py-2 text-center rounded"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Cart Page

```typescript
'use client';

import { useCart } from '@/contexts/cart-context';
import Link from 'next/link';

export default function CartPage() {
  const { items, total, count, removeFromCart, clearCart } = useCart();

  if (count === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <Link href="/products" className="text-blue-600">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-gray-600">Seller: {item.seller.name}</p>
              <p className="text-lg font-bold">${item.price}</p>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-100 rounded">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold">Total:</span>
          <span className="text-2xl font-bold">${total.toFixed(2)}</span>
        </div>

        <div className="flex gap-4">
          <button
            onClick={clearCart}
            className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Cart
          </button>

          <Link
            href="/checkout"
            className="flex-1 px-6 py-3 bg-blue-600 text-white text-center rounded hover:bg-blue-700"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
```

## 🔧 TypeScript Tips

### Get Type Safety

```typescript
import { CartItem, useCart } from '@/contexts/cart-context';

// Use CartItem type for your product interfaces
interface Product extends Partial<CartItem> {
  // Your additional product fields
}
```

### Type-Safe Product Addition

```typescript
const handleAdd = (product: Product) => {
  // TypeScript will ensure product has all required CartItem fields
  addToCart(product);
};
```

## 📊 Debugging

### Check Cart Contents

```typescript
const { items } = useCart();
console.log('Current cart:', items);
```

### Check localStorage

```typescript
// In browser console
localStorage.getItem('ai_marketplace_cart');
```

### Clear localStorage (for testing)

```typescript
// In browser console
localStorage.removeItem('ai_marketplace_cart');
// Then refresh the page
```

## 📚 More Information

- Full documentation: `/contexts/README.md`
- Implementation details: `/contexts/IMPLEMENTATION_SUMMARY.md`
- Integration notes: `/contexts/CART_INTEGRATION_NOTES.md`
- Source code: `/contexts/cart-context.tsx`

---

**Need Help?**
1. Check if component has `'use client'` directive
2. Verify CartProvider is in layout.tsx (already done!)
3. Check browser console for errors
4. Ensure product object has all required fields
