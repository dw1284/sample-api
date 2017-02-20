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
      headers: {},
      query: {}
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
    let result = this.checkAuthorization({ requiredRoles: ['admin'] })(this.req, this.res, this.next);
    should.not.exist(result);
  });
  
  it('should return undefined indicating an authorized user with one, but not all, of specified roles', function () {  
    this.req.headers.accesstoken = security.createToken(this.adminUser);
    let result = this.checkAuthorization({ requireAnyRole: ['admin', 'superUser'] })(this.req, this.res, this.next);
    should.not.exist(result);
  });
  
  it('should return undefined indicating an authorized user with required propertyPath', function () {  
    this.req.headers.accesstoken = security.createToken(this.regularUser);
    this.req.query.username = 'RegularUser';
    let requiredProperty = { requestPath: 'query.username', tokenComparePath: 'user.username' };
    let result = this.checkAuthorization({ requiredProp: requiredProperty })(this.req, this.res, this.next);
    should.not.exist(result);
  });
  
  it('should return undefined indicating an authorized user without required property path, but with override role', function () {  
    this.req.headers.accesstoken = security.createToken(this.adminUser);
    this.req.query.username = 'DifferentUsername';
    let requiredProperty = { requestPath: 'query.username', tokenComparePath: 'user.username', overrideRoles: ['admin'] };
    let result = this.checkAuthorization({ requiredProp: requiredProperty })(this.req, this.res, this.next);
    should.not.exist(result);
  });
  
  it('should return undefined indicating an authorized user with admin role and required propertyPath', function () {  
    this.req.headers.accesstoken = security.createToken(this.adminUser);
    this.req.query.username = 'AdminUser';
    let requiredProperty = { requestPath: 'query.username', tokenComparePath: 'user.username' };
    let result = this.checkAuthorization({ requiredRoles: ['admin'], requiredProp: requiredProperty })(this.req, this.res, this.next);
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
    let result = this.checkAuthorization({ requiredRoles: ['admin'] })(this.req, this.res, this.next);
    result.should.be.json;
    result.should.have.property('status', 403);
    result.should.have.property('body');
    result.body.should.be.json;
    result.body.should.have.property('status', 'fail');
    result.body.should.have.property('data');
    result.body.data.should.be.json;
    result.body.data.should.have.property('message');
  });
  
  it('should return authorization failure due to user lacking any of the specified roles', function () {  
    this.req.headers.accesstoken = security.createToken(this.regularUser);
    let result = this.checkAuthorization({ requireAnyRole: ['admin', 'superUser'] })(this.req, this.res, this.next);
    result.should.be.json;
    result.should.have.property('status', 403);
    result.should.have.property('body');
    result.body.should.be.json;
    result.body.should.have.property('status', 'fail');
    result.body.should.have.property('data');
    result.body.data.should.be.json;
    result.body.data.should.have.property('message');
  });
  
  it('should return authorization failure due to lack of required propertyPath', function () {  
    this.req.headers.accesstoken = security.createToken(this.regularUser);
    let requiredProperty = { requestPath: 'query.missingProperty' };
    let result = this.checkAuthorization({ requiredProp: requiredProperty })(this.req, this.res, this.next);
    result.should.be.json;
    result.should.have.property('status', 403);
    result.should.have.property('body');
    result.body.should.be.json;
    result.body.should.have.property('status', 'fail');
    result.body.should.have.property('data');
    result.body.data.should.be.json;
    result.body.data.should.have.property('message');
  });
  
  it('should return authorization failure due to unmatching propertyPath value', function () {  
    this.req.headers.accesstoken = security.createToken(this.regularUser);
    this.req.query.username = 'DifferentUsername';
    let requiredProperty = { requestPath: 'query.username', tokenComparePath: 'user.username' };
    let result = this.checkAuthorization({ requiredProp: requiredProperty })(this.req, this.res, this.next);
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