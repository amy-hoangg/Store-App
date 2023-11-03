/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
const responseUtils = require("./utils/responseUtils");
const { acceptsJson, isJson, parseBodyJson } = require("./utils/requestUtils");
const { renderPublic } = require("./utils/render");
const {
  emailInUse,
  getAllUsers,
  saveNewUser,
  validateUser,
  deleteUserById,
  getUserById,
  updateUserRole,
} = require("./utils/users");
const { getCurrentUser } = require("./auth/auth");

const fs = require("fs");
const products  = require("./products.json");

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  "/api/register": ["POST"],
  "/api/users": ["GET"],
  "/api/products": ["GET"],
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

const handleRequest = async (request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === "GET" && !filePath.startsWith("/api")) {
    const fileName =
      filePath === "/" || filePath === "" ? "index.html" : filePath;
    return renderPublic(fileName, response);
  }
  
  if (filePath === '/api/products' && method === 'GET') {
    // Handle the GET request for /api/products here

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

    if (!request.headers.accept || !acceptsJson(request)) {
      // The client does not have an "Accept" header or does not accept JSON,
      // so respond with 406 Not Acceptable
      return responseUtils.contentTypeNotAcceptable(response);
    }

    // Send the contents of products as a JSON response
    return responseUtils.sendJson(response, products);
  }

  if (matchUserId(filePath)) {
    // TODO: 8.6 Implement view, update and delete a single user by ID (GET, PUT, DELETE)
    // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
    // If the HTTP method of a request is OPTIONS you can use sendOptions(filePath, response) function from this module
    // If there is no currently logged in user, you can use basicAuthChallenge(response) from /utils/responseUtils.js to ask for credentials
    //  If the current user's role is not admin you can use forbidden(response) from /utils/responseUtils.js to send a reply
    // Useful methods here include:
    // - getUserById(userId) from /utils/users.js
    // - notFound(response) from  /utils/responseUtils.js
    // - sendJson(response,  payload)  from  /utils/responseUtils.js can be used to send the requested data in JSON format
    // throw new Error("Not Implemented");

    // View GET
    const userId = filePath.split("/").pop();
    const user = getUserById(userId);

    if (method.toUpperCase() === "GET") {
      const authorizationHeader = request.headers.authorization;
      const currentUser = await getCurrentUser(request);
      if (!authorizationHeader || !currentUser) {
        return responseUtils.basicAuthChallenge(response);
      }
      if (currentUser.role === "customer") {
        return responseUtils.forbidden(response);
      }

      if (!user) {
        return responseUtils.notFound(response);
      }

      return responseUtils.sendJson(response, user);
    }

    // Update PUT
    if (method.toUpperCase() === "PUT") {
      const authorizationHeader = request.headers.authorization;
      const currentUser = await getCurrentUser(request);
    
      if (!authorizationHeader || !currentUser) {
        return responseUtils.basicAuthChallenge(response);
      }
    
      if (currentUser.role !== "admin") {
        return responseUtils.forbidden(response);
      }
    
      if (!user) {
        return responseUtils.notFound(response);
      }
    
      // Parse the request body to get the updated role
      try {
        const body = await parseBodyJson(request);
        if (!body.role) {
          // Handle the case when role is missing
          return responseUtils.badRequest(response, "Role is missing");
        }
    
        // Update the user's role
        try {
          const updatedUser = updateUserRole(userId, body.role);
    
          if (updatedUser) {
            return responseUtils.sendJson(response, updatedUser);
          } else {
            return responseUtils.internalServerError(response);
          }
        } catch (error) {
          // Handle the "Unknown role" error here
          return responseUtils.badRequest(response, "Unknown role");
        }
      } catch (error) {
        return responseUtils.internalServerError(response, error.message);
      }
    }
    
    

    // Delete
    if (method.toUpperCase() === "DELETE") {
      const authorizationHeader = request.headers.authorization;
      const currentUser = await getCurrentUser(request);
      if (!authorizationHeader || !currentUser) {
        return responseUtils.basicAuthChallenge(response);
      }
      if (currentUser.role === "customer") {
        return responseUtils.forbidden(response);
      }

      if (!user) {
        return responseUtils.notFound(response);
      }

      else
      {
      // Delete the user and get the deleted user
      const deletedUser = deleteUserById(userId);

      if (deletedUser) {
        return responseUtils.sendJson(response, deletedUser);
      }
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

  // GET all users
  if (filePath === "/api/users" && method.toUpperCase() === "GET") {
    // TODO: 8.5 Add authentication (only allowed to users with role "admin")
    const authorizationHeader = request.headers.authorization;
    const user = await getCurrentUser(request);

    if (!authorizationHeader || !user) {
      return responseUtils.basicAuthChallenge(response);
    }

    if (user.role === "customer") {
      return responseUtils.forbidden(response);
    }

    return responseUtils.sendJson(response, getAllUsers());
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

    // TODO: 8.4 Implement registration
    // You can use parseBodyJson(request) method from utils/requestUtils.js to parse request body.
    // Useful methods here include:
    // - validateUser(user) from /utils/users.js
    // - emailInUse(user.email) from /utils/users.js
    // - badRequest(response, message) from /utils/responseUtils.js
    const body = await parseBodyJson(request);
    const validationErrors = validateUser(body);

    if (validationErrors.length > 0) {
      return responseUtils.badRequest(response, validationErrors.join(", "));
    }

    if (emailInUse(body.email)) {
      return responseUtils.badRequest(response, "Email already in use");
    }

    const newUser = saveNewUser(body);
    responseUtils.sendJson(response, newUser, 201);
  }
};

module.exports = { handleRequest };
