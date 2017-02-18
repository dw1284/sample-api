const chai = require('chai');
const should = chai.should();

describe('helpers/utils', function () {
  // Preparation
  before(function () {
    // The module that we will be testing
    this.utils = require('../../helpers/utils');
  });
  
  /////////////////////////////
  // Begin unit tests
  /////////////////////////////
  
  it('should return true if value is a number or if value is a string containing only numeric chars', function () {
    this.utils.isNumeric(3).should.be.true;
    this.utils.isNumeric('3').should.be.true;
    this.utils.isNumeric('a').should.be.false;
    this.utils.isNumeric('3a').should.be.false;
    this.utils.isNumeric().should.be.false;
    this.utils.isNumeric(null).should.be.false;
  });
  
  it('should return value of an object property at given path', function () {
    let testObj = { p: { z: 1 } };
    this.utils.getValueAtPath(testObj, 'p.z').should.equal(1);
    this.utils.getValueAtPath(testObj, 'p').should.deep.equal({ z: 1 });
  });
  
  it('should return true if an object contains specified propertyPath', function () {
    let testObj = { p: { z: 1 } };
    this.utils.hasPropertyPath(testObj, 'p').should.be.true;
    this.utils.hasPropertyPath(testObj, 'p', { z: 1 }).should.be.true;
    this.utils.hasPropertyPath(testObj, 'p.z', 1).should.be.true;
    this.utils.hasPropertyPath(testObj, 'x').should.be.false;
    this.utils.hasPropertyPath(testObj, 'p.x').should.be.false;
    this.utils.hasPropertyPath(testObj, 'p.z', 2).should.be.false;
  });
});