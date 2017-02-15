const security = require('../helpers/security');
const models = require('../models');
const Promise = require('bluebird');
const express = require('express');
const router = express.Router();

// Search for users based on specified criteria
router.get('/', function (req, res, next) {
  let searchParams = req.query;
  let token = req.headers.accesstoken;
  let validationResult = security.validateToken(token);
  
  // If json web token is invalid
  if (!validationResult.success) {
    return res.status(401).json({
      status: 'fail',
      data: {
        message: 'Invalid token.'
      }
    });
  }
  
  // Since we are returning user data, we do extra
  // validation here. A user can only retrieve data
  // about themselves, so there really is no reason
  // for a regular user to be able to perform this
  // search. Consequently, we only proceed if the
  // user is an admin.
  let requestingUser = validationResult.payload.user;
  let roles = requestingUser.roles || [];
  let isAdmin = roles.some(role => role.name === 'admin');
  if (!isAdmin) {
    return res.status(403).json({
      status: 'fail',
      data: {
        message: 'Not authorized to search user data.'
      }
    });
  }
  
  // Retrieve the data and send back JSON
  return models.user.findAll({
    include: [models.role],
    where: [
      `(? IS NULL OR "user"."id" = ?) AND
       (? IS NULL OR "user"."username" LIKE ?) AND
       (? IS NULL OR "user"."must_update_username" = ?) AND
       (? IS NULL OR "user"."must_update_password" = ?) AND
       (? IS NULL OR "user"."created_at" >= ?) AND
       (? IS NULL OR "user"."created_at" <= ?) AND
       (? IS NULL OR "user"."updated_at" >= ?) AND
       (? IS NULL OR "user"."updated_at" <= ?)`,
      searchParams.id, searchParams.id,
      searchParams.username, `%${searchParams.username}%`,
      searchParams.must_update_username, searchParams.must_update_username,
      searchParams.must_update_password, searchParams.must_update_password,
      searchParams.created_at_low, searchParams.created_at_low,
      searchParams.created_at_high, searchParams.created_at_high,
      searchParams.updated_at_low, searchParams.updated_at_low,
      searchParams.updated_at_high, searchParams.updated_at_high
    ],
    order: ['username']
  }).then(function (results) {
    return res.status(200).json({
      status: 'success',
      data: results,
      updatedToken: token
    });
  }).catch(function (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message || err
    });
  });
});

// Retrieve a single user object based on provided userId
// (userId as in auto-incrementing identification number
// not to be confused with username)
router.get('/:userId', function (req, res, next) {
  let userId = req.params.userId;
  let token = req.headers.accesstoken;
  let validationResult = security.validateToken(token);
  
  // If json web token is invalid
  if (!validationResult.success) {
    return res.status(401).json({
      status: 'fail',
      data: {
        message: 'Invalid token.'
      }
    });
  }
  
  // Since we are returning user data, we do extra
  // validation here. A user can only retrieve data
  // about themselves, unless the user is an admin.
  let requestingUser = validationResult.payload.user;
  let roles = requestingUser.roles || [];
  let isAdmin = roles.some(role => role.name === 'admin');
  if (requestingUser.id !== userId && !isAdmin) {
    return res.status(403).json({
      status: 'fail',
      data: {
        message: 'Not authorized to retrieve user data.'
      }
    });
  }
  
  // Retrieve the data and send back JSON
  return models.user.findById(userId, {
    // Join the user's roles
    include: [models.role]
  }).then(function (result) {
    if (result) {
      return res.status(200).json({
        status: 'success',
        data: result.dataValues,
        updatedToken: token
      });
    } else {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: `UserId not found: ${userId}`
        }
      });
    }
  }).catch(function (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message || err
    });
  });
});

// Create a new user
router.put('/', function (req, res, next) {
  let user = models.user.build(req.body);
  
  // Hash and salt the password
  user.password = security.securifyPassword(user.password, user.uuid);
  
  // Save the user, and any associated tables
  return user.save().then(function (result) {
    return user.setRoles((req.body.roles || []).map(function (role) { return models.role.build(role) })).then(function () {
      return models.user.findById(result.dataValues.id, { include: [models.role] });
    });
  }).then(function (user) {
    return res.status(200).json({
      status: 'success',
      data: user.dataValues
    });
  }).catch(function (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message || err
    });
  });
});

// Save update to existing user
router.post('/:userId', function (req, res, next) {
  let userId = req.params.userId;
  let token = req.headers.accesstoken;
  let validationResult = security.validateToken(token);
  
  // If json web token is invalid
  if (!validationResult.success) {
    return res.status(401).json({
      status: 'fail',
      data: {
        message: 'Invalid token.'
      }
    });
  }
  
  // Since we are manipulating user data, we do extra
  // validation here. A user can only manipulate data
  // about themselves, unless the user is an admin.
  let requestingUser = validationResult.payload.user;
  let roles = requestUser.roles || [];
  let isAdmin = roles.some(role => role.name === 'admin');
  if (requestingingUser.username !== username && !isAdmin) {
    return res.status(403).json({
      status: 'fail',
      data: {
        message: 'Not authorized to retrieve user data.'
      }
    });
  }
  
  // Ensure that we are posting to the correct userId
  req.body.id = userId;
  
  // If the password is 20 chars or less, it neeeds
  // to be salted and hashed
  if (req.body.password.length <= 20) {
    req.body.password = security.securifyPassword(req.body.password, req.body.uuid);
  }
  
  // Update the user and any associated tables
  return models.user.findById(userId, { include: [models.role] }).then(function (user) {
    if (user) {
      return Promise.join(
        user.update(req.body),
        user.setRoles((req.body.roles || user.roles).map(function (role) { return role.dataValues ? role : models.role.build(role) }))
      );
    } else {
      return res.status(404).json({
        status: 'fail',
        data: {
          message: `UserId not found: ${userId}`
        }
      });
    }
  }).then(function () {
    return res.status(200).json({
      status: 'success',
      data: req.body,
      updatedToken: token
    });
  }).catch(function (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message || err
    });
  });
});

module.exports = router;
