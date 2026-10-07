import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { logoutCustomer } from '../services/api';

const Navbar = () => {
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      navigate('/login');
    }
  };

  return (
    <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/80 sticky top-0 z-30 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/products"
          className="text-2xl font-extrabold text-indigo-400 tracking-tight flex items-center gap-2 hover:text-indigo-300 transition-colors"
        >
          <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>ShopKart</span>
        </Link>

        {/* Navigation Items: Home | Products | Wishlist | Cart | Logout */}
        <nav aria-label="Main Navigation" className="flex items-center gap-1.5 sm:gap-4 md:gap-6">
          {/* 1. Home */}
          <Link
            to="/home"
            id="nav-home-link"
            className={`text-sm font-semibold transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
              isActive('/home')
                ? 'text-indigo-400 bg-indigo-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
            }`}
          >
            <span>Home</span>
          </Link>

          {/* 2. Products */}
          <Link
            to="/products"
            id="nav-products-link"
            className={`text-sm font-semibold transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
              isActive('/products')
                ? 'text-indigo-400 bg-indigo-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
            }`}
          >
            <span>Products</span>
          </Link>

          {/* 3. Wishlist */}
          <Link
            to="/wishlist"
            id="nav-wishlist-link"
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-1.5 rounded-lg ${
              isActive('/wishlist')
                ? 'text-pink-400 bg-pink-500/10'
                : 'text-slate-300 hover:text-pink-300 hover:bg-slate-700/40'
            }`}
          >
            <svg
              className="w-4 h-4 text-slate-400"
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
            <span>Wishlist</span>
          </Link>

          {/* 4. Cart (with live counter badge from useCart) */}
          <Link
            to="/cart"
            id="nav-cart-link"
            className={`relative flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-1.5 rounded-lg ${
              isActive('/cart')
                ? 'text-indigo-400 bg-indigo-500/10'
                : 'text-slate-300 hover:text-indigo-300 hover:bg-slate-700/40'
            }`}
          >
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>Cart</span>
            <span
              id="nav-cart-count"
              className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold rounded-full ${
                cartCount > 0
                  ? 'text-white bg-indigo-600 shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 bg-slate-800'
              }`}
            >
              ({cartCount || 0})
            </span>
          </Link>

          {/* 4. Logout */}
          <button
            onClick={handleLogout}
            id="nav-logout-btn"
            className="text-sm font-semibold text-slate-300 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
