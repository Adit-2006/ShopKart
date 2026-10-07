import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is mandatory"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is mandatory"],
  },
  price: {
    type: Number,
    required: [true, "Price is mandatory"],
    validate: {
      validator: function (value) {
        return value > 0;
      },
      message: "Price must be greater than 0",
    },
  },
  category: {
    type: String,
    required: [true, "Category is mandatory"],
    trim: true,
  },
  image: {
    type: String,
    required: [true, "Image URL is mandatory"],
  },
  stock: {
    type: Number,
    required: [true, "Stock is mandatory"],
    min: [0, "Stock cannot be negative"],
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
