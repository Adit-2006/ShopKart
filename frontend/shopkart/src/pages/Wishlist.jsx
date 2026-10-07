import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../services/api';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [wishlistError, setWishlistError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const refreshWishlist = useCallback(async () => {
    try {
      setLoadingWishlist(true);
      setWishlistError(null);
      const data = await getWishlist();
      const items = Array.isArray(data?.wishlist)
        ? data.wishlist
        : Array.isArray(data?.products)
        ? data.products
        : Array.isArray(data)
        ? data
        : [];
      setWishlist(items);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setWishlistError(err.response?.data?.message || 'Unable to load saved products.');
      setWishlist([]);
    } finally {
      setLoadingWishlist(false);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const handleRemove = async (productId, e) => {
    e?.stopPropagation();
    if (removingId === productId) return;

    try {
      setRemovingId(productId);
      const res = await removeFromWishlist(productId);
      const updated = Array.isArray(res?.wishlist)
        ? res.wishlist
        : Array.isArray(res?.products)
        ? res.products
        : null;

      if (updated) {
        setWishlist(updated);
      } else {
        setWishlist((prev) => prev.filter((item) => (item._id || item) !== productId));
      }
    } catch (err) {
      console.error('Error removing item from wishlist:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const count = wishlist.length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navigation: ShopKart | Products Wishlist Logout */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section: My Wishlist + {count} products saved + Direct Products Link */}
        <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              My Wishlist
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1">
              {loadingWishlist
                ? 'Loading your wishlist...'
                : wishlistError
                ? 'Unable to load saved products'
                : `${count} ${count === 1 ? 'product' : 'products'} saved`}
            </p>
          </div>

          <Link
            to="/products"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Products</span>
          </Link>
        </div>

        {/* 1. INTENTIONAL LOADING STATE (Text + Spinner + Skeleton Cards) */}
        {loadingWishlist && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl shadow-inner">
              <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-pink-300 font-semibold text-sm">Loading your wishlist...</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden animate-pulse flex flex-col h-96"
                >
                  <div className="h-52 bg-slate-700/50"></div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-700/60 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-700/40 rounded w-1/3"></div>
                      <div className="h-6 bg-slate-700/50 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-700/30 rounded w-1/4"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-9 bg-slate-700/50 rounded-xl"></div>
                      <div className="h-9 bg-slate-700/40 rounded-xl"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. ERROR STATE (Task 7 Specification) */}
        {!loadingWishlist && wishlistError && (
          <div className="text-center py-20 bg-red-950/20 border border-red-500/30 rounded-3xl p-8 max-w-lg mx-auto my-12 shadow-2xl animate-fade-in">
            {/* Warning / Error Icon */}
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-slate-100 mb-6">
              Unable to load wishlist.
            </h2>

            {/* Action Button: [ Try Again ] */}
            <button
              onClick={() => refreshWishlist()}
              id="wishlist-try-again-btn"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-600/25 hover:shadow-red-600/40 transition-all duration-200 cursor-pointer"
            >
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* 3. EMPTY STATE (Task 7 Specification) */}
        {!loadingWishlist && !wishlistError && count === 0 && (
          <div className="text-center py-20 bg-slate-800/40 border border-slate-700/60 rounded-3xl p-8 max-w-lg mx-auto my-12 shadow-2xl">
            {/* Title */}
            <h2 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight">
              Your wishlist is empty ❤️
            </h2>

            {/* Subtitle */}
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              Start saving products you love.
            </p>

            {/* Action Button: [ Browse Products ] */}
            <Link
              to="/products"
              id="empty-wishlist-browse-btn"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 cursor-pointer"
            >
              <span>Browse Products</span>
            </Link>
          </div>
        )}

        {/* 4. POPULATED WISHLIST GRID (Using WishlistCard Specification) */}
        {!loadingWishlist && !wishlistError && count > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => {
              if (!product || typeof product !== 'object') return null;
              return (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemove={handleRemove}
                  isRemoving={removingId === product._id}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
