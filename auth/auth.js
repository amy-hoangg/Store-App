const requestUtils = require('../utils/requestUtils');
const User = require('../models/user');
/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
// eslint-disable-next-line require-await
const getCurrentUser = async request => {
  // TODO: 8.5 Implement getting current user based on the "Authorization" 
  // request header

  // NOTE: You can import two methods which can be useful here: // - getCredentials(request) function from utils/requestUtils.js
  // - getUser(email, password) function from utils/users.js to get the currently logged in user
  const credentials = requestUtils.getCredentials(request);

  // 9.6: if no credentials are found, return null
  if (!credentials) {
    return null;
  }

  if (credentials) {
    const [email, password] = credentials;

    // Call the getUser function to get the currently logged in user
    const currentUser = await User.findOne(email);
    

    if (currentUser && await currentUser.checkPassword(password)) {
      return currentUser.toObject();
    }
    if (!currentUser) {
      return null;
    }
  }
  return null;
};

module.exports = { getCurrentUser };