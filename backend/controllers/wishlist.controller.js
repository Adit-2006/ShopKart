import mongoose from 'mongoose';
import Product from '../models/product.models.js';
import User from '../models/customer.models.js';

/**
 * Task 2: Add Product to Wishlist API
 * Route: POST /wishlist/:productId
 * Authentication: Identifies user from authenticated request (req.user)
 * Does NOT accept userId from request body.
 *
 * Flow:
 * 1. Validate productId -> 400 Bad Request
 * 2. Find Product -> 404 Product Not Found
 * 3. Check if already wishlisted -> 409 Conflict
 * 4. Add Product ObjectId & save user
 * 5. Return Success -> 200 { success: true, message: "Product added to wishlist" }
 */
export const addToWishlist = async (req, res) => {
  try {
    // Authenticated user identified from req.user
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Find Product in catalog
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Get fresh user document
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    user.wishlist = user.wishlist || [];

    // Check if product is already in wishlist
    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Already in wishlist',
      });
    }

    // Add Product ObjectId and save user
    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    console.error('Error in addToWishlist:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to add product to wishlist',
    });
  }
};

/**
 * Task 3: Get Current User's Wishlist API
 * Route: GET /wishlist
 * Security Rule: Never accepts userId from route params (NO GET /wishlist/:userId)
 * Authenticates user from JWT and populates wishlist Product references.
 *
 * Flow:
 * 1. Identify user from req.user._id
 * 2. Load User document
 * 3. Populate wishlist references
 * 4. Return populated products in wishlist array
 */
export const getWishlist = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Load User from customer collection and populate wishlist references
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock description',
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Filter out any dangling or null references in case products were deleted from catalog
    const products = (user.wishlist || []).filter(Boolean);

    return res.status(200).json({
      success: true,
      count: products.length,
      wishlist: products,
    });
  } catch (error) {
    console.error('Error in getWishlist:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch wishlist',
    });
  }
};

/**
 * Task 4: Remove Product from Wishlist API
 * Route: DELETE /wishlist/:productId
 * Authentication: Identifies user from authenticated request (req.user)
 *
 * Flow:
 * 1. Authenticate -> 401 Unauthorized
 * 2. Validate productId -> 400 Bad Request
 * 3. Find Current User
 * 4. Check Wishlist: product exists in wishlist? -> 404 Not Found if missing
 * 5. Remove Product Reference
 * 6. Save User
 * 7. Return Success -> 200 { success: true, message: "Product removed from wishlist" }
 */
export const removeFromWishlist = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Find current user document
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    user.wishlist = user.wishlist || [];

    // Check if the product exists in the user's wishlist
    const isProductInWishlist = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (!isProductInWishlist) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    // Remove product reference from user's wishlist
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    console.error('Error in removeFromWishlist:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove product from wishlist',
    });
  }
};
