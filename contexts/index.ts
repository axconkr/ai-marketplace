/**
 * Central export file for all context providers and hooks
 *
 * @example
 * ```typescript
 * // Import everything you need from one place
 * import { useCart, CartProvider, type CartItem } from '@/contexts';
 * ```
 */

// Export cart context components and types
export { CartProvider, useCart } from './cart-context';
export type { CartItem } from './cart-context';

// Future: Add more context exports here as they are created
// export { AuthProvider, useAuth } from './auth-context';
// export { ThemeProvider, useTheme } from './theme-context';
