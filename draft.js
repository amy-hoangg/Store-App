if (matchOrderId(filePath)) {
    const currentUser = await getCurrentUser(request);
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader || !currentUser) {
      return responseUtils.basicAuthChallenge(response);
    }

    const orderId = filePath.split("/").pop();
    const order = await Order.findById(orderId).exec();

    if (currentUser.role === "customer") {
        return responseUtils.forbidden(response);
      }

    if (!acceptsJson(request)) {
      return responseUtils.contentTypeNotAcceptable(response);
    }

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

    return responseUtils.sendJson(response, order);
  }