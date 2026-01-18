'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

/**
 * CartItem interface representing a product in the shopping cart
 */
export interface CartItem {
  /** Unique product identifier */
  id: string;
  /** Product title/name */
  title: string;
  /** Product price */
  price: number;
  /** Currency code (e.g., 'USD', 'KRW') */
  currency: string;
  /** Verification level (0-3) */
  verification_level: number;
  /** Seller information */
  seller: {
    name: string;
    seller_tier?: string;
  };
  /** Quantity of this item in cart (for future use) */
  quantity: number;
}

/**
 * CartContext type definition with state and actions
 */
interface CartContextType {
  /** Array of items in the cart */
  items: CartItem[];
  /** Add a product to the cart */
  addToCart: (product: any) => void;
  /** Remove a product from the cart by ID */
  removeFromCart: (productId: string) => void;
  /** Clear all items from the cart */
  clearCart: () => void;
  /** Total price of all items in cart */
  total: number;
  /** Total number of items in cart */
  count: number;
}

/**
 * Create the Cart Context with undefined default value
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * localStorage key for persisting cart data
 */
const CART_STORAGE_KEY = 'ai_marketplace_cart';

/**
 * CartProvider component that wraps the app and provides cart functionality
 *
 * Features:
 * - Manages cart state with React hooks
 * - Persists cart data to localStorage
 * - Handles SSR hydration properly
 * - Prevents duplicate products in cart
 * - Calculates totals automatically
 *
 * @param children - React children components
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  /**
   * Load cart from localStorage on mount (client-side only)
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            setItems(parsedCart);
          }
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      } finally {
        setIsHydrated(true);
      }
    }
  }, []);

  /**
   * Save cart to localStorage whenever items change (client-side only)
   */
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [items, isHydrated]);

  /**
   * Add a product to the cart
   * Prevents duplicate products - if product already exists, shows console warning
   *
   * @param product - Product object from the API or product listing
   */
  const addToCart = useCallback((product: any) => {
    if (!product || !product.id) {
      console.error('Invalid product: missing id');
      return;
    }

    setItems((prevItems) => {
      // Check if product already exists in cart
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        console.warn(`Product ${product.id} is already in cart`);
        // Could increment quantity here in the future
        // For now, just return existing items
        return prevItems;
      }

      // Create new cart item
      const newItem: CartItem = {
        id: product.id,
        title: product.title || 'Untitled Product',
        price: product.price || 0,
        currency: product.currency || 'USD',
        verification_level: product.verification_level || 0,
        seller: {
          name: product.seller?.name || 'Unknown Seller',
          seller_tier: product.seller?.seller_tier,
        },
        quantity: 1,
      };

      return [...prevItems, newItem];
    });
  }, []);

  /**
   * Remove a product from the cart by product ID
   *
   * @param productId - The ID of the product to remove
   */
  const removeFromCart = useCallback((productId: string) => {
    if (!productId) {
      console.error('Invalid productId provided to removeFromCart');
      return;
    }

    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  /**
   * Clear all items from the cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Calculate total price of all items in cart
   * Memoized for performance
   */
  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }, [items]);

  /**
   * Calculate total number of items in cart
   * Memoized for performance
   */
  const count = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);
  }, [items]);

  /**
   * Memoize the context value to prevent unnecessary re-renders
   */
  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      clearCart,
      total,
      count,
    }),
    [items, addToCart, removeFromCart, clearCart, total, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Custom hook to use the Cart Context
 *
 * @throws Error if used outside of CartProvider
 * @returns CartContextType with all cart state and actions
 *
 * @example
 * ```tsx
 * function ProductCard({ product }) {
 *   const { addToCart, items } = useCart();
 *
 *   const isInCart = items.some(item => item.id === product.id);
 *
 *   return (
 *     <button onClick={() => addToCart(product)}>
 *       {isInCart ? 'In Cart' : 'Add to Cart'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
