const Promise = require('bluebird');
const chai = require('chai');
const should = chai.should();
const proxyquire = require('proxyquire');

const loggerStub = {
  log: function (message, includeTimestamp = true) {
    // Do nothing (logger has its own tests)
    return Promise.resolve();
  }
};

describe('lib/handleError', function () {
  // Preparation
  before(function () {    
    // Mock the response object
    this.res = {
      resCode: undefined,
      status: function (code) { 
        this.resCode = code;
        return this;
      },
      json: function (object) {
        return {
          status: this.resCode,
          body: object
        };
      }
    };
    
    // The module that we will be testing
    this.handleError = proxyquire('../../lib/handleError', { './helpers/logger': loggerStub })(this.res);
  });
  
  /////////////////////////////
  // Begin unit tests
  /////////////////////////////
  
  it('should return status 500 with an error message', function (done) {  
    this.handleError(new Error('Catastrophic meltdown')).then(function (result) {
      result.should.be.json;
      result.should.have.property('status', 500);
      result.should.have.property('body').that.should.be.json;
      result.body.should.have.property('status', 'error');
      result.body.should.have.property('data').that.should.be.json;
      result.body.data.should.have.property('message', 'Catastrophic meltdown');
      done();
    }).catch(done);
  });
});