const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);

let self = this;
self.dummyUser = {
  username: 'DummyUser',
  password: 'DummyPassword',
  roles: [{ id: 1, name: 'admin' }]
};

describe('routes/users', function () {
  describe('get', function () {
    it('should return status 401 unauthorized due to lack of auth token on /users GET', function (done) {
      chai
        .request(global.server)
        .get('/users')
        .end(function (error, response, body) {
          response.should.have.status(401);
          response.should.be.json;
          response.body.should.have.property('status', 'fail');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('message');
          done();
        });
    });
    
    it('should return status 401 unauthorized due to lack of auth token on /users/:userId GET', function (done) {
      chai
        .request(global.server)
        .get(`/users/${global.testUser.id}`)
        .end(function (error, response, body) {
          response.should.have.status(401);
          response.should.be.json;
          response.body.should.have.property('status', 'fail');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('message');
          done();
        });
    });
    
    it('should return status 200 and a valid JSON object containing an array of users on /users GET', function (done) {
      chai
        .request(global.server)
        .get('/users')
        .set('accessToken', global.authToken)
        .end(function (error, response, body) {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.have.property('status', 'success');
          response.body.should.have.property('data').that.is.an('array').that.is.not.empty;
          response.body.data[0].should.have.property('username');
          response.body.data[0].should.have.property('roles').that.is.an('array');
          done();
        });
    });
    
    it('should return status 200 and a valid JSON object containing an array of users on /users?searchParams GET', function (done) {
      chai
        .request(global.server)
        .get(`/users?username=${global.testUser.username}`)
        .set('accessToken', global.authToken)
        .end(function (error, response, body) {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.have.property('status', 'success');
          response.body.should.have.property('data').that.is.an('array').that.is.not.empty;
          response.body.data[0].should.have.property('username');
          response.body.data[0].should.have.property('roles').that.is.an('array').that.is.not.empty;
          response.body.data[0].roles[0].should.have.property('name', 'admin');
          done();
        });
    });
    
    it('should return status 200 and a valid JSON object containing a single user on /users/:userId GET', function (done) {
      chai
        .request(global.server)
        .get(`/users/${global.testUser.id}`)
        .set('accessToken', global.authToken)
        .end(function (error, response, body) {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.have.property('status', 'success');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('username');
          done();
        });
    });
  });
  
  describe('put', function () {    
    it('should return status 200 and a valid JSON object containing an inserted user on /users PUT', function (done) {
      chai
        .request(global.server)
        .put('/users')
        .set('accessToken', global.authToken)
        .send(self.dummyUser)
        .end(function (error, response, body) {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.have.property('status', 'success');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('username');
          response.body.data.should.have.property('roles').that.is.an('array').that.is.not.empty;
          response.body.data.roles[0].should.have.property('name', 'admin');
          self.dummyUser = response.body.data;
          done();
        });
    });
  });
  
  describe('post', function () {
    it('should return status 401 unauthorized due to lack of auth token on /users POST', function (done) {
      chai
        .request(global.server)
        .post(`/users/${self.dummyUser.id}`)
        .end(function (error, response, body) {
          response.should.have.status(401);
          response.should.be.json;
          response.body.should.have.property('status', 'fail');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('message');
          done();
        });
    });
    
    it('should return status 200 and a valid JSON object containing an updated user on /users POST', function (done) {
      chai
        .request(global.server)
        .post(`/users/${self.dummyUser.id}`)
        .set('accessToken', global.authToken)
        .send(self.dummyUser)
        .end(function (error, response, body) {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.have.property('status', 'success');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('username');
          response.body.data.should.have.property('roles').that.is.an('array').that.is.not.empty;
          response.body.data.roles[0].should.have.property('name', 'admin');
          done();
        });
    });
  });
  
  describe('delete', function () {
    it('should return status 401 unauthorized due to lack of auth token on /users DELETE', function (done) {
      chai
        .request(global.server)
        .delete(`/users/${self.dummyUser.id}?force=true`)
        .end(function (error, response, body) {
          response.should.have.status(401);
          response.should.be.json;
          response.body.should.have.property('status', 'fail');
          response.body.should.have.property('data').that.is.an('object');
          response.body.data.should.have.property('message');
          done();
        });
    });
    
    it('should return status 200 indicating 1 row deleted on /users/:userId DELETE', function (done) {
      chai
        .request(global.server)
        .delete(`/users/${self.dummyUser.id}?force=true`)
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
