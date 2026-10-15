import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getUser } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const { clearCart, refreshCart } = useCart();
  const { clearWishlist, refreshWishlist } = useWishlist();

  useEffect(() => {
    let isMounted = true;

    getUser()
      .then((data) => {
        if (isMounted) {
          setUser(data);
          setIsAuthenticated(true);
          refreshCart();
          refreshWishlist();
        }
      })
      .catch(() => {
        if (isMounted) {
          clearCart();
          clearWishlist();
          setIsAuthenticated(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet context={{ user }} /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
