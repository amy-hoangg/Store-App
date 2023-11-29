const Product = require('../models/product');
const responseUtils = require('../utils/responseUtils');

const getAllProducts = async (response) => {
    const products = await Product.find({});
    return responseUtils.sendJson(response, products);
};

const deleteProduct = async (response, productId, currentUser) => {
    const product = await Product.findById(productId).exec();

    if (!product) {
      return responseUtils.notFound(response);
    }

    const productToDelete = await Product.findByIdAndDelete(productId);
    return responseUtils.sendJson(response, productToDelete);
};

const updateProduct = async (response, productId, currentUser, productData) => {
    const product = await Product.findById(productId).exec();
    
    if (currentUser.role === "customer") {
      return responseUtils.forbidden(response);
    }

    if (!product) {
      return responseUtils.notFound(response);
    }

    if (currentUser._id.equals(productId)) {
      return responseUtils.badRequest(response, "Updating own data is not allowed");
    }

    if (!productData.name || !productData.price || !productData.image || !productData.description) {
      return responseUtils.badRequest(response, "Incomplete product data");
    }

    product.name = productData.name;
    product.price = productData.price;
    product.image = productData.image;
    product.description = productData.description;

    await product.save();
    return responseUtils.sendJson(response, product);
};

const viewProduct = async (response, productId) => {
    const product = await Product.findById(productId).exec();

    if (!product) {
      return responseUtils.notFound(response);
    }
    return responseUtils.sendJson(response, product);
};

const registerProduct = async (response, productData) => {
    if (!productData.name || !productData.price || !productData.image || !productData.description) {
      return responseUtils.badRequest(response, "Incomplete product data");
    }

    const newProduct = new Product(productData);
    await newProduct.save();
    return responseUtils.sendJson(response, newProduct, 201);
};

module.exports = { getAllProducts, registerProduct, deleteProduct, viewProduct, updateProduct };
