const _ = require('lodash');

// Returns true if value is a number or if value is a string with only numeric chars
this.isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

// Returns the property value of an object at given path
this.getValueAtPath = function (obj, propPath) {
  return _.get(obj, propPath);
};

// Returns true if object contains specified property path (requiredVal optional)
this.hasPropertyPath = function (obj, propPath, requiredVal) {
  let propVal = _.get(obj, propPath);
  if (propPath !== undefined && propVal === undefined)
    return false;
  else if (requiredVal !== undefined && JSON.stringify(propVal) !== JSON.stringify(requiredVal))
    return false;
  else
    return true;
};

module.exports = this;
