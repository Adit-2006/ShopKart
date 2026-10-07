import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const hasLoadedOnce = useRef(false);

  const fetchProductList = useCallback(async (searchTerm, categoryFilter) => {
    try {
      setLoading(!hasLoadedOnce.current);
      setError('');

      const params = {};
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (categoryFilter && categoryFilter !== 'All Categories') {
        params.category = categoryFilter;
      }

      const data = await getProducts(params);

      if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
      hasLoadedOnce.current = true;
    }
  }, []);

  // Debounced search and category effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductList(search, category);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, category, fetchProductList]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Explore Products</h1>
            <p className="text-sm text-slate-400 mt-1">
              Search and filter through our catalog in real-time
            </p>
          </div>
          {!loading && !error && (
            <span className="self-start sm:self-auto px-3.5 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs font-semibold text-indigo-300">
              {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
            </span>
          )}
        </div>

        {/* Search and Category Filter Section */}
        <div className="mb-8">
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
          />
        </div>

        {/* 1. LOADING STATE */}
        {loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-300 font-medium text-sm">Loading products...</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden animate-pulse flex flex-col h-80"
                >
                  <div className="h-52 bg-slate-700/50"></div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-700/60 rounded w-3/4"></div>
                      <div className="h-6 bg-slate-700/40 rounded w-1/2"></div>
                    </div>
                    <div className="h-10 bg-slate-700/50 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="my-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center max-w-lg mx-auto">
            <svg
              className="w-12 h-12 text-red-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-bold text-red-300 mb-1">
              Something went wrong while loading products.
            </h3>
            <p className="text-sm text-slate-400 mb-4">Please check your network connection or server status.</p>
            <button
              onClick={() => fetchProductList(search, category)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-semibold rounded-xl shadow transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16 bg-slate-800/40 border border-slate-700/60 rounded-2xl p-8 max-w-md mx-auto my-8">
            <svg
              className="w-16 h-16 mx-auto text-slate-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="text-xl font-bold text-slate-200 mb-1">No products found.</h3>
            <p className="text-slate-400 text-sm mb-4">
              Try adjusting your search terms or clearing your category filters.
            </p>
            {(search || category !== 'All Categories') && (
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('All Categories');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* SUCCESS PRODUCTS GRID */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
