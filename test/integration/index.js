// NOTE: This will be the first file to execute during a test.
//       We will set up a test environment which will stand
//       throughout the duration of the tests. At the very end
//       the test environment will be cleaned up.

// Set up some globals which can be used in each test file
global.Promise = require('bluebird');
global.models = require('../../models');
// This test user will exist from beginning to end and be used throughout the entire testing suite
global.testUser = {
  username: 'TestUser',
  password: '387bc09af516a1a77f9b9b4272f38e88739e3c36',
  uuid: '7b0a0820-f1d2-11e6-a299-35c97126b6fc'
};
// This dummy user will only exist briefly and will be used to test insert/delete operations
global.dummyUser = {
  username: 'DummyUser',
  password: 'DummyPassword',
  roles: [{ id: 1, name: 'admin' }]
};
global.authToken = "";

// We do not want to see sequelize query output
// when running these tests. Set logging to false.
global.models.sequelize.options.logging = false;

// Set up our test environment
before(function () {
  // Insert some objects in the database
  return Promise.join(
    // Insert our test user which will persist throughout all tests
    Promise.all([
      models.user.findOrCreate({ where: global.testUser, include: [models.role] }),
      models.role.findById(1)
    ]).spread(function (user, role) {
      global.testUser = user[0];
      if (user[1]) {
        global.testUser.roles = [role];
        return global.testUser.setRoles([role]);
      }
    })
  ).then(function () {
    // Create an auth token that we can use for the tests
    global.authToken = require('../../helpers/security').createToken(global.testUser);
  }).catch(function (err) {
    console.log(err);
  });
});

// Tear down our test environment
after(function () {
  // Cleanup database
  return Promise.all(
    global.testUser.destroy({ force: true })
  ).catch(function (err) {
    console.log(err);
  });
});