import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getOrderById } from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State: pre-populate from navigation state if available, or fetch via API
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    if (id) {
      setLoading(true);
      getOrderById(id)
        .then((res) => {
          if (isMounted && res?.order) {
            setOrder(res.order);
            setError('');
          }
        })
        .catch((err) => {
          console.error('Failed to load order:', err);
          if (isMounted && !order) {
            setError(err.response?.data?.message || 'Unable to retrieve order details.');
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium">Loading order confirmation...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex items-center justify-center">
        <div className="w-full bg-slate-800/95 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 backdrop-blur-sm animate-fade-in">
          {/* Header Banner */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-emerald-500/15 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center justify-center gap-2">
              <span>Order Placed Successfully</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base font-medium">
              Your order has been saved successfully.
            </p>
          </div>

          {/* Core Order Information Block */}
          <div className="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-6 space-y-4">
            {/* Order ID */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-1">
              <span className="text-sm font-semibold text-slate-400">Order ID:</span>
              <span
                id="order-id-display"
                className="font-mono text-sm sm:text-base font-bold text-slate-100 break-all select-all"
              >
                {order?._id || id}
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-semibold text-slate-400">Total:</span>
              <span
                id="order-total-display"
                className="text-xl sm:text-2xl font-extrabold text-indigo-400"
              >
                ₹{order?.totalAmount ? order.totalAmount.toLocaleString('en-IN') : '0'}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-sm font-semibold text-slate-400">Status:</span>
              <span
                id="order-status-display"
                className="inline-flex items-center px-3 py-1 text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full"
              >
                {order?.status || 'PLACED'}
              </span>
            </div>
          </div>

          {/* Purchased Items Snapshot Summary (if items exist) */}
          {order?.items && order.items.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Order Items Snapshot
              </h3>
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 divide-y divide-slate-800/80">
                {order.items.map((item, idx) => (
                  <div key={item._id || idx} className="py-2.5 flex items-center justify-between text-sm first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-700 bg-slate-800"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div>
                        <p className="font-semibold text-slate-200">{item.name}</p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-100">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/orders')}
              id="view-my-orders-btn"
              className="w-full sm:flex-1 py-3.5 px-6 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-slate-100 font-bold rounded-2xl text-sm transition-all border border-slate-600/60 shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>View My Orders</span>
            </button>

            <button
              onClick={() => navigate('/products')}
              id="continue-shopping-btn"
              className="w-full sm:flex-1 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-xl shadow-indigo-600/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue Shopping</span>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderSuccess;
