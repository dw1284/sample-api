const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);

let self = this;
self.dummyRole = {
  name: 'DummyRole'
};

describe('routes/roles', function () {
  describe('get', function () {
    it('should return status 401 unauthorized due to lack of auth token on /roles GET', function (done) {
      chai
        .request(global.server)
        .get('/roles')
        .end(function (error, response, body) {
          response.should.have.status(401);
          response.should.be.json;
          response.body.should.have.property('status', 'fail');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('message');
          done();
        });
    });
    
    it('should return status 401 unauthorized due to lack of auth token on /roles/:roleId GET', function (done) {
      chai
        .request(global.server)
        .get(`/roles/${global.testRole.id}`)
        .end(function (error, response, body) {
          response.should.have.status(401);
          response.should.be.json;
          response.body.should.have.property('status', 'fail');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('message');
          done();
        });
    });
    
    it('should return status 200 and a valid JSON object containing an array of roles on /roles GET', function (done) {
      chai
        .request(global.server)
        .get('/roles')
        .set('accessToken', global.authToken)
        .end(function (error, response, body) {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.have.property('status', 'success');
          response.body.should.have.property('data').that.is.an('array').that.is.not.empty;
          response.body.data[0].should.have.property('name');
          done();
        });
    });
    
    it('should return status 200 and a valid JSON object containing an array of roles on /roles?searchParams GET', function (done) {
      chai
        .request(global.server)
        .get(`/roles?name=${global.testRole.name}`)
        .set('accessToken', global.authToken)
        .end(function (error, response, body) {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.have.property('status', 'success');
          response.body.should.have.property('data').that.is.an('array').that.is.not.empty;
          response.body.data[0].should.have.property('name');
          done();
        });
    });
    
    it('should return status 200 and a valid JSON object containing a single role on /roles/:roleId GET', function (done) {
      chai
        .request(global.server)
        .get(`/roles/${global.testRole.id}`)
        .set('accessToken', global.authToken)
        .end(function (error, response, body) {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.have.property('status', 'success');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('name');
          done();
        });
    });
  });
  
  describe('put', function () {
    it('should return status 401 unauthorized due to lack of auth token on /roles PUT', function (done) {
      chai
        .request(global.server)
        .put('/roles')
        .end(function (error, response, body) {
          response.should.have.status(401);
          response.should.be.json;
          response.body.should.have.property('status', 'fail');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('message');
          done();
        });
    });
    
    it('should return status 200 and a valid JSON object containing an inserted role on /roles PUT', function (done) {
      chai
        .request(global.server)
        .put('/roles')
        .set('accessToken', global.authToken)
        .send(self.dummyRole)
        .end(function (error, response, body) {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.have.property('status', 'success');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('name');
          self.dummyRole = response.body.data;
          done();
        });
    });
  });
  
  describe('post', function () {
    it('should return status 401 unauthorized due to lack of auth token on /roles POST', function (done) {
      chai
        .request(global.server)
        .post(`/roles/${self.dummyRole.id}`)
        .end(function (error, response, body) {
          response.should.have.status(401);
          response.should.be.json;
          response.body.should.have.property('status', 'fail');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('message');
          done();
        });
    });
    
    it('should return status 200 and a valid JSON object containing an updated role on /roles POST', function (done) {
      chai
        .request(global.server)
        .post(`/roles/${self.dummyRole.id}`)
        .set('accessToken', global.authToken)
        .send(self.dummyRole)
        .end(function (error, response, body) {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.have.property('status', 'success');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('name');
          done();
        });
    });
  });
  
  describe('delete', function () {
    it('should return status 401 unauthorized due to lack of auth token on /roles/:roleId DELETE', function (done) {
      chai
        .request(global.server)
        .delete(`/roles/${self.dummyRole.id}?force=true`)
        .end(function (error, response, body) {
          response.should.have.status(401);
          response.should.be.json;
          response.body.should.have.property('status', 'fail');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('message');
          done();
        });
    });
    
    it('should return status 200 indicating 1 row deleted on /roles/:roleId DELETE', function (done) {
      chai
        .request(global.server)
        .delete(`/roles/${self.dummyRole.id}?force=true`)
        .set('accessToken', global.authToken)
        .end(function (error, response, body) {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.have.property('status', 'success');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('rowsAffected', 1);
          done();
        });
    });
  });
});
