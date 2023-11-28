const handleRequest = async (request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === "GET" && !filePath.startsWith("/api")) {
    const fileName =
      filePath === "/" || filePath === "" ? "index.html" : filePath;
    return renderPublic(fileName, response);
  }

  if (matchUserId(filePath)) {
    if (!acceptsJson(request)) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

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

    // Handling OPTIONS requests
    if (method.toUpperCase === "OPTIONS") {
      return sendOptions(filePath, response);
    }

    return responseUtils.sendJson(response, user);
  }

  // Default to 404 Not Found if unknown url
  if (!(filePath in allowedMethods)) return responseUtils.notFound(response);

  // See: http://restcookbook.com/HTTP%20Methods/options/
  if (method.toUpperCase() === "OPTIONS")
    return sendOptions(filePath, response);

  // Check for allowable methods
  if (!allowedMethods[filePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }

  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  if (filePath === "/api/products" && method === "GET") {
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

  // GET all users
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

  if (filePath === "/api/orders" && method === "GET") {
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

  // register new user
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

  // register new product
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

  //ORDERs

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

  // register new order
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
