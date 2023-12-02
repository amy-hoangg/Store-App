const Product = require('../models/product');
const responseUtils = require('../utils/responseUtils');


/**
 * Send all products as JSON
 *
 * @typedef {import('http').ServerResponse} ServerResponse
 * @param {ServerResponse} response the http response
 */
const getAllProducts = async response => {
  return responseUtils.sendJson(response, await Product.find({}));
};

/**
 * Add new product and send created product back as JSON
 *
 * @typedef {import('http').ServerResponse} ServerResponse
 * @param {ServerResponse} response the http response
 * @param {object} productData JSON data from request body
 */
const registerProduct = async (response, productData) => {
  try {
    const newProduct = new Product({...productData});
    return responseUtils.sendJson(response, await newProduct.save(), 201);
  } catch (error) {
    return responseUtils.badRequest(response, error);
  }
};

/**
 * Delete a product with the given ID.
 *
 * @param {http.ServerResponse} response response of function
 * @param {object} productData JSON data from request body
 */
const deleteProduct = async (response, productID) => {
  const productToDelete = await Product.findOne({ _id : productID }).exec();
  
  if (productToDelete === null) {
    return responseUtils.notFound(response);
  }

  await Product.deleteOne({_id : productID}).exec();
  return responseUtils.sendJson(response, productToDelete);
};

/**
 * 
 * @param {http.ServerResponse} response response of function
 * @param {string} productID id of viewed product
 * @returns return bad-request or informative response
 */
const viewProduct = async (response, productID) => {
  const product = await Product.findOne({ _id : productID}).exec();

  if (product === null) return responseUtils.notFound(response);
  
  return responseUtils.sendJson(response, product);
};

const updateProduct = async (response, productID, productData) => {

  const product = await Product.findOne({ _id : productID}).exec();

  if (product === null) return responseUtils.notFound(response);

  try {
    // if ('name' in productData && (!(productData['name'] instanceof String) || productData['name'].length === 0)) {
    //   return responseUtils.badRequest(response);
    // }

    Object.keys(productData).forEach(key => {
      product[key] = productData[key];
    });
    return responseUtils.sendJson(response, await product.save());
  } catch (error) {
    return responseUtils.badRequest(response, "Invalid request");
  }
};

module.exports = { getAllProducts, registerProduct, deleteProduct, viewProduct, updateProduct };
