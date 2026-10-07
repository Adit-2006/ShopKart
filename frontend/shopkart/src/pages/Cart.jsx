import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

const placeholderSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="%231e293b"><rect width="200" height="200"/><text x="50%" y="50%" fill="%2394a3b8" font-family="sans-serif" font-size="14" text-anchor="middle" dominant-baseline="middle">Product</text></svg>`;

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    error,
    updateQuantity,
    removeFromCart,
    refreshCart,
    isPending,
  } = useCart();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  const handleConfirmOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      setCheckoutModalOpen(false);
      setOrderPlaced(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
              <span>My Cart</span>
              {cartCount > 0 && (
                <span className="text-sm font-semibold px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1">
              Review and manage items in your shopping cart before checkout.
            </p>
          </div>

          <Link
            to="/products"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* 1. LOADING STATE */}
        {loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl shadow-inner">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-indigo-300 font-semibold text-sm">Loading your cart...</p>
            </div>
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 animate-pulse flex gap-6 items-center">
                  <div className="w-24 h-24 bg-slate-700/50 rounded-xl shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-slate-700/60 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-700/40 rounded w-1/4"></div>
                    <div className="h-8 bg-slate-700/30 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="text-center py-16 bg-red-950/20 border border-red-500/30 rounded-3xl p-8 max-w-lg mx-auto my-8 shadow-2xl">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">Unable to load your cart.</h2>
            <p className="text-slate-400 text-sm mb-6">{error}</p>
            <button
              onClick={() => refreshCart()}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* 3. EMPTY CART STATE */}
        {!loading && !error && cartItems.length === 0 && (
          <div className="text-center py-20 bg-slate-800/40 border border-slate-700/60 rounded-3xl p-8 max-w-lg mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight flex items-center justify-center gap-2">
              <span>Your cart is empty</span>
              <span>🛒</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              Looks like you haven't added anything yet.
            </p>
            <Link
              to="/products"
              id="empty-cart-browse-btn"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 cursor-pointer"
            >
              <span>Browse Products</span>
            </Link>
          </div>
        )}

        {/* 4. POPULATED CART: ITEMS LIST + ORDER SUMMARY */}
        {!loading && !error && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Columns: Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = item.product || {};
                const productId = product._id || product.id || item.product;
                const price = product.price || 0;
                const quantity = item.quantity || 1;
                const lineTotal = price * quantity;
                const itemPending = isPending(productId);
                const isMaxStock = product.stock !== undefined && quantity >= product.stock;

                return (
                  <div
                    key={productId}
                    id={`cart-item-${productId}`}
                    className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                  >
                    {/* Left: Thumbnail & Name / Category */}
                    <div className="flex gap-4 items-center min-w-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-900 rounded-xl overflow-hidden border border-slate-700/80 shrink-0 flex items-center justify-center">
                        <img
                          src={product.image || placeholderSvg}
                          alt={product.name || 'Product'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = placeholderSvg;
                          }}
                        />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <Link
                          to={`/products/${productId}`}
                          className="text-base sm:text-lg font-bold text-slate-100 hover:text-indigo-400 transition-colors line-clamp-1 cursor-pointer"
                        >
                          {product.name || 'Product Item'}
                        </Link>
                        <p className="text-xs font-medium text-slate-400">
                          {product.category || 'General'}
                        </p>
                        <p className="text-sm font-extrabold text-indigo-400">
                          ₹{price.toLocaleString()}
                        </p>
                        {product.stock !== undefined && (
                          <p className="text-[11px] text-slate-400">
                            Available: {product.stock} units
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Quantity Controls, Line Total, Remove Button */}
                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-700/60 shrink-0">
                      {/* Interactive Quantity Stepper */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                          {/* Decrement [-] Button */}
                          <button
                            onClick={() => updateQuantity(productId, quantity - 1)}
                            disabled={itemPending || quantity <= 1}
                            aria-label="Decrease quantity"
                            title={quantity <= 1 ? "Minimum quantity is 1. Use Remove below to delete item." : "Decrease quantity"}
                            id={`qty-decrease-${productId}`}
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                            </svg>
                          </button>

                          {/* Current Quantity */}
                          <span
                            id={`qty-value-${productId}`}
                            className="w-10 text-center text-sm font-bold text-slate-100"
                          >
                            {itemPending ? (
                              <span className="inline-block w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              quantity
                            )}
                          </span>

                          {/* Increment [+] Button */}
                          <button
                            onClick={() => updateQuantity(productId, quantity + 1)}
                            disabled={itemPending || isMaxStock}
                            aria-label="Increase quantity"
                            title={isMaxStock ? `Maximum available stock reached (${product.stock})` : "Increase quantity"}
                            id={`qty-increase-${productId}`}
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Remove Action Button */}
                        <button
                          onClick={() => removeFromCart(productId)}
                          disabled={itemPending}
                          id={`remove-item-${productId}`}
                          className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Remove</span>
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right min-w-24">
                        <span className="text-xs text-slate-400 block font-medium">Subtotal</span>
                        <span className="text-lg font-black text-slate-100">
                          ₹{lineTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Order Summary (Task 8 Specification) */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-7 sticky top-24 shadow-2xl backdrop-blur-md">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight pb-4 border-b border-slate-700/60">
                Order Summary
              </h2>

              <div className="mt-5 space-y-3.5 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Items</span>
                  <span id="summary-items-count" className="font-semibold text-slate-100">
                    {cartCount}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span id="summary-subtotal" className="font-bold text-indigo-400">
                    ₹{cartTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-semibold">Free</span>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-100">Total</span>
                  <span id="summary-total" className="text-2xl font-black text-indigo-400">
                    ₹{cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                id="proceed-to-checkout-btn"
                className="mt-6 w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure SSL checkout powered by ShopKart</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Checkout Confirmation Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h3 className="text-xl font-bold text-slate-100">Checkout</h3>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {orderPlaced ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-slate-100">Order Placed Successfully!</h4>
                <p className="text-sm text-slate-300">
                  Thank you for your purchase. We are preparing your order!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Total Items:</span>
                    <span className="font-semibold text-slate-100">{cartCount}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-100">
                    <span>Amount Due:</span>
                    <span className="text-indigo-400 font-extrabold">₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleConfirmOrder}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
                  >
                    Confirm & Pay ₹{cartTotal.toLocaleString()}
                  </button>
                  <button
                    onClick={() => setCheckoutModalOpen(false)}
                    className="w-full py-2.5 px-4 bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Back to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
