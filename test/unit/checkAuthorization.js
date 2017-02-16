const security = require('../../helpers/security');
const chai = require('chai');
const should = chai.should();

describe('helpers/checkAuthorization', function () {
  // Preparation
  before(function () {
    // The module that we will be testing
    this.checkAuthorization = require('../../helpers/checkAuthorization');
    
    // Dummy data...for testing purposes
    this.regularUser = {
      username: 'RegularUser',
      roles: []
    };
    this.adminUser = {
      username: 'AdminUser',
      roles: [{ id: 1, name: 'admin' }]
    };
    this.req = {
      headers: {}
    };
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
    this.next = function () { };
  });
  
  /////////////////////////////
  // Begin unit tests
  /////////////////////////////
  
  it('should return undefined indicating an authorized user', function () {  
    this.req.headers.accesstoken = security.createToken(this.regularUser);
    let result = this.checkAuthorization()(this.req, this.res, this.next);
    should.not.exist(result);
  });
  
  it('should return undefined indicating an authorized user with admin role', function () {  
    this.req.headers.accesstoken = security.createToken(this.adminUser);
    let result = this.checkAuthorization(['admin'])(this.req, this.res, this.next);
    should.not.exist(result);
  });
  
  it('should return authorization failure due to invalid token', function () {  
    this.req.headers.accesstoken = 'thisIsAnInvalidToken';
    let result = this.checkAuthorization()(this.req, this.res, this.next);
    result.should.be.json;
    result.should.have.property('status', 401);
    result.should.have.property('body');
    result.body.should.be.json;
    result.body.should.have.property('status', 'fail');
    result.body.should.have.property('data');
    result.body.data.should.be.json;
    result.body.data.should.have.property('message');
  });
  
  it('should return authorization failure due to user lacking admin role', function () {  
    this.req.headers.accesstoken = security.createToken(this.regularUser);
    let result = this.checkAuthorization(['admin'])(this.req, this.res, this.next);
    result.should.be.json;
    result.should.have.property('status', 403);
    result.should.have.property('body');
    result.body.should.be.json;
    result.body.should.have.property('status', 'fail');
    result.body.should.have.property('data');
    result.body.data.should.be.json;
    result.body.data.should.have.property('message');
  });
});