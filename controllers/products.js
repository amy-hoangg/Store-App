const responseUtils = require('../utils/responseUtils');
const products = require("../products.json");


/**
 * Send all products as JSON
 *
 * @typedef {import('http').ServerResponse} ServerResponse
 * @param {ServerResponse} response the http response
 */
// eslint-disable-next-line require-await
const getAllProducts = async response => {
  return responseUtils.sendJson(response, products, 200);
};

module.exports = { getAllProducts };