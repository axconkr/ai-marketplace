# Cart Context Integration Notes

## Product Page Integration Status

The product detail page (`/app/(marketplace)/products/[id]/page.tsx`) has been prepared for cart integration.

### Required Cart Context Interface

The product page expects the following from the cart context:

```typescript
interface CartItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  verification_level: number;
  seller: {
    id: string;
    name: string | null;
    seller_tier: string | null;
  };
  demo_url?: string | null;
  quantity?: number; // Optional - cart might want to track quantity
}

interface CartContextValue {
  addToCart: (item: CartItem) => void;
  // Additional methods cart context might provide:
  // removeFromCart: (itemId: string) => void;
  // updateQuantity: (itemId: string, quantity: number) => void;
  // clearCart: () => void;
  // items: CartItem[];
  // totalItems: number;
  // totalPrice: number;
}
```

### Integration Steps for Cart Context Creator

1. **Create cart-context.tsx** with the above interface
2. **Export useCart hook** from the context
3. **Update product page** by uncommenting these lines:
   - Line 27: `import { useCart } from '@/contexts/cart-context';`
   - Line 45: `const { addToCart } = useCart();`
   - Lines 61-69: The actual `addToCart()` call in `handleAddToCart` function

### Current Implementation

The product page currently:
- ✅ Has placeholder for cart context import (commented out)
- ✅ Has `handleAddToCart` function with cart logic (commented out)
- ✅ Has `handleBuyNow` function for direct checkout
- ✅ Implements loading states (`isAddingToCart`, `justAdded`)
- ✅ Shows toast notifications on success/error
- ✅ Has visual feedback (button changes to "Added!" with checkmark)
- ✅ Maintains accessibility with disabled states

### Testing Checklist

Once cart context is ready:
1. Uncomment the cart imports
2. Test "Add to Cart" button shows loading state
3. Test success message appears
4. Test button shows "Added!" with checkmark
5. Test error handling if cart fails
6. Test "Buy Now" redirects to checkout page
7. Verify toast notifications work correctly
