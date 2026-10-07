import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToWishlist, removeFromWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const placeholderSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%231e293b"><rect width="400" height="300"/><text x="50%" y="50%" fill="%2394a3b8" font-family="sans-serif" font-size="18" text-anchor="middle" dominant-baseline="middle">Product Image</text></svg>`;

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, isPending: isCartPending, isInCart } = useCart();
  const [imgSrc, setImgSrc] = useState(product.image || placeholderSvg);
  const [isSaved, setIsSaved] = useState(false);
  const [localSaving, setLocalSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inFlightRef = useRef(false);

  const isSaving = localSaving;
  const isOutOfStock = product.stock <= 0;
  const inCart = isInCart(product._id);
  const isAddingToCart = isCartPending(product._id);

  const handleWishlistClick = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    // Prevent duplicate requests
    if (inFlightRef.current || isSaving) {
      return;
    }

    inFlightRef.current = true;
    setLocalSaving(true);
    setErrorMessage('');

    try {
      if (isSaved) {
        await removeFromWishlist(product._id);
        setIsSaved(false);
      } else {
        await addToWishlist(product._id);
        setIsSaved(true);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMessage('Please login to save products to your wishlist.');
      } else {
        setErrorMessage(
          err?.response?.data?.message || 'Unable to update wishlist. Please try again.'
        );
      }
    } finally {
      inFlightRef.current = false;
      setLocalSaving(false);
    }
  };

  const handleAddToCartClick = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (isOutOfStock || isAddingToCart) return;
    await addToCart(product._id);
  };

  return (
    <div className="group bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between relative">
      {/* Product Image and Overlay Controls */}
      <div className="relative w-full h-52 bg-slate-900 overflow-hidden flex items-center justify-center">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgSrc(placeholderSvg)}
        />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-indigo-300 border border-slate-700/80 text-xs font-semibold rounded-full">
          {product.category}
        </span>

        {/* Wishlist Quick Toggle Button on Top Right */}
        <button
          onClick={handleWishlistClick}
          disabled={isSaving}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all duration-200 cursor-pointer ${
            isSaved
              ? 'bg-pink-600/90 border-pink-500 text-white'
              : 'bg-slate-900/70 border-slate-700/80 text-slate-300 hover:text-pink-400 hover:border-pink-500/50'
          }`}
          title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{product.category}</p>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-indigo-400">
              ₹{product.price?.toLocaleString()}
            </span>
            <span
              className={`text-xs font-medium ${
                isOutOfStock ? 'text-red-400' : 'text-slate-400'
              }`}
            >
              {isOutOfStock ? 'Out of stock' : `${product.stock} units left`}
            </span>
          </div>
        </div>

        {/* Action Buttons: [ View Details ] [ Add to Cart ] */}
        <div className="mt-5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate(`/products/${product._id}`)}
              className="py-2.5 px-2 bg-slate-700/80 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-600/60 transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer truncate"
            >
              <span>View Details</span>
            </button>

            {/* Add to Cart Button (Task 7 Integration) */}
            <button
              onClick={handleAddToCartClick}
              disabled={isOutOfStock || isAddingToCart}
              id={`add-to-cart-btn-${product._id}`}
              className={`py-2.5 px-2 font-semibold text-xs rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                isOutOfStock
                  ? 'bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed'
                  : isAddingToCart
                  ? 'bg-indigo-950/40 border-indigo-600/50 text-indigo-300 cursor-not-allowed'
                  : inCart
                  ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border-emerald-500/50 shadow hover:shadow-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 border-indigo-500/50 text-white shadow hover:shadow-indigo-500/25'
              }`}
            >
              {isOutOfStock ? (
                <span>Out of Stock</span>
              ) : isAddingToCart ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin shrink-0"></span>
                  <span>Adding...</span>
                </>
              ) : inCart ? (
                <>
                  <span className="font-bold">+</span>
                  <span>Add Another</span>
                </>
              ) : (
                <>
                  <span className="font-bold">+</span>
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>

          {/* Failure Alert Banner (Do not silently fail) */}
          {errorMessage && (
            <div className="p-2.5 bg-red-950/50 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-1.5 min-w-0">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="truncate">
                  <p className="font-semibold text-red-300">Unable to save product.</p>
                  <p className="text-[10px] text-red-400">Please try again.</p>
                </div>
              </div>
              <button
                onClick={handleWishlistClick}
                className="px-2 py-1 bg-red-800/60 hover:bg-red-700/80 text-white rounded font-medium text-[11px] transition-colors shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
