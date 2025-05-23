const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to product/item collection
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  imageUrl: { type: String }, // Optional: Image URL for display
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true }, // Unique identifier for the order
  items: [itemSchema], // List of items in the order
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  orderDate: { type: Date, default: Date.now },
  deliveryAddress: { type: String, required: true },
});

const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store hashed passwords
  address: { type: String},
  wishlist: {
    type: [itemSchema],
    default: [], // Default to an empty array
  },
  cart: {
    items: {
      type: [itemSchema],
      default: [], // Default to an empty array
    },
    totalQuantity: { type: Number, default: 0 }, // Defaults to 0
    totalPrice: { type: Number, default: 0 }, // Defaults to 0
  },
  orders: {
    type: [orderSchema],
    default: [], // Default to an empty array
  },
}, { timestamps: true });

exports.Buyer = mongoose.model('Buyer', buyerSchema);

