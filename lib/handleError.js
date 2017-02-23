const logger = require('./helpers/logger');

// Standardizes the error handling process
module.exports = function (res) {
  return function (err) {    
    return logger.log(err).then(function () {
      return res.status(500).json({
        status: 'error',
        data: { message: err.message || err }
      });
    });
  }
};