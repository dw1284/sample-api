const security = require('../lib/helpers/security');
const models = require('../models');
const express = require('express');
const router = express.Router();

// Executes whenever a request is received for authentication
router.post('/', function (req, res, next) {
  let caller = req.headers.caller;
  let username = req.body.username;
  let password = req.body.password;

  // First, retrieve the specified user from the DB
  return models.user.findOne({
    where: { username: username }
  }, {
    // Join the user's roles
    include: [models.role]
  }).then(function (user) {
    if (user) {
      let hashedSaltedPassword = security.securifyPassword(password, user.uuid);
      // Validate that the user supplied the correct password
      if (user.password === hashedSaltedPassword) {
        // Success: Create a token and send a success response
        let token = security.createToken(user, caller);
        return res.status(200).json({
          status: 'success',
          data: { 
            user: user,
            accessToken: token
          }
        });
      }
    }
    
    // If we make it this far, it means that authentication failed
    // either due to invalid username or password. NOTE: We don't
    // supply the reason because that would give hackers an advantage.
    return res.status(401).json({
      status: 'fail',
      data: {
        message: `Authentication failed.`
      }
    });
  }).catch(function (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message || err
    });
  });
});

module.exports = router;
