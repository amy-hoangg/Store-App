const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Get database connect URL.
 *
 * Returns the MongoDB connection URL
 *  from DBURL environment variable,
 * or if the environment variable is not defined, 
 * return the default URL
 * mongodb://localhost:27017/WebShopDb
 *
 * @returns {string} connection URL
 */
const getDbUrl = () => {
  // TODO: 9.4 Implement this
  // Check if the DBURL environment variable is defined
  if (process.env.DBURL) {
    // If defined, return the value from the environment variable
    return process.env.DBURL;
  } else {
    // If not defined, return the default URL
    return 'mongodb://localhost:27017/WebShopDb';
  }
};

function connectDB() {
  // Do nothing if already connected
  if (!mongoose.connection || mongoose.connection.readyState === 0) {
    mongoose
      .connect(getDbUrl(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: true
      })
      .then(() => {
        mongoose.connection.on('error', err => {
          console.error(err);
        });

        mongoose.connection.on('reconnectFailed', handleCriticalError);
      })
      .catch(handleCriticalError);
  }
}

function handleCriticalError(err) {
  console.error(err);
  throw err;
}

function disconnectDB() {
  mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB, getDbUrl };