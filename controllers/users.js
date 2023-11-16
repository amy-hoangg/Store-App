const User = require('../models/user');
const responseUtils = require('../utils/responseUtils');
/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllUsers = async (response) => {
  // TODO: 10.2 Implement this
  //throw new Error('Not Implemented');
  const users = await User.find({});
  return responseUtils.sendJson(response, users);
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const deleteUser = async(response, userId, currentUser) => {
  // TODO: 10.2 Implement this
  // throw new Error('Not Implemented');

  const user = await User.findById(userId).exec();

  if (currentUser._id.equals(userId)) {
    return responseUtils.badRequest(response, "Cannot delete your own data");
  }
  if (!user) {
    return responseUtils.notFound(response);
  }

  else
  {
  const userToDelete = await User.findById(userId);
  const deletedUser = await User.deleteOne({ _id: userId });

  if (deletedUser) {
    return responseUtils.sendJson(response, userToDelete);
  }
  }
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 * @param {Object} userData JSON data from request body
 */
const updateUser = async(response, userId, currentUser, userData) => {
  // TODO: 10.2 Implement this
  // throw new Error('Not Implemented');
  const user = await User.findById(userId).exec(); 
    
  if (!user) {
    return responseUtils.notFound(response);
  }
  // Check if the user is trying to update their own data
  if (currentUser._id.equals(userId)) {
    return responseUtils.badRequest(
      response,
      "Updating own data is not allowed"
    );
  }  
  // Parse the request body to get the updated role
  try {
    if (!userData.role) {
      // Handle the case when role is missing
      return responseUtils.badRequest(response, "Role is missing");
    }
    
    // Update the user's role
    try {
      user.role = userData.role;
      await user.save();
          
      if (user) {
        return responseUtils.sendJson(response, user);
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
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const viewUser = async(response, userId, currentUser) => {
  // TODO: 10.2 Implement this
  // throw new Error('Not Implemented');
  const user = await User.findById(userId).exec();
    if (currentUser.role === "customer") {
      return responseUtils.forbidden(response);
    }

    if (!user) {
      return responseUtils.notFound(response);
    }

    return responseUtils.sendJson(response, user);
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response
 * @param {Object} userData JSON data from request body
 */
// eslint-disable-next-line complexity
const registerUser = async(response, userData) => {
  // TODO: 10.2 Implement this
  // throw new Error('Not Implemented');

  const isValidEmail = (email) => {
    // Regular expression for a basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const errors = [];
  const emailUser = await User.findOne({email: userData.email}).exec();
  const data = {
    roles: ['customer', 'admin']
  };

  if (!userData.name) errors.push('Missing name');
  if (!userData.email) errors.push('Missing email');
  if (!isValidEmail(userData.email)) errors.push('Invalid email format');
  if (!userData.password) errors.push('Missing password');
  if (userData.password && userData.password.length < 10) errors.push('Password is too short (minimum length: 10)');
  if (userData.role && !data.roles.includes(userData.role)) errors.push('Unknown role');


  if (errors.length > 0) {
    return responseUtils.badRequest(response, errors.join(", "));
  }

  if (emailUser) {
    return responseUtils.badRequest(response, "Email already in use");
  }

  const newUser = new User(userData);
  newUser.role = 'customer';
  await newUser.save();
  return responseUtils.sendJson(response, newUser, 201);
  
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };