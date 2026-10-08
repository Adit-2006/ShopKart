import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUserOrders } from '../services/api';

/**
 * Task 8 — My Orders Page (/orders)
 *
 * Implements the customer order history screen adhering to the specification:
 * - Order cards matching the wireframe:
 *     Order #<id>
 *     <Date> (e.g. 5 Oct 2026)
 *     Item names × quantities
 *     Total: ₹<amount>
 *     Status: <status>
 *     [ View Details ] CTA button
 * - Supports all 3 mandatory states:
 *     1. Loading state (animated spinner with status message)
 *     2. Empty state ("You have not placed any orders yet." + [ Start Shopping ])
 *     3. Error state (actionable error card with retry mechanism)
 */
const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper to format date into "5 Oct 2026" style as specified in the wireframe
  const formatOrderDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.message || 'Failed to retrieve your order history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 id="orders-title" className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
              <span>My Orders</span>
              {!loading && !error && orders.length > 0 && (
                <span id="orders-count-badge" className="text-sm font-semibold px-3 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </span>
              )}
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1">
              Review and track all your past purchases and receipts.
            </p>
          </div>

          <Link
            to="/products"
            id="orders-browse-catalog-link"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>Browse Products</span>
            <span>→</span>
          </Link>
        </div>

        {/* 1. Loading State */}
        {loading && (
          <div id="orders-loading-state" className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-base font-medium text-slate-300">Loading orders...</p>
            <p className="text-xs text-slate-500">Fetching your purchase history from the server</p>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <div
            id="orders-error-state"
            className="p-8 bg-red-950/50 border border-red-800/80 text-red-200 rounded-3xl text-center max-w-md mx-auto shadow-2xl space-y-4"
          >
            <div className="w-14 h-14 bg-red-900/40 border border-red-700/50 rounded-2xl flex items-center justify-center mx-auto text-red-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-100">Unable to Load Orders</h3>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={fetchOrders}
                id="orders-retry-btn"
                className="py-2.5 px-5 bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg"
              >
                Try Again
              </button>
              <Link
                to="/products"
                className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-all"
              >
                Back to Shop
              </Link>
            </div>
          </div>
        )}

        {/* 3. Empty State (Exact wireframe: "You have not placed any orders yet." + [ Start Shopping ]) */}
        {!loading && !error && orders.length === 0 && (
          <div
            id="orders-empty-state"
            className="text-center py-20 bg-slate-800/40 border border-slate-700/60 rounded-3xl p-8 sm:p-12 max-w-lg mx-auto space-y-6 shadow-2xl backdrop-blur-sm"
          >
            <div className="w-20 h-20 bg-slate-800/80 border border-slate-700 rounded-3xl flex items-center justify-center mx-auto text-slate-400 shadow-inner">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>

            <div className="space-y-2">
              <p id="orders-empty-message" className="text-xl sm:text-2xl font-bold text-slate-200">
                You have not placed any orders yet.
              </p>
              <p className="text-sm text-slate-400">
                Explore our catalog to find items and complete your first order.
              </p>
            </div>

            <div>
              <Link
                to="/products"
                id="start-shopping-btn"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-8 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl text-sm sm:text-base transition-all shadow-xl shadow-indigo-600/30 cursor-pointer"
              >
                <span>Start Shopping</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* 4. Orders List (Card layout matching the wireframe) */}
        {!loading && !error && orders.length > 0 && (
          <div id="orders-list" className="space-y-6">
            {orders.map((ord) => (
              <div
                key={ord._id}
                id={`order-card-${ord._id}`}
                className="bg-slate-800/85 border border-slate-700/80 hover:border-slate-600/90 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5 transition-all duration-200"
              >
                {/* Order Identification & Date Header */}
                <div className="space-y-1">
                  <h2
                    id={`order-id-${ord._id}`}
                    className="text-lg sm:text-xl font-bold font-mono text-slate-100 tracking-tight"
                  >
                    Order #{ord._id}
                  </h2>
                  <p
                    id={`order-date-${ord._id}`}
                    className="text-sm text-slate-400 font-medium"
                  >
                    {formatOrderDate(ord.createdAt)}
                  </p>
                </div>

                {/* Items List: "{Item Name} × {Quantity}" */}
                <div
                  id={`order-items-${ord._id}`}
                  className="space-y-2 py-3 border-y border-slate-700/60"
                >
                  {ord.items && ord.items.length > 0 ? (
                    ord.items.map((it, idx) => (
                      <div
                        key={it._id || idx}
                        className="flex items-center justify-between text-sm sm:text-base py-1"
                      >
                        <span className="text-slate-200 font-medium">
                          {it.name} × {it.quantity}
                        </span>
                        <span className="text-slate-400 text-sm font-mono">
                          ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No item details recorded</p>
                  )}
                </div>

                {/* Financial Total & Order Status */}
                <div className="space-y-2 pt-1">
                  <div
                    id={`order-total-${ord._id}`}
                    className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2"
                  >
                    <span>Total:</span>
                    <span className="text-indigo-400 font-extrabold text-xl font-mono">
                      ₹{ord.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div
                    id={`order-status-${ord._id}`}
                    className="flex items-center gap-2.5 text-sm font-semibold"
                  >
                    <span className="text-slate-300">Status:</span>
                    <span
                      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-extrabold tracking-wide border ${
                        ord.status === 'PLACED' || ord.status === 'DELIVERED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : ord.status === 'PENDING_PAYMENT'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>

                {/* View Details CTA Button */}
                <div className="pt-2">
                  <button
                    onClick={() => navigate(`/orders/${ord._id}`)}
                    id={`view-details-btn-${ord._id}`}
                    className="w-full sm:w-auto py-2.5 px-6 bg-slate-700/80 hover:bg-indigo-600 text-slate-100 hover:text-white font-bold rounded-xl text-sm transition-all duration-200 border border-slate-600/60 hover:border-indigo-500 cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <span>[ View Details ]</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
