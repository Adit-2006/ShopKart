import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getUser, logoutCustomer } from '../services/api';
import Navbar from '../components/Navbar';

const Home = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const [user, setUser] = useState(context?.user || null);
  const [loading, setLoading] = useState(!context?.user);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch logged-in user details directly on page load
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUser();
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header / Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-8 text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900/30 border border-white/20 text-2xl font-bold text-white mb-3 shadow-inner">
            {user?.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome to ShopKart
          </h1>
          <p className="text-indigo-200 text-sm mt-1">
            Hello, <span className="font-semibold text-white">{user?.fullname || 'Customer'}</span>!
          </p>
        </div>

        {/* User Details Section */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Customer Information
            </h2>

            {/* Customer Name */}
            <div className="flex items-center gap-4 p-3.5 bg-slate-900/60 border border-slate-700/60 rounded-xl">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium">Customer Name</p>
                <p className="text-base font-semibold text-slate-100 truncate">
                  {user?.fullname || 'N/A'}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-3.5 bg-slate-900/60 border border-slate-700/60 rounded-xl">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium">Email Address</p>
                <p className="text-base font-semibold text-slate-100 truncate">
                  {user?.email || 'N/A'}
                </p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-center gap-4 p-3.5 bg-slate-900/60 border border-slate-700/60 rounded-xl">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                <p className="text-base font-semibold text-slate-100 truncate">
                  {user?.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => navigate('/wishlist')}
              className="w-full py-3 px-4 bg-pink-600 hover:bg-pink-500 active:bg-pink-700 font-semibold text-white rounded-xl shadow-lg hover:shadow-pink-500/25 transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              My Wishlist
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 active:bg-red-700 font-semibold text-white rounded-xl shadow-lg hover:shadow-red-500/25 transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Home;
