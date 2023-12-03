const responseUtils = require("./utils/responseUtils");
const { acceptsJson, isJson, parseBodyJson } = require("./utils/requestUtils");
const { renderPublic } = require("./utils/render");
const { getCurrentUser } = require("./auth/auth");
const User = require("./models/user");
const Product = require("./models/product");
const Order = require("./models/order");

const fs = require("fs");

const {
  getAllProducts,
  registerProduct,
  deleteProduct,
  viewProduct,
  updateProduct,
} = require("./controllers/products");

const {
  getAllUsers,
  registerUser,
  deleteUser,
  viewUser,
  updateUser,
} = require("./controllers/users");

const {
  getAllOrders,
  registerOrder,
  deleteOrder,
  viewOrder,
  updateOrder,
  getUserOrders,
} = require("./controllers/orders");

const allowedMethods = {
  "/api/register": ["POST"],
  "/api/users": ["GET"],
  "/api/users/{userId}": ["GET", "PUT", "DELETE"],
  "/api/products": ["GET", "POST"],
  "/api/products/{productId}": ["GET", "PUT", "DELETE"],
  "/api/orders": ["GET", "POST"],
  "/api/orders/{orderId}": ["GET"],
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response response of the function
 */
const sendOptions = (filePath, response) => {
  if (filePath in allowedMethods) {
    response.writeHead(204, {
      "Access-Control-Allow-Methods": allowedMethods[filePath].join(","),
      "Access-Control-Allow-Headers": "Content-Type,Accept",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Expose-Headers": "Content-Type,Accept",
    });
    return response.end();
  }

  return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix prefix of id component
 * @returns {boolean} true if the url have an id component as its last past
 */
const matchIdRoute = (url, prefix) => {
  const idPattern = "[0-9a-z]{8,24}";
  const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
  return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} true if id is matched
 */
const matchUserId = (url) => {
  return matchIdRoute(url, "users");
};

/**
 * Does the URL match /api/products/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} true if id is matched
 */
const matchProductId = (url) => {
  return matchIdRoute(url, "products");
};

/**
 * Does the URL match /api/orders/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} true if id is matched
 */
const matchOrderId = (url) => {
  return matchIdRoute(url, "orders");
};

const handleRequest = async (request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  if (method.toUpperCase() === "GET" && !filePath.startsWith("/api")) {
    const fileName =
      filePath === "/" || filePath === "" ? "index.html" : filePath;
    return renderPublic(fileName, response);
  }

  if (matchUserId(filePath)) {
    const currentUser = await getCurrentUser(request);
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !currentUser) {
      return responseUtils.basicAuthChallenge(response);
    }

    const userId = filePath.split("/").pop();
    const user = await User.findById(userId).exec();

    if (currentUser.role === "customer") {
      return responseUtils.forbidden(response);
    }

    if (!acceptsJson(request)) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

    if (method.toUpperCase() === "GET") {
      try {
        return await viewUser(response, userId, currentUser);
      } catch (error) {
        return responseUtils.internalServerError(response);
      }
    }

    // Update PUT
    if (method.toUpperCase() === "PUT") {
      const body = await parseBodyJson(request);
      try {
        return await updateUser(response, userId, currentUser, body);
      } catch (error) {
        return responseUtils.internalServerError(response);
      }
    }

    // Delete
    if (method.toUpperCase() === "DELETE") {
      try {
        return await deleteUser(response, userId, currentUser);
      } catch (error) {
        return responseUtils.internalServerError(response);
      }
    }

    // Handling OPTIONS requests
    if (method.toUpperCase === "OPTIONS") {
      return sendOptions(filePath, response);
    }

    return responseUtils.sendJson(response, user);
  }

  if (matchProductId(filePath)) {
    const currentUser = await getCurrentUser(request);
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !currentUser) {
      return responseUtils.basicAuthChallenge(response);
    }

    const productId = filePath.split("/").pop();
    const product = await Product.findById(productId).exec();


    if (!acceptsJson(request)) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

    if (method.toUpperCase() === "GET") {
      try {
        return await viewProduct(response, productId, currentUser);
      } catch (error) {
        return responseUtils.internalServerError(response);
      }
    }

    // Update PUT
    if (method.toUpperCase() === "PUT") {
      if (currentUser.role === "customer") {
        return responseUtils.forbidden(response);
      }
      const body = await parseBodyJson(request);
      try {
        return await updateProduct(response, productId, body);
      } catch (error) {
        return responseUtils.internalServerError(response);
      }
    }

    // Delete
    if (method.toUpperCase() === "DELETE") {
      if (currentUser.role === "customer") {
        return responseUtils.forbidden(response);
      }
      try {
        return await deleteProduct(response, productId);
      } catch (error) {
        return responseUtils.internalServerError(response);
      }
    }

    return responseUtils.sendJson(response, product);
  }

  if (matchOrderId(filePath)) {
    const currentUser = await getCurrentUser(request);
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !currentUser) {
      return responseUtils.basicAuthChallenge(response);
    }

    const orderId = filePath.split("/").pop();
    const order = await Order.findById(orderId).exec();


    if (!acceptsJson(request)) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

    if (method.toUpperCase() === "GET") {
      return await viewOrder(response, orderId, currentUser);
    }

    return responseUtils.sendJson(response, order);
  }

  if (!(filePath in allowedMethods)) {
    return responseUtils.notFound(response);
  }

  if (method.toUpperCase() === "OPTIONS") {
    return sendOptions(filePath, response);
  }

  if (!allowedMethods[filePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }

  if (filePath === "/api/users" && method.toUpperCase() === "GET") {
    if (!acceptsJson(request)) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

    const currentUser = await getCurrentUser(request);
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !currentUser) {
      return responseUtils.basicAuthChallenge(response);
    }

    if (currentUser.role === "customer") {
      return responseUtils.forbidden(response);
    }
    try {
      return await getAllUsers(response);
    } catch (error) {
      return responseUtils.internalServerError(response);
    }
  }

  if (filePath === "/api/products" && method.toUpperCase() === "GET") {
    if (!acceptsJson(request)) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

    const currentUser = await getCurrentUser(request);
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !currentUser) {
      return responseUtils.basicAuthChallenge(response);
    }

    try {
      return await getAllProducts(response);
    } 
    catch (error) {
      return responseUtils.internalServerError(response);
    }
  }

  if (filePath === "/api/orders" && method.toUpperCase() === "GET") {
    if (!acceptsJson(request)) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

    const currentUser = await getCurrentUser(request);
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !currentUser) {
      return responseUtils.basicAuthChallenge(response);
    }
    try {
      if (currentUser.role === 'admin') {
        return await getAllOrders(response);
      }
      if (currentUser.role === 'customer') {
        return await getUserOrders(response, currentUser);
      }
    } 
    catch (error) {
      return responseUtils.internalServerError(response);
    }
  }

  if (filePath === "/api/register" && method.toUpperCase() === "POST") {
    if (!acceptsJson(request)) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

    if (!isJson(request)) {
      return responseUtils.badRequest(
        response,
        "Invalid Content-Type. Expected application/json"
      );
    }

    const body = await parseBodyJson(request);
    try {
      return await registerUser(response, body);
    } catch (error) {
      responseUtils.badRequest(response);
    }
  }

  if (filePath === "/api/products" && method.toUpperCase() === "POST") {
    if (!acceptsJson(request)) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

    const currentUser = await getCurrentUser(request);
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !currentUser) {
      return responseUtils.basicAuthChallenge(response);
    }

    if (currentUser.role === "customer") {
      return responseUtils.forbidden(response);
    }

    if (!isJson(request)) {
      return responseUtils.badRequest(
        response,
        "Invalid Content-Type. Expected application/json"
      );
    }

    const body = await parseBodyJson(request);
    try {
      return await registerProduct(response, body);
    } catch (error) {
      responseUtils.badRequest(response);
    }
  }

  if (filePath === "/api/orders" && method.toUpperCase() === "POST") {
    if (!acceptsJson(request)) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

    const currentUser = await getCurrentUser(request);
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !currentUser) {
      return responseUtils.basicAuthChallenge(response);
    }


    if (!isJson(request)) {
      return responseUtils.badRequest(
        response,
        "Invalid Content-Type. Expected application/json"
      );
    }
    if (currentUser.role === "admin") {
      return responseUtils.forbidden(response);
    }

    const body = await parseBodyJson(request);
    try {
      return await registerOrder(response, currentUser, body);
    } catch (error) {
      responseUtils.badRequest(response);
    }
  }
};

module.exports = { handleRequest };
