/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async request => {
  // TODO: 8.5 Implement getting current user based on the "Authorization" request header

  // NOTE: You can import two methods which can be useful here: // - getCredentials(request) function from utils/requestUtils.js
  // - getUser(email, password) function from utils/users.js to get the currently logged in user

  const { getCredentials } = require('./requestUtils'); // Import the getCredentials function
  const { getUser } = require('./users'); // Import the getUser function

  const credentials = getCredentials(request);

  if (credentials) {
    const [email, password] = credentials;

    // Check if the user with the provided credentials exists
    const user = getUser(email, password);

    if (user) {
      // User is authenticated, return the user object
      return user;
    }
  }

  // User is not authenticated, return null
  return null;
};

module.exports = { getCurrentUser };