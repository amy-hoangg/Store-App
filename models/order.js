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
    type: String,
    required: true
  },
  customerId: {
    type: String,
    required: true
  },
  items: [
    {
      _id: {
        type: String,
        required: true
      },
      product: {
        _id: {
          type: String,
          required: true
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
            message: 'price cannot be 0'
          }
        },
        description: {
          type: String
        }
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ]
});


orderSchema.set('toJSON', { virtuals: false, versionKey: false });
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
