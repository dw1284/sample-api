const Promise = require('bluebird');
const EOL = require('os').EOL;
const chai = require('chai');
const should = chai.should();
const proxyquire = require('proxyquire');

// We will inject our own test functions into the fs module here
let fsStub = {
  stat: function (file, callback) {
    if (file) {
      callback(null, { size: file.size });
    } else {
      callback({ code: 'ENOENT' });
    }
  },
  unlink: function (file, callback) {
    // Simulate a delete
    file.size = 0;
    file.lines = [];
    callback();
  },
  appendFile: function (file, msg, callback) {
    if (file)
      file.lines.push(msg);
    else
      callback({ code: 'ENOENT' });
    callback();
  },
  writeFile: function (file, msg, callback) {
    file.lines = []; // If a file already exists, this simulates an overwrite
    file.lines.push(msg);
    callback();
  }
};

// Stub the config module so that we can inject our own config values on the fly
const getConfigStub = function (writeToFile, filepath, fileMaxKilobytes) {
  return {
    get: function () {
      return {
        writeToFile: writeToFile,
        filepath: filepath,
        fileMaxKilobytes: fileMaxKilobytes
      }
    }
  }
};

let self = this;

describe('lib/helpers/logging', function () {
  beforeEach(function () {
    self.existingLogFile = {
      size: 5000,
      lines: new Array(100)
    };
    self.nonExistantLogFile = {
      size: 0,
      lines: []
    };
  });
  
  /////////////////////////////
  // Begin unit tests
  /////////////////////////////
  
  it('should append a line of text with a timestamp to an existing log file', function (done) {
    let configStub = getConfigStub(true, self.existingLogFile, 10000);
    let logger = proxyquire('../../lib/helpers/logger', { 'fs': fsStub, 'config': configStub });
    logger.log('test message').then(function () {
      self.existingLogFile.should.have.property('lines').that.is.an('array');
      self.existingLogFile.lines.should.have.property('length', 101);
      self.existingLogFile.lines[100].should.contain('test message');
      self.existingLogFile.lines[100].should.not.equal('test message');
      done();
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should append a line of text without a timestamp to an existing log file', function (done) {
    let configStub = getConfigStub(true, self.existingLogFile, 10000);
    let logger = proxyquire('../../lib/helpers/logger', { 'fs': fsStub, 'config': configStub });
    logger.log('test message', false).then(function () {
      self.existingLogFile.should.have.property('lines').that.is.an('array');
      self.existingLogFile.lines.should.have.property('length', 101);
      self.existingLogFile.lines[100].should.equal(`test message${EOL}`);
      done();
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should write a line of text with a timestamp to a new log file', function (done) {
    let configStub = getConfigStub(true, self.nonExistantLogFile, 10000);
    let logger = proxyquire('../../lib/helpers/logger', { 'fs': fsStub, 'config': configStub });
    logger.log('test message').then(function () {
      self.nonExistantLogFile.should.have.property('lines').that.is.an('array');
      self.nonExistantLogFile.lines.should.have.property('length', 1);
      self.nonExistantLogFile.lines[0].should.contain('test message');
      self.nonExistantLogFile.lines[0].should.not.equal('test message');
      done();
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should write a line of text without a timestamp to a new log file', function (done) {
    let configStub = getConfigStub(true, self.nonExistantLogFile, 10000);
    let logger = proxyquire('../../lib/helpers/logger', { 'fs': fsStub, 'config': configStub });
    logger.log('test message', false).then(function () {
      self.nonExistantLogFile.should.have.property('lines').that.is.an('array');
      self.nonExistantLogFile.lines.should.have.property('length', 1);
      self.nonExistantLogFile.lines[0].should.equal(`test message${EOL}`);
      done();
    }).catch(function (err) {
      done(err);
    });
  });
  
  it('should delete an existing log file due to size and write a new file', function (done) {
    let configStub = getConfigStub(true, self.existingLogFile, 4000);
    let logger = proxyquire('../../lib/helpers/logger', { 'fs': fsStub, 'config': configStub });
    logger.log('test message').then(function () {
      self.existingLogFile.should.have.property('lines').that.is.an('array');
      self.existingLogFile.lines.should.have.property('length', 1);
      self.existingLogFile.lines[0].should.contain('test message');
      done();
    }).catch(function (err) {
      done(err);
    });
  });
});