const responseUtils = require('./utils/responseUtils');
const { getCurrentUser } = require("./auth/auth");
const products = require("./products.json");

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllProducts = async (request, response) => {
  // TODO: 10.2 Implement this
  // throw new Error('Not Implemented');
  const authorizationHeader = request.headers.authorization;
    const currentUser = await getCurrentUser(request);

    if (!authorizationHeader || !currentUser) {
      // Send Basic Authentication challenge
      return responseUtils.basicAuthChallenge(response);
    }

    // Check if the user has either admin or customer role
    if (currentUser.role !== 'admin' && currentUser.role !== 'customer') {
      return responseUtils.forbidden(response);
    }

    return responseUtils.sendJson(response, products, 200);
};

module.exports = { getAllProducts };