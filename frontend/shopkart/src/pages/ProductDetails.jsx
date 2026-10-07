import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, addToWishlist, removeFromWishlist } from '../services/api';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

const placeholderSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="%231e293b"><rect width="800" height="600"/><text x="50%" y="50%" fill="%2394a3b8" font-family="sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle">Product Image</text></svg>`;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isPending: isCartPending } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imgSrc, setImgSrc] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getProductById(id);
        const prod = data?.product || data;
        setProduct(prod);
        setImgSrc(prod?.image || placeholderSvg);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const [errorMessage, setErrorMessage] = useState('');
  const inFlightRef = useRef(false);

  const isSaving = isUpdatingWishlist;

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;
    try {
      await addToCart(product._id);
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const handleWishlistClick = async () => {
    if (!product || inFlightRef.current || isSaving) return;

    inFlightRef.current = true;
    setIsUpdatingWishlist(true);
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
        navigate('/login');
      } else {
        setErrorMessage(err.response?.data?.message || 'Unable to update wishlist.');
      }
    } finally {
      inFlightRef.current = false;
      setIsUpdatingWishlist(false);
    }
  };

  const isOutOfStock = !product || product.stock <= 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb / Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-8 animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="h-96 bg-slate-700/50 rounded-2xl"></div>
            <div className="space-y-6">
              <div className="h-6 bg-slate-700/40 rounded w-1/4"></div>
              <div className="h-10 bg-slate-700/60 rounded w-3/4"></div>
              <div className="h-8 bg-slate-700/50 rounded w-1/3"></div>
              <div className="h-24 bg-slate-700/30 rounded"></div>
              <div className="h-12 bg-slate-700/60 rounded-xl"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-bold text-red-300">Product Not Found</h3>
            <p className="text-slate-400 text-sm mt-2">{error}</p>
            <button
              onClick={() => navigate('/products')}
              className="mt-6 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
            >
              Return to Catalog
            </button>
          </div>
        )}

        {/* Product Details Container */}
        {!loading && !error && product && (
          <div className="bg-slate-800/70 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              {/* Large Product Image */}
              <div className="w-full h-80 sm:h-96 lg:h-[450px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700/80 relative flex items-center justify-center shadow-inner">
                <img
                  src={imgSrc}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgSrc(placeholderSvg)}
                />
                <span className="absolute top-4 left-4 px-3.5 py-1.5 bg-slate-900/80 backdrop-blur-md text-indigo-300 border border-slate-700 text-xs font-semibold rounded-full">
                  {product.category}
                </span>
              </div>

              {/* Product Details & Actions */}
              <div className="flex flex-col justify-between space-y-6">
                <div>
                  {/* Category & Stock Pill */}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        isOutOfStock
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock} units)`}
                    </span>
                  </div>

                  {/* Name */}
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
                    {product.name}
                  </h1>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-indigo-400">
                      ₹{product.price?.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Inclusive of all taxes</span>
                  </div>

                  {/* Description */}
                  <div className="mt-6 pt-6 border-t border-slate-700/60">
                    <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Description
                    </h2>
                    <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                      {product.description || 'No detailed description provided for this product.'}
                    </p>
                  </div>

                  {/* Additional Metadata */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-900/60 border border-slate-700/60 rounded-xl">
                      <span className="text-xs text-slate-400">Category</span>
                      <p className="text-sm font-semibold text-slate-200 mt-0.5">{product.category}</p>
                    </div>
                    <div className="p-3.5 bg-slate-900/60 border border-slate-700/60 rounded-xl">
                      <span className="text-xs text-slate-400">Available Stock</span>
                      <p className="text-sm font-semibold text-slate-200 mt-0.5">{product.stock} units</p>
                    </div>
                  </div>
                </div>

                {/* Actions Section: Quantity, Add to Cart & Wishlist Button */}
                <div className="pt-6 border-t border-slate-700/60 space-y-4">
                  {!isOutOfStock && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-300">Quantity:</span>
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                          className="px-3.5 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-4 py-1.5 text-sm font-semibold text-slate-100">{quantity}</span>
                        <button
                          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                          disabled={quantity >= product.stock}
                          className="px-3.5 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-base shadow-xl flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer ${
                        isOutOfStock
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                          : addedToCart
                          ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                          : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40'
                      }`}
                    >
                      {addedToCart ? (
                        <>
                          <svg className="w-5 h-5 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                        </>
                      )}
                    </button>

                    {/* Add to Wishlist Button with clear interaction states */}
                    <button
                      onClick={handleWishlistClick}
                      disabled={isSaving}
                      className={`py-4 px-6 rounded-xl font-semibold text-base border transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                        isSaving
                          ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 cursor-not-allowed shadow-none'
                          : isSaved
                          ? 'bg-pink-900/40 border-pink-700/70 text-pink-300 hover:bg-pink-900/60 shadow-pink-900/20'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <span className="text-base">⏳</span>
                          <span>Saving...</span>
                        </>
                      ) : isSaved ? (
                        <>
                          <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          <span>Added to Wishlist</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          <span>Add to Wishlist</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Failure Alert Banner (Do not silently fail) */}
                  {errorMessage && (
                    <div className="p-3.5 bg-red-950/50 border border-red-500/40 rounded-xl text-red-200 text-sm flex items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-red-300">Unable to save product.</p>
                          <p className="text-xs text-red-400">Please try again.</p>
                        </div>
                      </div>
                      <button
                        onClick={handleWishlistClick}
                        className="px-3 py-1.5 bg-red-800/60 hover:bg-red-700/80 text-white rounded-lg font-medium text-xs transition-colors shrink-0 cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetails;

