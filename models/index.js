// This module gathers up all database models in the
// current directory and loads them into an instance
// of sequelize.
const fs = require('fs');
const path = require('path');
const tier = require('config').get('tier');
const dbConfig = require('config').get(tier).dbConfig;
const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, dbConfig);

// This object will represent our database
const models = {};

// Loop through each file in the current directory
fs.readdirSync(__dirname).filter(function (file) {
  // Skip index.js
  return file.indexOf('.') !== 0 && file !== 'index.js';
}).forEach(function (file) {
  // Load the file into a sequelize model
  let model = sequelize.import(path.join(__dirname, file));
  models[model.name] = model;
});

// Run any class methods that each model may have.
// Class methods do things like create foreign keys
// and relationships between models etc.
Object.keys(models).forEach(function (modelName) {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
});

// Add our instance of sequelize to the db object so that it
// too will be accessible
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;