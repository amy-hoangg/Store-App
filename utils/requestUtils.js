/**
 * Decode, parse and return user credentials (username and password)
 * from the Authorization header.
 *
 * @param {http.incomingMessage} request request from client
 * @returns {Array|null} array [username, password] from Authorization header, or null if header is missing
 */
const getCredentials = request => {
  // TODO: 8.5 Parse user credentials from the "Authorization" request header
  // NOTE: The header is base64 encoded as required by the http standard.
  //       You need to first decode the header back to its original form ("email:password").
  //  See: https://attacomsian.com/blog/nodejs-base64-encode-decode
  //       https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/
  // Get the "Authorization" header from the request
  const authorizationHeader = request.headers.authorization;

  // Check if the header exists and starts with "Basic "
  if (authorizationHeader && authorizationHeader.startsWith("Basic ")) {
    // Remove "Basic " from the header to get the base64-encoded credentials
    const base64Credentials = authorizationHeader.substr("Basic ".length);

    // Decode the base64-encoded credentials
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');

    // Split the credentials into username and password
    const [username, password] = credentials.split(':');

    return [ username, password ];
  }

  return null;
};

/**
 * Does the client accept JSON responses?
 *
 * @param {http.incomingMessage} request request from client
 * @returns {boolean} true if the client accepts JSON response
 */
const acceptsJson = request => {
  //Check if the client accepts JSON as a response based on "Accept" request header
  // NOTE: "Accept" header format allows several comma separated values simultaneously
  // as in "text/html,application/xhtml+xml,application/json,application/xml;q=0.9,*/*;q=0.8"
  // Do not rely on the header value containing only single content type!
  const acceptHeader = request.headers.accept || '';
  return acceptHeader.includes('application/json') || acceptHeader.includes('*/*');
};

/**
 * Is the client request content type JSON? Return true if it is.
 *
 * @param {http.incomingMessage} request request from client
 * @returns {boolean} true if client request is json
 */
const isJson = request => {
  // TODO: 8.4 Check whether request "Content-Type" is JSON or not
  const contentType = request.headers['content-type'];

  if (contentType) {
    return contentType.toLowerCase().includes('application/json');
  }

  return false;
};

/**
 * Asynchronously parse request body to JSON
 *
 * Remember that an async function always returns a Promise which
 * needs to be awaited or handled with then() as in:
 *
 *   const json = await parseBodyJson(request);
 *
 *   -- OR --
 *
 *   parseBodyJson(request).then(json => {
 *     // Do something with the json
 *   })
 *
 * @param {http.IncomingMessage} request request of client
 * @returns {Promise<*>} Promise resolves to JSON content of the body
 */
const parseBodyJson = request => {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('error', err => reject(err));

    request.on('data', chunk => {
      body += chunk.toString();
    });

    request.on('end', () => {
      resolve(JSON.parse(body));
    });
  });
};

module.exports = { acceptsJson, getCredentials, isJson, parseBodyJson };