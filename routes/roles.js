const checkAuthorization = require('../lib/checkAuthorization');
const handleError = require('../lib/handleError');
const models = require('../models');
const Promise = require('bluebird');
const express = require('express');
const router = express.Router();

// Search for roles based on specified criteria
router.get('/',
  checkAuthorization(),
  function (req, res, next) {
    return models.role.findAll({
      where: [
        `(? IS NULL OR "role"."id" = ?) AND
         (? IS NULL OR "role"."name" LIKE ?)`,
        req.query.id, req.query.id,
        req.query.name, `%${req.query.name}%`
      ],
      order: ['name']
    }).then(function (results) {
      return res.status(200).json({
        status: 'success',
        data: results,
        updatedToken: req.authorizationResult.updatedToken
      });
    }).catch(handleError(res));
  }
);

// Retrieve a single role object based on provided roleId
router.get('/:roleId',
  checkAuthorization(),
  function (req, res, next) {
    return models.role.findById(req.params.roleId).then(function (result) {
      if (result) {
        return res.status(200).json({
          status: 'success',
          data: result,
          updatedToken: req.authorizationResult.updatedToken
        });
      } else {
        return res.status(404).json({
          status: 'fail',
          data: { message: `RoleId not found: ${req.params.roleId}` }
        });
      }
    }).catch(handleError(res));
  }
);

// Create a new role
router.put('/',
  checkAuthorization({ requiredRoles: ['admin'] }),
  function (req, res, next) {
    return models.role.create(req.body).then(function (result) {
      return res.status(200).json({
        status: 'success',
        data: result
      });
    }).catch(handleError(res));
  }
);

// Save update to existing role
router.post('/:roleId',
  checkAuthorization({ requiredRoles: ['admin'] }),
  function (req, res, next) {
    return models.role.findById(req.params.roleId).then(function (role) {
      if (role) {
        return role.update(req.body);
      } else {
        return res.status(404).json({
          status: 'fail',
          data: { message: `RoleId not found: ${req.params.roleId}` }
        });
      }
    }).then(function (result) {
      return res.status(200).json({
        status: 'success',
        data: result,
        updatedToken: req.authorizationResult.updatedToken
      });
    }).catch(handleError(res));
  }
);

// Delete an existing role
router.delete('/:roleId',
  checkAuthorization({ requiredRoles: ['admin'] }),
  function (req, res, next) {
    let roleId = req.params.roleId;
    let force = req.query.force || false;
    
    // Delete the role from the DB
    return models.role.destroy({ where: { id: roleId }, force: force }).then(function (rowsAffected) {
      if (rowsAffected) {
        return res.status(200).json({
          status: 'success',
          data: { rowsAffected: rowsAffected },
          updatedToken: req.authorizationResult.updatedToken
        });
      } else {
        return res.status(404).json({
          status: 'fail',
          data: { message: `RoleId not found: ${roleId}` }
        });
      }
    }).catch(handleError(res));
  }
);

module.exports = router;
