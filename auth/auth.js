const requestUtils = require('../utils/requestUtils');
const {getUser} = require('../utils/users');
/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async request => {
  // TODO: 8.5 Implement getting current user based on the "Authorization" 
  // request header

  // NOTE: You can import two methods which can be useful here: // - getCredentials(request) function from utils/requestUtils.js
  // - getUser(email, password) function from utils/users.js to get the currently logged in user


  const credentials = requestUtils.getCredentials(request);

  if (credentials) {
    const [username, password] = credentials;

    // Call the getUser function to get the currently logged in user
    const currentUser = getUser(username, password);

    if (currentUser) {
      return currentUser;
    }
  }
  return null;
};

module.exports = { getCurrentUser };