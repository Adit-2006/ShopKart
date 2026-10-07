import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  updateCartQuantity as apiUpdateCartQuantity,
} from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const pendingRequests = useRef(new Set());
  const [pendingIds, setPendingIds] = useState(new Set());

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  /**
   * Refresh cart from backend
   * Fetches latest cart for authenticated customer without requiring components to fetch separately
   */
  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCart();
      if (Array.isArray(data?.cart)) {
        setCartItems(data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      // If user is not logged in (401), keep cart empty without displaying intrusive errors
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error('Error fetching cart:', err);
        setError(err.response?.data?.message || 'Unable to load your cart.');
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize cart once on app mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  /**
   * Helper: check if a product is in the cart
   */
  const isInCart = useCallback(
    (productId) => {
      if (!productId || !cartItems) return false;
      return cartItems.some((item) => {
        const id = item.product?._id || item.product?.id || item.product;
        return String(id) === String(productId);
      });
    },
    [cartItems]
  );

  /**
   * Helper: get quantity of product in cart
   */
  const getItemQuantity = useCallback(
    (productId) => {
      if (!productId || !cartItems) return 0;
      const found = cartItems.find((item) => {
        const id = item.product?._id || item.product?.id || item.product;
        return String(id) === String(productId);
      });
      return found ? found.quantity : 0;
    },
    [cartItems]
  );

  const isPending = useCallback(
    (productId) => pendingIds.has(String(productId)),
    [pendingIds]
  );

  /**
   * Add to Cart:
   * Adds product with quantity 1 if not present, or increments quantity if already present
   */
  const addToCart = async (productId) => {
    const idStr = String(productId);
    if (pendingRequests.current.has(idStr)) {
      return { success: false, duplicate: true };
    }

    pendingRequests.current.add(idStr);
    setPendingIds(new Set(pendingRequests.current));
    setError(null);

    try {
      const res = await apiAddToCart(productId);
      if (Array.isArray(res?.cart)) {
        setCartItems(res.cart);
      } else {
        await refreshCart();
      }
      showToast('Added to cart!', 'success');
      return { success: true, cart: res?.cart };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Failed to add item to cart.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg, status: err.response?.status };
    } finally {
      pendingRequests.current.delete(idStr);
      setPendingIds(new Set(pendingRequests.current));
    }
  };

  /**
   * Update Quantity:
   * Explicitly sets the quantity for a product in the cart
   */
  const updateQuantity = async (productId, quantity) => {
    const idStr = String(productId);
    if (pendingRequests.current.has(idStr)) {
      return { success: false, duplicate: true };
    }

    pendingRequests.current.add(idStr);
    setPendingIds(new Set(pendingRequests.current));
    setError(null);

    try {
      const res = await apiUpdateCartQuantity(productId, quantity);
      if (Array.isArray(res?.cart)) {
        setCartItems(res.cart);
      } else {
        await refreshCart();
      }
      showToast('Cart updated', 'success');
      return { success: true, cart: res?.cart };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Failed to update item quantity.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg, status: err.response?.status };
    } finally {
      pendingRequests.current.delete(idStr);
      setPendingIds(new Set(pendingRequests.current));
    }
  };

  /**
   * Remove from Cart:
   * Completely removes the product item from the user's cart
   */
  const removeFromCart = async (productId) => {
    const idStr = String(productId);
    if (pendingRequests.current.has(idStr)) {
      return { success: false, duplicate: true };
    }

    pendingRequests.current.add(idStr);
    setPendingIds(new Set(pendingRequests.current));
    setError(null);

    try {
      const res = await apiRemoveFromCart(productId);
      if (Array.isArray(res?.cart)) {
        setCartItems(res.cart);
      } else {
        setCartItems((prev) =>
          prev.filter((item) => {
            const id = item.product?._id || item.product?.id || item.product;
            return String(id) !== idStr;
          })
        );
      }
      showToast('Item removed from cart', 'info');
      return { success: true, cart: res?.cart };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Failed to remove item from cart.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg, status: err.response?.status };
    } finally {
      pendingRequests.current.delete(idStr);
      setPendingIds(new Set(pendingRequests.current));
    }
  };

  // Computed Values
  const cartCount = cartItems.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0
  );

  const cartTotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    const qty = item.quantity || 1;
    return acc + price * qty;
  }, 0);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        loadingCart: loading,
        error,
        cartError: error,
        clearError: () => setError(null),
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart,
        clearCart,
        isInCart,
        getItemQuantity,
        isPending,
      }}
    >
      {children}

      {/* Floating Cart Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 animate-fade-in-up">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-950/90 text-red-200 border-red-800/80 shadow-red-950/40'
                : toast.type === 'info'
                ? 'bg-slate-900/90 text-slate-200 border-slate-700/80 shadow-black/40'
                : 'bg-emerald-950/90 text-emerald-100 border-emerald-700/80 shadow-emerald-950/40'
            }`}
          >
            {toast.type === 'error' ? (
              <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
