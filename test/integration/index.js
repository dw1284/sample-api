const security = require('../../helpers/security');
const Promise = require('bluebird');

process.testing = true;

// Set up some globals which can be used in each test file
global.server = require('../../app');
global.models = require('../../models');
global.authToken = '' // This gets set after we save our testUser;
global.testUser = global.models.user.build({
  username: 'TestUser',
  password: security.securifyPassword('TestPassword', '7b0a0820-f1d2-11e6-a299-35c97126b6fc'),
  uuid: '7b0a0820-f1d2-11e6-a299-35c97126b6fc'
  // Admin role gets set when we save
});

// We do not want to see sequelize query output
// when running these tests. Set logging to false.
global.models.sequelize.options.logging = false;

// Set up our test environment
before(function (done) {
  global.server.on('serverStarted', function () {
    return Promise.join(
      global.testUser.save().then(function () {
        return global.testUser.setRoles([1]).then(function () {
          return global.testUser.reload({ include: models.role }).then(function () {
            global.authToken = security.createToken(global.testUser);
          });
        });
      })
    ).then(function () {
      done();
    }).catch(function (err) {
      done(err);
    });
  });
});

// Tear down our test environment
after(function () {
  // Cleanup database
  return Promise.join(
    global.testUser.destroy({ force: true })
  ).catch(function (err) {
    console.log(err);
  });
});