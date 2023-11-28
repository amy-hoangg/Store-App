const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1 // Quantity should be a minimum of 1
  }
});

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function (value) {
        return value.length > 0; // Validate minimum length of items array
      },
      message: 'Order should have at least one item'
    }
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
