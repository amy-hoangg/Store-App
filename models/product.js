const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0, // Minimum price should be greater than 0
    // Here, you might also consider using a custom getter/setter to handle the price format as needed
    // For instance, you could divide the stored price by 100 to convert it to Euros and cents format
    // Or handle it based on your application's specific requirements.
  },
  image: {
    type: String,
    required: true,
    format: 'uri', // Not enforced by Mongoose, just for reference
  },
  description: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
