const chai = require('chai');
const should = chai.should();

describe('helpers/security', function () {
  // Preparation
  before(function () {
    // The module that we will be testing
    this.security = require('../../helpers/security');
    
    // Dummy data...for testing purposes
    this.testUser = {
      id: 1,
      username: 'TestUser',
      password: 'TestPassword',
      uuid: '7b0a0820-f1d2-11e6-a299-35c97126b6fc',
      roles: []
    };
    this.validToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUZXN0UHJlcGFyYXRpb25BcGkiLCJleHAiOjAsInVzZXIiOnsidXNlcm5hbWUiOiJUZXN0VXNlciJ9fQ.DXeZMFTuHkQ9GebLk_PgHEBZtACBQiJ5jfoZ5iEaNj4';
    this.expiredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUZXN0UHJlcGFyYXRpb25BcGkiLCJleHAiOjE0ODcwODQzODcsInVzZXIiOnsidXNlcm5hbWUiOiJUZXN0VXNlciJ9fQ.BhjoaFmWq0YQbt1rTivVv_Hy4_S2stGgLNTUvscNPd0';
    this.invalidToken = 'this is an invalid token';
  });
  
  /////////////////////////////
  // Begin unit tests
  /////////////////////////////
  
  it('should return string hashed and salted', function () {
    let hashedSaltedPassword = this.security.securifyPassword(this.testUser.password, this.testUser.uuid);
    hashedSaltedPassword.should.be.ok;
    hashedSaltedPassword.should.be.a('string');
    hashedSaltedPassword.should.not.contain(this.testUser.Password);
    hashedSaltedPassword.should.not.contain(this.testUser.uuid);
  });
  
  it('should return an encrypted string representing a JSON-Web-Token', function () {
    let token = this.security.createToken(this.testUser);
    token.should.be.ok;
    token.should.be.a('string');
  });
  
  it('should return valid json object with success=true after validating a valid token', function () {
    let validationResult = this.security.validateToken(this.validToken);
    validationResult.should.be.json;
    validationResult.should.have.property('success', true);
    validationResult.should.have.property('payload');
  });
  
  it('should return valid json object with success=false after validating an expired token', function () {
    let validationResult = this.security.validateToken(this.expiredToken);
    validationResult.should.be.json;
    validationResult.should.have.property('success', false);
  });
  
  it('should return valid json object with success=false after validating an invalid token', function () {
    let validationResult = this.security.validateToken(this.invalidToken);
    validationResult.should.be.json;
    validationResult.should.have.property('success', false);
  });
});