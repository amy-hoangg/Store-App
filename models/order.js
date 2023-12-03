const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        min: 1,
        required: true
      },
    }
  ],
});

orderSchema.set("toJSON", { virtuals: false, versionKey: false });

const Order = new mongoose.model("Order", orderSchema);
module.exports = Order;

