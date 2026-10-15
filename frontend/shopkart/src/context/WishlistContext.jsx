import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from '../services/api';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
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
   * Refresh wishlist from backend
   */
  const refreshWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWishlist();
      const items = Array.isArray(data?.wishlist)
        ? data.wishlist
        : Array.isArray(data?.products)
        ? data.products
        : Array.isArray(data)
        ? data
        : [];
      setWishlistItems(items);
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error('Error fetching wishlist:', err);
        setError(err.response?.data?.message || 'Unable to load your wishlist.');
      }
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize wishlist once on mount
  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  /**
   * Helper: check if product is in wishlist
   */
  const isInWishlist = useCallback(
    (productId) => {
      if (!productId || !wishlistItems) return false;
      return wishlistItems.some((item) => {
        const id = item?._id || item?.id || item;
        return String(id) === String(productId);
      });
    },
    [wishlistItems]
  );

  const isPending = useCallback(
    (productId) => pendingIds.has(String(productId)),
    [pendingIds]
  );

  /**
   * Clear wishlist state (used on logout)
   */
  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
    setError(null);
  }, []);

  /**
   * Add to Wishlist
   */
  const addToWishlist = async (productId) => {
    const idStr = String(productId);
    if (pendingRequests.current.has(idStr)) {
      return { success: false, duplicate: true };
    }

    pendingRequests.current.add(idStr);
    setPendingIds(new Set(pendingRequests.current));
    setError(null);

    try {
      await apiAddToWishlist(productId);
      await refreshWishlist();
      showToast('Added to wishlist!', 'success');
      return { success: true };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Failed to add item to wishlist.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg, status: err.response?.status };
    } finally {
      pendingRequests.current.delete(idStr);
      setPendingIds(new Set(pendingRequests.current));
    }
  };

  /**
   * Remove from Wishlist
   */
  const removeFromWishlist = async (productId) => {
    const idStr = String(productId);
    if (pendingRequests.current.has(idStr)) {
      return { success: false, duplicate: true };
    }

    pendingRequests.current.add(idStr);
    setPendingIds(new Set(pendingRequests.current));
    setError(null);

    try {
      await apiRemoveFromWishlist(productId);
      setWishlistItems((prev) =>
        prev.filter((item) => {
          const id = item?._id || item?.id || item;
          return String(id) !== idStr;
        })
      );
      showToast('Item removed from wishlist', 'info');
      return { success: true };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Failed to remove item from wishlist.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg, status: err.response?.status };
    } finally {
      pendingRequests.current.delete(idStr);
      setPendingIds(new Set(pendingRequests.current));
    }
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        loading,
        loadingWishlist: loading,
        error,
        wishlistError: error,
        clearError: () => setError(null),
        addToWishlist,
        removeFromWishlist,
        refreshWishlist,
        clearWishlist,
        isInWishlist,
        isPending,
      }}
    >
      {children}

      {/* Floating Wishlist Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-950/90 text-red-200 border-red-800/80 shadow-red-950/40'
                : toast.type === 'info'
                ? 'bg-slate-900/90 text-slate-200 border-slate-700/80 shadow-black/40'
                : 'bg-emerald-950/90 text-emerald-100 border-emerald-700/80 shadow-emerald-950/40'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
