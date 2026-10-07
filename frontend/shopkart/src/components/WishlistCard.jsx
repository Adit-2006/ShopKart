import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const placeholderSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%231e293b"><rect width="400" height="300"/><text x="50%" y="50%" fill="%2394a3b8" font-family="sans-serif" font-size="18" text-anchor="middle" dominant-baseline="middle">Product Image</text></svg>`;

/**
 * WishlistCard Component
 * Implements the exact Wishlist Card Specification:
 * - Product image
 * - Product name
 * - Category
 * - Price
 * - Stock status
 * - [ View Details ]
 * - [ Remove ♥ ]
 */
const WishlistCard = ({ product, onRemove, isRemoving }) => {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(product?.image || placeholderSvg);

  const isOutOfStock = !product?.stock || product.stock <= 0;
  const stockText = isOutOfStock ? 'Out of stock' : `${product.stock} units left`;

  return (
    <div className="group bg-slate-800 border border-slate-700 hover:border-pink-500/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between">
      {/* 1. PRODUCT IMAGE */}
      <div className="relative w-full h-52 bg-slate-900 overflow-hidden flex items-center justify-center border-b border-slate-700/60">
        <img
          src={imgSrc}
          alt={product?.name || 'Product Image'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgSrc(placeholderSvg)}
        />
        {/* Subtle category pill badge */}
        <span className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-indigo-300 border border-slate-700/80 text-xs font-semibold rounded-full">
          {product?.category || 'General'}
        </span>
      </div>

      {/* CARD CONTENT */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-1.5">
          {/* 2. PRODUCT NAME */}
          <h3 className="text-lg font-bold text-slate-100 line-clamp-1 group-hover:text-pink-400 transition-colors">
            {product?.name}
          </h3>

          {/* 3. CATEGORY */}
          <p className="text-xs font-medium text-slate-400">
            {product?.category}
          </p>

          {/* 4. PRICE */}
          <p className="pt-1 text-2xl font-extrabold text-indigo-400">
            ₹{product?.price?.toLocaleString()}
          </p>

          {/* 5. STOCK STATUS */}
          <p
            className={`text-xs font-medium ${
              isOutOfStock ? 'text-red-400' : 'text-slate-400'
            }`}
          >
            {stockText}
          </p>
        </div>

        {/* 6 & 7. ACTION BUTTONS: [ View Details ] & [ Remove ♥ ] */}
        <div className="space-y-2 pt-3 border-t border-slate-700/50">
          {/* [ View Details ] */}
          <button
            onClick={() => navigate(`/products/${product?._id}`)}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-semibold text-white text-xs rounded-xl shadow hover:shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View Details</span>
          </button>

          {/* [ Remove ♥ ] */}
          <button
            onClick={(e) => onRemove(product?._id, e)}
            disabled={isRemoving}
            title="Remove from Wishlist"
            className="w-full py-2.5 px-4 bg-slate-700/60 hover:bg-red-900/30 active:bg-red-900/50 text-slate-300 hover:text-red-300 border border-slate-600/60 hover:border-red-500/40 font-semibold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {isRemoving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Removing...</span>
              </>
            ) : (
              <>
                <span>Remove from Wishlist</span>
                <span className="text-pink-500 text-xs font-bold">♥</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
