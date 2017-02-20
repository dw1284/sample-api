const jwt = require('jwt-simple'); // json web token module
const crypto = require('crypto');
const secretWord = 'L@2cXaveT&';

// Hash and salt a password
this.securifyPassword = function (password, salt) {
  let saltedPassword = `${password}${salt}`;
  let hashedSaltedPassword = crypto.createHash('sha1').update(saltedPassword).digest('hex');
  return hashedSaltedPassword;
};

// Create a JSON-Web-Token for a particular user
this.createToken = function (user) {
  let expirationTime = Math.floor(new Date().getTime() / 1000) + (15 * 60); // Update expiration to 15 mins from now
  let payload = {
    'iss': 'sample-api',
    'exp': expirationTime,
    'user': {
      'username': user.username,
      'roles': user.roles || []
    }
  };
  let token = jwt.encode(payload, secretWord);
  return token;
};

// Validate that a string is a valid, non-expired JSON-Web-Token
this.validateToken = function (token) {
  try {
    // This decoding will fail into the catch blockif token is
    // expired or otherwise invalid as well
    let payload = jwt.decode(token, secretWord);
    payload.exp = Math.floor(new Date().getTime() / 1000) + (15 * 60); // Update expiration to 15 mins from now
    let updatedToken = jwt.encode(payload, secretWord);
    return {
      success: true,
      tokenPayload: payload,
      updatedToken: updatedToken
    };
  } catch (err) {
    return {
      success: false,
      message: `Token validation failed: ${err.message}`
    };
  }
};

// Update a token's expiration date
this.refreshToken = function (token) {
  let payload = jwt.decode(token, secretWord);
  payload.exp = Math.floor(new Date().getTime() / 1000) + (15 * 60); // Update expiration to 15 mins from now
  return jwt.encode(payload, secretWord);
};

// Returns true if user has all specified roles
this.hasRoles = function (user, requiredRoleNames) {
  let userRoles = user.roles || [];
  return requiredRoleNames.every(
    requiredRoleName => userRoles.filter(
      userRole => userRole.name === requiredRoleName
    ).length > 0
  );
};

// Returns true if user has at least one of specified roles
this.hasAnyRole = function (user, roleNames) {
  let userRoles = user.roles || [];
  return roleNames.length === 0 || roleNames.some(
    roleName => userRoles.filter(
      userRole => userRole.name === roleName
    ).length > 0
  );
};

module.exports = this;
