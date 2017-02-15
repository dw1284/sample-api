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
  
  it('should return true if value is a number, false otherwise', function () {
    this.utils.isNumeric(3).should.be.true;
    this.utils.isNumeric('3').should.be.true;
    this.utils.isNumeric('a').should.be.false;
    this.utils.isNumeric('3a').should.be.false;
    this.utils.isNumeric().should.be.false;
    this.utils.isNumeric(null).should.be.false;
  });
});