import mongoose from "mongoose";

/**
 * Order Model Schema
 *
 * CRITICAL ARCHITECTURAL PRINCIPLE:
 * We snapshot `name` and `price` (and optional `image`) inside each item of `items`.
 *
 * Why snapshot name and price?
 * Suppose:
 * Today:      Keyboard = ₹2,999
 * Next month: Keyboard = ₹3,499
 *
 * An old order must still show ₹2,999.
 * An order represents an immutable financial record of what the user actually
 * purchased at that specific point in time, unaffected by future catalog changes.
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
        },
      },
    ],

    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      city: String,
      state: String,
      pincode: String,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"],
      default: "PENDING_PAYMENT",
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias so both order.orderItems and order.items can be accessed interchangeably
orderSchema.virtual("orderItems")
  .get(function () {
    return this.items;
  })
  .set(function (items) {
    this.items = items;
  });

// Pre-validation hook:
// 1. Bridges backwards-compatibility if a payload provides `orderItems` instead of `items`
// 2. Automatically computes totalAmount if not explicitly passed by summing (price * quantity)
orderSchema.pre("validate", function () {
  if (
    (!this.items || this.items.length === 0) &&
    Array.isArray(this.orderItems) &&
    this.orderItems.length > 0
  ) {
    this.items = this.orderItems;
  }

  if (
    (this.totalAmount === undefined || this.totalAmount === null) &&
    Array.isArray(this.items) &&
    this.items.length > 0
  ) {
    this.totalAmount = this.items.reduce((sum, item) => {
      const itemPrice = typeof item.price === "number" ? item.price : 0;
      const itemQty = typeof item.quantity === "number" ? item.quantity : 1;
      return sum + itemPrice * itemQty;
    }, 0);
  }
});

const Order = mongoose.model("Order", orderSchema);

export { Order };
export default Order;
