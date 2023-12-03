const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
});

orderSchema.set('toJSON', {
  virtuals: false,
  versionKey: false,
  transform: function (doc, ret) {
    ret.items = ret.items.map(item => ({
      _id: item._id,
      product: item.product,
      quantity: item.quantity,
    }));
    return ret;
  },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

