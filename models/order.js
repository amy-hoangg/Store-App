const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SCHEMA_DEFAULTS = {
  name: {
    minLength: 1,
    maxLength: 50
  },
};

const orderSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        product: {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          name: {
            type: String,
            required: true,
            trim: true,
            minLength: SCHEMA_DEFAULTS.name.minLength,
            maxLength: SCHEMA_DEFAULTS.name.maxLength,
          },
          price: {
            type: Number,
            required: true,
            validate: {
              validator: function (n) {
                return n > 0;
              },
              message: 'Price cannot be 0',
            },
          },
          description: {
            type: String,
          },
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    require: true,
    validate: {
      validator: function (value) {
        return value.length > 0; // Validate minimum length of items array
      },
      message: 'Order should have at least one item',
    },
  },
});


orderSchema.set('toJSON', { virtuals: false, versionKey: false });
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
