import mongoose from 'mongoose';
import Product from '../models/product.models.js';
import User from '../models/customer.models.js';

/**
 * Task 2: Add Product to Cart API
 * Route: POST /cart/:productId
 * Authentication: Required (identifies customer from req.user._id)
 *
 * Flow:
 * 1. Authenticate user from req.user
 * 2. Validate productId format -> 400 Bad Request
 * 3. Find Product in catalog -> 404 Product Not Found
 * 4. Check if product is already in user's cart:
 *    - If not present: new quantity = 1
 *    - If present: new quantity = existing quantity + 1
 * 5. Check stock:
 *    - If new quantity > product.stock -> 400 Bad Request
 * 6. Save User document
 * 7. Return 200 OK with { success: true, message: "Cart updated", cart: [...] }
 */
export const addToCart = async (req, res) => {
  try {
    // 1. Authenticate user
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { productId } = req.params;

    // 2. Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 3. Find Product in catalog
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Load fresh user document
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    user.cart = user.cart || [];

    // 4. Check if product is already in cart
    const existingItem = user.cart.find(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

    // 5. Stock validation: new quantity must not exceed available product stock
    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available.`,
      });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      user.cart.push({
        product: productId,
        quantity: 1,
      });
    }

    // 6. Save User document
    await user.save();

    // Populate product details for the updated cart response
    await user.populate('cart.product');

    // 7. Return updated cart
    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: user.cart,
    });
  } catch (error) {
    console.error('Error in addToCart:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update cart',
    });
  }
};

/**
 * Task 3: Get Current User Cart API
 * Route: GET /cart
 * Authentication: Required (identifies customer from req.user._id)
 *
 * Flow:
 * 1. Authenticate user from req.user
 * 2. Load User document and populate each cart item's product reference
 * 3. Filter out any dangling product references if an item was removed from catalog
 * 4. Return 200 OK with { success: true, cart: [...] }
 */
export const getCart = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price image stock description category',
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Filter out any dangling/null references if a product was deleted from the catalog
    const validCartItems = (user.cart || []).filter(
      (item) => item && item.product
    );

    return res.status(200).json({
      success: true,
      cart: validCartItems,
    });
  } catch (error) {
    console.error('Error in getCart:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch cart',
    });
  }
};

/**
 * Task 4: Update Product Quantity
 * Route: PATCH /cart/:productId
 * Request body: { "quantity": 3 }
 *
 * Rules:
 * - Quantity must be a number
 * - Quantity must be at least 1
 * - Quantity must not exceed Product stock
 * - Product must already exist in the cart
 *
 * Failure cases:
 * - Not logged in -> 401
 * - Invalid product ID -> 400
 * - Product not found in catalog -> 404
 * - Product not in cart -> 404
 * - Quantity < 1 -> 400
 * - Quantity > stock -> 400
 */
export const updateCartQuantity = async (req, res) => {
  try {
    // 1. Authenticate user (Not logged in -> 401)
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    // 2. Validate product ID (Invalid product ID -> 400)
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 3. Validate quantity format & minimum (Quantity < 1 -> 400)
    if (typeof quantity !== 'number' || Number.isNaN(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid number of at least 1',
      });
    }

    // 4. Check if product exists in catalog (Product not found -> 404)
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Load fresh user document
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    user.cart = user.cart || [];

    // 5. Check if product exists in user's cart (Product not in cart -> 404)
    const cartItem = user.cart.find(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    // 6. Check stock limit (Quantity > stock -> 400)
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available.`,
      });
    }

    // 7. Update quantity & save
    cartItem.quantity = quantity;
    await user.save();

    await user.populate('cart.product');

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: user.cart,
    });
  } catch (error) {
    console.error('Error in updateCartQuantity:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update cart quantity',
    });
  }
};

/**
 * Task 5: Remove Product from Cart
 * Route: DELETE /cart/:productId
 * Authentication: Required (identifies customer from req.user._id)
 *
 * Flow:
 * 1. Authenticate user from req.user (401 if missing)
 * 2. Validate productId (400 if invalid ObjectId)
 * 3. Find customer document
 * 4. Verify product exists in user's cart (404 if missing)
 * 5. Remove product from user.cart array
 * 6. Save user document
 * 7. Return updated cart (200 OK)
 */
export const removeFromCart = async (req, res) => {
  try {
    // 1. Authenticate user
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { productId } = req.params;

    // 2. Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // 3. Load user document
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    user.cart = user.cart || [];

    // 4. Verify product exists in user's cart
    const isProductInCart = user.cart.some(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (!isProductInCart) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    // 5. Remove product reference from user's cart
    user.cart = user.cart.filter(
      (item) => item.product && item.product.toString() !== productId.toString()
    );

    // 6. Save user document
    await user.save();

    // Deep populate product details for remaining cart items
    await user.populate('cart.product');

    // 7. Return updated cart
    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: user.cart,
    });
  } catch (error) {
    console.error('Error in removeFromCart:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove product from cart',
    });
  }
};
