const Product = require('../models/product');
const responseUtils = require('../utils/responseUtils');

const getAllProducts = async (response) => {
  try {
    const products = await Product.find({});
    return responseUtils.sendJson(response, products);
  } catch (error) {
    return responseUtils.internalServerError(response, error.message);
  }
};

const deleteProduct = async (response, productId, currentProduct) => {
  try {
    const product = await Product.findById(productId).exec();

    if (currentProduct._id.equals(productId)) {
      return responseUtils.badRequest(response, "Cannot delete your own data");
    }
    if (!product) {
      return responseUtils.notFound(response);
    }

    const productToDelete = await Product.findByIdAndDelete(productId);
    return responseUtils.sendJson(response, productToDelete);
  } catch (error) {
    return responseUtils.internalServerError(response, error.message);
  }
};

const updateProduct = async (response, productId, currentProduct, productData) => {
  try {
    const product = await Product.findById(productId).exec();

    if (!product) {
      return responseUtils.notFound(response);
    }

    if (currentProduct._id.equals(productId)) {
      return responseUtils.badRequest(response, "Updating own data is not allowed");
    }

    if (!productData.name || !productData.price || !productData.image || !productData.description) {
      return responseUtils.badRequest(response, "Incomplete product data");
    }

    // Update the product fields
    product.name = productData.name;
    product.price = productData.price;
    product.image = productData.image;
    product.description = productData.description;

    await product.save();
    return responseUtils.sendJson(response, product);
  } catch (error) {
    return responseUtils.internalServerError(response, error.message);
  }
};

const viewProduct = async (response, productId, currentProduct) => {
  try {
    const product = await Product.findById(productId).exec();

    if (!product) {
      return responseUtils.notFound(response);
    }

    return responseUtils.sendJson(response, product);
  } catch (error) {
    return responseUtils.internalServerError(response, error.message);
  }
};

const registerProduct = async (response, productData) => {
  try {
    if (!productData.name || !productData.price || !productData.image || !productData.description) {
      return responseUtils.badRequest(response, "Incomplete product data");
    }

    const newProduct = new Product(productData);
    await newProduct.save();
    return responseUtils.sendJson(response, newProduct, 201);
  } catch (error) {
    return responseUtils.internalServerError(response, error.message);
  }
};

module.exports = { getAllProducts, registerProduct, deleteProduct, viewProduct, updateProduct };
