// Dependent modules
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const tier = require('config').get('tier');
const config = require('config').get(tier);
const models = require('./models');

// Initialize an instance of expressjs
const app = express();

// Load middleware that will execute on each request
if (tier === 'development' && !process.testing) {
  app.use(logger('dev'));
}
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());

// Load routes
app.use('/authenticate', require('./routes/authenticate'));
app.use('/users', require('./routes/users'));

// Default route (if no route provided in url)
// NOTE: This route gets used by some front end apps to
// 'wake up' a sleeping server. In order to fully accomplish
// that, we also need to 'wake up' the database server, so
// we go ahead and hit the database here as well.
app.use('/', function (req, res) {
  // Do a database hit just to wake up the DB.
  // This will return nothing, but it will succeed
  // in waking up a sleeping database.
  models.user.findAll({
    where: { id: 0 }
  }).then(function () {
    res.send('Sample Api');
  });
});

// Let sequelize create database objects before starting server
models.sequelize.sync().then(function () {  
  // How we start listening will depend on whether we are in development or not
  if (tier === 'development') {
    // For development, run on port 3000
    app.listen(3000, function () {
      if (!process.testing) { // Avoid unnecessary log output when unit testing
        console.log('Example app listening on port 3000!');
      }
    });
  } else {
    // Otherwise, let the host provide the port
    app.listen(process.env.PORT);
  }
  app.emit('serverStarted');
}).catch(function (err) {
  console.log(err);
});

module.exports = app;
