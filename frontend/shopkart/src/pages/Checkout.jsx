import { getUser, createPaymentOrder, verifyPayment } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, cartCount, loading, clearCart, refreshCart } = useCart();

  // Controlled form state for Shipping Details
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Validation errors state (field-level and form-level)
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Hook: useEffect to pre-fill authenticated user's contact information
  useEffect(() => {
    let isMounted = true;
    getUser()
      .then((data) => {
        if (isMounted && data) {
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || data.fullname || data.name || '',
            phone: prev.phone || data.phone || '',
          }));
        }
      })
      .catch(() => {
        // Guest or unauthenticated fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle input change and clear field errors dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-level error when user starts correcting
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (formError) {
      setFormError('');
    }
  };

  /**
   * Client-side validation function.
   *
   * Enforces rules:
   * 1. No required field can be empty or whitespace-only
   * 2. Phone should contain a valid number format (e.g. 10 digits)
   * 3. Pincode should contain 6 digits
   * 4. Whitespace-only input is invalid
   */
  const validateForm = () => {
    const newErrors = {};

    // 1. Full Name
    if (!formData.fullName || !formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    // 2. Phone Number
    const trimmedPhone = (formData.phone || '').trim();
    if (!trimmedPhone) {
      newErrors.phone = 'Phone Number is required.';
    } else {
      const digitsOnly = trimmedPhone.replace(/[\s\-\+]/g, '');
      const validPhonePattern = /^(\+91[\-\s]?)?[0]?[6-9]\d{9}$|^[0-9]{10}$/;
      if (!validPhonePattern.test(trimmedPhone) && !/^[0-9]{10}$/.test(digitsOnly)) {
        newErrors.phone = 'Phone should contain a valid number format.';
      }
    }

    // 3. Address Line
    if (!formData.address || !formData.address.trim()) {
      newErrors.address = 'Address Line is required.';
    }

    // 4. City
    if (!formData.city || !formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    // 5. State
    if (!formData.state || !formData.state.trim()) {
      newErrors.state = 'State is required.';
    }

    // 6. Pincode (must contain exactly 6 digits)
    const trimmedPincode = (formData.pincode || '').trim();
    if (!trimmedPincode) {
      newErrors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(trimmedPincode)) {
      newErrors.pincode = 'Pincode must contain 6 digits.';
    }

    return newErrors;
  };

  // Form submission handler: blocks submission if basic client validation fails
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    // CRITICAL: Do not call backend if basic client validation fails
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormError('Please resolve all validation errors in the shipping form.');
      return;
    }

    setFormError('');
    setErrors({});

    if (cartItems.length === 0) {
      setFormError('Your cart is empty. Please add items before placing an order.');
      navigate('/products');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send ONLY the shipping address to backend as specified
      const shippingAddress = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      };

      await createPaymentOrder(shippingAddress);
      setIsSubmitting(false);
      setOrderPlaced(true);
    } catch (err) {
      setIsSubmitting(false);
      const errMsg = err.response?.data?.message || err.message || 'Failed to initialize payment order.';
      setFormError(errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <Link to="/cart" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Cart</span>
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold">Checkout</span>
        </div>

        {/* Order Success State View */}
        {orderPlaced ? (
          <div className="bg-slate-800 border border-slate-700/80 rounded-3xl p-8 sm:p-12 text-center shadow-2xl max-w-xl mx-auto space-y-6">
            <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Order Placed Successfully!</h2>
              <p className="text-slate-300 text-sm sm:text-base">
                Thank you, <span className="font-semibold text-indigo-400">{formData.fullName}</span>! Your order has been registered and is being processed.
              </p>
            </div>

            <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-700 text-left text-xs sm:text-sm text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Address:</span>
                <span className="font-medium text-slate-200 text-right">
                  {formData.address}, {formData.city}, {formData.state} - {formData.pincode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact:</span>
                <span className="font-medium text-slate-200">{formData.phone}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Total Amount:</span>
                <span className="font-bold text-emerald-400">₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                to="/products"
                className="py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30"
              >
                Continue Shopping
              </Link>
              <Link
                to="/home"
                className="py-3 px-6 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl text-sm transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Main Checkout Box */
          <div className="bg-slate-800/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Header: Checkout */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-700 bg-slate-800/60 flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
                <span>Checkout</span>
              </h1>
              {cartCount > 0 && (
                <span className="text-xs font-semibold px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>

            {/* Form-level Error Alert Banner */}
            {formError && (
              <div
                id="checkout-form-error"
                className="m-6 sm:m-8 mb-0 p-4 bg-red-950/80 border border-red-700/80 text-red-200 rounded-2xl flex items-center gap-3 animate-fade-in"
              >
                <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold">{formError}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} noValidate className="divide-y divide-slate-700">
              {/* Section 1: Shipping Details */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Shipping Details</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Enter the delivery address where your products should be shipped.
                  </p>
                </div>

                <div className="space-y-4 max-w-2xl">
                  {/* Full Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                    <label htmlFor="fullName" className="sm:w-36 text-sm font-medium text-slate-300">
                      Full Name
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={`w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-slate-100 text-sm focus:outline-none transition-all ${
                          errors.fullName
                            ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20'
                            : 'border-slate-700 focus:border-indigo-500 ring-2 ring-transparent focus:ring-indigo-500/20'
                        }`}
                      />
                      {errors.fullName && (
                        <p id="error-fullName" className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                          <span>⚠</span>
                          <span>{errors.fullName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                    <label htmlFor="phone" className="sm:w-36 text-sm font-medium text-slate-300">
                      Phone Number
                    </label>
                    <div className="flex-1">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter 10-digit mobile number"
                        className={`w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-slate-100 text-sm focus:outline-none transition-all ${
                          errors.phone
                            ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20'
                            : 'border-slate-700 focus:border-indigo-500 ring-2 ring-transparent focus:ring-indigo-500/20'
                        }`}
                      />
                      {errors.phone && (
                        <p id="error-phone" className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                          <span>⚠</span>
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Line */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                    <label htmlFor="address" className="sm:w-36 text-sm font-medium text-slate-300">
                      Address Line
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street, flat/house number, landmark"
                        className={`w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-slate-100 text-sm focus:outline-none transition-all ${
                          errors.address
                            ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20'
                            : 'border-slate-700 focus:border-indigo-500 ring-2 ring-transparent focus:ring-indigo-500/20'
                        }`}
                      />
                      {errors.address && (
                        <p id="error-address" className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                          <span>⚠</span>
                          <span>{errors.address}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* City */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                    <label htmlFor="city" className="sm:w-36 text-sm font-medium text-slate-300">
                      City
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City / District"
                        className={`w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-slate-100 text-sm focus:outline-none transition-all ${
                          errors.city
                            ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20'
                            : 'border-slate-700 focus:border-indigo-500 ring-2 ring-transparent focus:ring-indigo-500/20'
                        }`}
                      />
                      {errors.city && (
                        <p id="error-city" className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                          <span>⚠</span>
                          <span>{errors.city}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* State */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                    <label htmlFor="state" className="sm:w-36 text-sm font-medium text-slate-300">
                      State
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State / Region"
                        className={`w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-slate-100 text-sm focus:outline-none transition-all ${
                          errors.state
                            ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20'
                            : 'border-slate-700 focus:border-indigo-500 ring-2 ring-transparent focus:ring-indigo-500/20'
                        }`}
                      />
                      {errors.state && (
                        <p id="error-state" className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                          <span>⚠</span>
                          <span>{errors.state}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pincode */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                    <label htmlFor="pincode" className="sm:w-36 text-sm font-medium text-slate-300">
                      Pincode
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="6-digit PIN code"
                        maxLength="6"
                        className={`w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-slate-100 text-sm focus:outline-none transition-all ${
                          errors.pincode
                            ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20'
                            : 'border-slate-700 focus:border-indigo-500 ring-2 ring-transparent focus:ring-indigo-500/20'
                        }`}
                      />
                      {errors.pincode && (
                        <p id="error-pincode" className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1">
                          <span>⚠</span>
                          <span>{errors.pincode}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Order Summary */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Order Summary</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Review your items and grand total before placing the order.
                  </p>
                </div>

                {/* Items Breakdown */}
                {cartItems.length === 0 ? (
                  <div className="py-6 text-center bg-slate-900/50 rounded-2xl border border-slate-700/60 p-4 space-y-2">
                    <p className="text-sm text-slate-400">Your cart is currently empty.</p>
                    <Link to="/products" className="text-sm font-semibold text-indigo-400 hover:underline">
                      Browse catalog to add products
                    </Link>
                  </div>
                ) : (
                  <div className="bg-slate-900/60 border border-slate-700/70 rounded-2xl p-5 space-y-3.5">
                    {/* Dynamic Cart Items List */}
                    <div className="space-y-3">
                      {cartItems.map((item, index) => {
                        const name = item.product?.name || item.name || 'Product';
                        const quantity = item.quantity || 1;
                        const price = item.product?.price || item.price || 0;
                        const lineTotal = price * quantity;

                        return (
                          <div
                            key={item.product?._id || item._id || index}
                            className="flex items-center justify-between text-sm py-1 border-b border-slate-800/80 last:border-b-0"
                          >
                            <span className="text-slate-200 font-medium truncate max-w-[280px] sm:max-w-md">
                              {name} × {quantity}
                            </span>
                            <span className="text-slate-200 font-semibold shrink-0">
                              ₹{lineTotal.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-700/80 pt-3">
                      <div className="flex items-center justify-between text-base sm:text-lg font-bold">
                        <span className="text-slate-100">Total</span>
                        <span className="text-indigo-400 font-extrabold text-lg sm:text-xl">
                          ₹{cartTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Place Order CTA Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="place-order-btn"
                    disabled={isSubmitting || cartItems.length === 0}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                      cartItems.length === 0
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/30 hover:shadow-indigo-600/40'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Order...</span>
                      </div>
                    ) : (
                      <span>Place Order</span>
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>All orders are backed by ShopKart Secure Guarantee</span>
                  </p>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Checkout;
