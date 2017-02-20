const security = require('./helpers/security');
const utils = require('./helpers/utils');

// A middle-ware only function used to validate user authorization
module.exports = function (options) {
  // Option defaults
  if (options === undefined) options = {};
  if (options.requireAnyRole === undefined) options.requireAnyRole = [];
  if (options.requiredRoles === undefined) options.requiredRoles = [];
  if (options.requiredProp === undefined) options.requiredProp = {};
  
  return function (req, res, next) {    
    // Require a valid auth token
    let tokenValidationResult = security.validateToken(req.headers.accesstoken);
    let tokenPayload = tokenValidationResult.tokenPayload;
    
    if (!tokenValidationResult.success) {
      // Not authenticated
      return res.status(401).json({
        status: 'fail',
        data: { message: 'Invalid token.' }
      });
    }
    
    // Optional: Require the user to have specified role/roles.
    let roleValidationResult1 = security.hasAnyRole(tokenValidationResult.tokenPayload.user, options.requireAnyRole);
    let roleValidationResult2 = security.hasRoles(tokenValidationResult.tokenPayload.user, options.requiredRoles);
    
    // Optional: Require that a specified property exist on the request object.
    // Optional: Require the specified property to be equal to a separate specified property from the token payload.
    // Optional: Allow this entire requirement to be overridden if the user contains one or more specified roles.
    let requiredVal = utils.getValueAtPath(tokenPayload, options.requiredProp.tokenComparePath);
    let requiredValOverridden = options.requiredProp.overrideRoles ? security.hasAnyRole(tokenPayload.user, options.requiredProp.overrideRoles) : false;
    let propertyValidationResult = requiredValOverridden || utils.hasPropertyPath(req, options.requiredProp.requestPath, requiredVal);
    
    if (!roleValidationResult1 || !roleValidationResult2 || !propertyValidationResult) {
      // Not authorized
      return res.status(403).json({
        status: 'fail',
        data: { message: 'Not authorized to perform request.' }
      });
    }
    
    // Success
    req.authorizationResult = tokenValidationResult;
    next();
  }
};