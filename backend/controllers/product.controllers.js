import Product from '../models/product.models.js';

export const createProduct = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const products = await Product.insertMany(req.body);
      return res.status(201).json({
        success: true,
        count: products.length,
        products,
      });
    }

    const { name, description, price, category, image, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({
      message: error.message || 'Failed to create product',
      error,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    // Case-insensitive search on product name
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    // Category filter
    if (category && category.trim()) {
      query.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    const products = await Product.find(query).select('_id name price category image stock');

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products',
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Invalid product ID or request',
    });
  }
};
