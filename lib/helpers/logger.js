const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const dateFormat = require('dateformat');
const endOfLine = require('os').EOL;
const tier = require('config').get('tier');
const logConfig = require('config').get(`${tier}.logConfig`);

this.log = function (message, includeTimestamp = true) {
  let now = dateFormat(new Date(), 'mm/dd/yyyy hh:MM:ss TT');
  let logEntry = `${message}${endOfLine}`;
  if (includeTimestamp)
    logEntry = `${now}: ${logEntry}` 
  
  return Promise.resolve(function () {
    // Output to file
    if (logConfig.writeToFile) {
      return logToFile(logConfig.filepath, logEntry, logConfig.fileMaxKilobytes);
    }
  }()).then(function () {
    // Output to console
    if (logConfig.writeToConsole) {
      console.log(logEntry);
    }
  });
};

module.exports = this;

// Private helpers
function logToFile(path, msg, maxSize = 0) {
  return fs.statAsync(path).then(function (stats) {
    // Delete log if it gets too big
    if (maxSize && stats.size >= maxSize) {
      return fs.unlinkAsync(path);
    }
  }).then(function () {
    // Append by default, if file doesn't exist it will be created
    return fs.appendFileAsync(path, msg);
  }).catch(function (err) {
    // Handle file not exists error by writing to a new file
    if (err.code === 'ENOENT') {
      return fs.writeFileAsync(path, msg);
    } else {
      // Since we can't write to files apparently, all we can do is console.log()
      console.log(err);
    }
  });
};
