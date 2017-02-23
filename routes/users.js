const security = require('../lib/helpers/security');
const checkAuthorization = require('../lib/checkAuthorization');
const handleError = require('../lib/handleError');
const models = require('../models');
const Promise = require('bluebird');
const express = require('express');
const router = express.Router();

// Search for users based on specified criteria
router.get('/',
  checkAuthorization({ requiredRoles: ['admin'] }),
  function (req, res, next) {
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
        req.query.id, req.query.id,
        req.query.username, `%${req.query.username}%`,
        req.query.must_update_username, req.query.must_update_username,
        req.query.must_update_password, req.query.must_update_password,
        req.query.created_at_low, req.query.created_at_low,
        req.query.created_at_high, req.query.created_at_high,
        req.query.updated_at_low, req.query.updated_at_low,
        req.query.updated_at_high, req.query.updated_at_high
      ],
      order: ['username']
    }).then(function (results) {
      return res.status(200).json({
        status: 'success',
        data: results,
        updatedToken: req.authorizationResult.updatedToken
      });
    }).catch(handleError(res));
  }
);

// Retrieve a single user object based on provided userId
router.get('/:userId',
  checkAuthorization({ requiredProp: { requestPath: 'params.userId', tokenComparePath: 'user.id', overrideRoles: ['admin'] } }),
  function (req, res, next) {
    return models.user.findById(req.params.userId, { include: [models.role] }).then(function (result) {
      if (result) {
        return res.status(200).json({
          status: 'success',
          data: result,
          updatedToken: req.authorizationResult.updatedToken
        });
      } else {
        return res.status(404).json({
          status: 'fail',
          data: { message: `UserId not found: ${req.params.userId}` }
        });
      }
    }).catch(handleError(res));
  }
);

// Create a new user
router.put('/', function (req, res, next) {
  req.body.password = security.securifyPassword(req.body.password, req.body.uuid);
  return models.user.create(req.body).then(function (user) {
    return user.setRoles((req.body.roles || []).map(function (role) { return role.id })).then(function () {
      return user.reload({ include: models.role }).then(function () { return user; });
    });
  }).then(function (user) {
    return res.status(200).json({
      status: 'success',
      data: user
    });
  }).catch(handleError(res));
});

// Save update to existing user
router.post('/:userId',
  checkAuthorization({ requiredProp: { requestPath: 'params.userId', tokenComparePath: 'user.id', overrideRoles: ['admin'] } }),
  function (req, res, next) {
    // If the password is 20 chars or less, it needs
    // to be salted and hashed
    if (req.body.password.length <= 20)
      req.body.password = security.securifyPassword(req.body.password, req.body.uuid);
    
    // Update the user and any associated tables
    return models.user.findById(req.params.userId, { include: [models.role] }).then(function (user) {
      if (user) {
        return Promise.join(
          user.update(req.body),
          user.setRoles((req.body.roles || user.roles).map(function (role) { return role.id }))
        ).then(function () {
          return user.reload({ include: models.role }).then(function () { return user; });
        });
      } else {
        return res.status(404).json({
          status: 'fail',
          data: { message: `UserId not found: ${req.params.userId}` }
        });
      }
    }).then(function (user) {
      return res.status(200).json({
        status: 'success',
        data: user,
        updatedToken: req.authorizationResult.updatedToken
      });
    }).catch(handleError(res));
  }
);

// Delete an existing user
router.delete('/:userId',
  checkAuthorization({ requiredProp: { requestPath: 'params.userId', tokenComparePath: 'user.id', overrideRoles: ['admin'] } }),
  function (req, res, next) {
    let userId = req.params.userId;
    let force = req.query.force || false;
    return models.user.destroy({ where: { id: userId }, force: force }).then(function (rowsAffected) {
      if (rowsAffected) {
        return res.status(200).json({
          status: 'success',
          data: { rowsAffected: rowsAffected },
          updatedToken: req.authorizationResult.updatedToken
        });
      } else {
        return res.status(404).json({
          status: 'fail',
          data: { message: `UserId not found: ${userId}` }
        });
      }
    }).catch(handleError(res));
  }
);

module.exports = router;
