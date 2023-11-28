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
} = require("./controllers/orders");

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
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
 * @param {http.ServerResponse} response
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
 * @param {string} prefix
 * @returns {boolean}
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
 * @returns {boolean}
 */
const matchUserId = (url) => {
  return matchIdRoute(url, "users");
};

const matchProductId = (url) => {
  return matchIdRoute(url, "products");
};

const matchOrderId = (url) => {
  return matchIdRoute(url, "orders");
};

const handleGetRequest = async (filePath, method, headers, request, response) => {
  // Handle GET requests
};

const handlePostRequest = async (filePath, method, headers, request, response) => {
  // Handle POST requests
};

const handlePutRequest = async (filePath, method, headers, request, response) => {
  // Handle POST requests
};

const handleDeleteRequest = async (filePath, method, headers, request, response) => {
  // Handle POST requests
};

const handleOptionsRequest = async (filePath, method, headers, request, response) => {
  // Handle POST requests
};

const handleRequest = async (request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  if (!(filePath in allowedMethods)) {
    return responseUtils.notFound(response);
  }

  if (method.toUpperCase() === "GET" && !filePath.startsWith("/api")) {
    const fileName =
      filePath === "/" || filePath === "" ? "index.html" : filePath;
    return renderPublic(fileName, response);
  }

  if (!allowedMethods[filePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }

  if (method.toUpperCase() === "OPTIONS") {
    return sendOptions(filePath, response);
  }
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  if (matchUserId(filePath)) {
    // View GET
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

    return responseUtils.sendJson(response, user);
  }

  if (filePath === "/api/products" && method.toUpperCase() === "GET") {
    // Handle the GET request for /api/products here
    // Check if the user has either admin or customer role
    const currentUser = await getCurrentUser(request);
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !currentUser) {
      return responseUtils.basicAuthChallenge(response);
    }

    if (currentUser.role !== "admin" && currentUser.role !== "customer") {
      return responseUtils.forbidden(response);
    }
    try {
      return await getAllProducts(response);
    } catch (error) {
      return responseUtils.internalServerError(response);
    }
  }

  if (filePath === "/api/users" && method.toUpperCase() === "GET") {
    // TODO: 8.5 Add authentication (only allowed to users with role "admin")
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

  if (filePath === "/api/orders" && method.toUpperCase() === "GET") {
    // Handle the GET request for /api/orders here
    // Check if the order has either admin or customer role
    const currentOrder = await getCurrentOrder(request);
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !currentOrder) {
      return responseUtils.basicAuthChallenge(response);
    }

    if (currentOrder.role !== "admin" && currentOrder.role !== "customer") {
      return responseUtils.forbidden(response);
    }
    try {
      return await getAllOrders(response);
    } catch (error) {
      return responseUtils.internalServerError(response);
    }
  }

  if (filePath === "/api/register" && method.toUpperCase() === "POST") {
    // Fail if not a JSON request, don't allow non-JSON Content-Type
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

  if (matchProductId(filePath)) {
    // View GET
    const currentProduct = await getCurrentProduct(request);
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || !currentProduct) {
      return responseUtils.basicAuthChallenge(response);
    }

    const productId = filePath.split("/").pop();
    const product = await Product.findById(productId).exec();

    if (method.toUpperCase() === "GET") {
      try {
        return await viewProduct(response, productId, currentProduct);
      } catch (error) {
        return responseUtils.internalServerError(response);
      }
    }

    // Update PUT
    if (method.toUpperCase() === "PUT") {
      const body = await parseBodyJson(request);
      try {
        return await updateProduct(response, productId, currentProduct, body);
      } catch (error) {
        return responseUtils.internalServerError(response);
      }
    }

    // Delete
    if (method.toUpperCase() === "DELETE") {
      try {
        return await deleteProduct(response, productId, currentProduct);
      } catch (error) {
        return responseUtils.internalServerError(response);
      }
    }

    // Handling OPTIONS requests
    if (method.toUpperCase === "OPTIONS") {
      return sendOptions(filePath, response);
    }

    return responseUtils.sendJson(response, product);
  }

  if (filePath === "/api/products" && method.toUpperCase() === "POST") {
    // Fail if not a JSON request, don't allow non-JSON Content-Type
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

  if (matchOrderId(filePath)) {
    // View GET
    const currentOrder = await getCurrentOrder(request);
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || !currentOrder) {
      return responseUtils.basicAuthChallenge(response);
    }

    const orderId = filePath.split("/").pop();
    const order = await Order.findById(orderId).exec();

    if (method.toUpperCase() === "GET") {
      try {
        return await viewOrder(response, orderId, currentOrder);
      } catch (error) {
        return responseUtils.internalServerError(response);
      }
    }

    // Update PUT
    if (method.toUpperCase() === "PUT") {
      const body = await parseBodyJson(request);
      try {
        return await updateOrder(response, orderId, currentOrder, body);
      } catch (error) {
        return responseUtils.internalServerError(response);
      }
    }

    // Delete
    if (method.toUpperCase() === "DELETE") {
      try {
        return await deleteOrder(response, orderId, currentOrder);
      } catch (error) {
        return responseUtils.internalServerError(response);
      }
    }

    // Handling OPTIONS requests
    if (method.toUpperCase === "OPTIONS") {
      return sendOptions(filePath, response);
    }

    return responseUtils.sendJson(response, order);
  }

  if (filePath === "/api/orders" && method.toUpperCase() === "POST") {
    // Fail if not a JSON request, don't allow non-JSON Content-Type
    if (!isJson(request)) {
      return responseUtils.badRequest(
        response,
        "Invalid Content-Type. Expected application/json"
      );
    }

    const body = await parseBodyJson(request);
    try {
      return await registerOrder(response, body);
    } catch (error) {
      responseUtils.badRequest(response);
    }
  }
};

module.exports = { handleRequest };
