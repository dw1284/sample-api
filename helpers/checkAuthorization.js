const security = require('./security');

// A middle-ware only function used to validate user authorization
module.exports = function (requiredRoleNames) {
  return function (req, res, next) {
    let token = req.headers.accesstoken;
    let validationResult = security.validateToken(token);
    
    // Handle invalid token scenario
    if (!validationResult.success) {
      return res.status(401).json({
        status: 'fail',
        data: { message: 'Invalid token.' }
      });
    }
    
    // Validate user privileges
    if (requiredRoleNames) {
      if (!security.hasRoles(validationResult.tokenPayload.user, requiredRoleNames)) {
        return res.status(403).json({
          status: 'fail',
          data: { message: 'Not authorized to perform request.' }
        });
      }
    }
    
    req.authorizationResult = validationResult;
    
    next();
  }
};