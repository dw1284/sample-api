const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();

chai.use(chaiHttp);

describe('routes/users', function () {
  it('should return status 401 unauthorized due to lack of auth token on /users GET', function (done) {
    chai
      .request(server)
      .get('/users')
      .end(function (error, response, body) {
        response.should.have.status(401);
        response.should.be.json;
        response.body.should.have.property('status', 'fail');
        response.body.should.have.property('data');
        response.body.data.should.have.property('message');
        done();
      });
  });
  
  it('should return status 200 and a valid JSON object containing an array of users on /users GET', function (done) {
    chai
      .request(server)
      .get('/users')
      .set('accessToken', global.authToken)
      .end(function (error, response, body) {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.have.property('status', 'success');
        response.body.should.have.property('data');
        response.body.data.should.be.an('array');
        response.body.data.should.not.be.empty;
        response.body.data[0].should.have.property('username');
        done();
      });
  });
  
  it('should return status 200 and a valid JSON object containing a single user on /users?searchParams GET', function (done) {
    chai
      .request(server)
      .get(`/users?username=${global.testUser.username}`)
      .set('accessToken', global.authToken)
      .end(function (error, response, body) {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.have.property('status', 'success');
        response.body.should.have.property('data');
        response.body.data.should.be.an('array');
        response.body.data.should.not.be.empty;
        response.body.data[0].should.have.property('username');
        done();
      });
  });
  
  it('should return status 200 and a valid JSON object containing an array of users on /users/:userId GET', function (done) {
    chai
      .request(server)
      .get(`/users/${global.testUser.id}`)
      .set('accessToken', global.authToken)
      .end(function (error, response, body) {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.have.property('status', 'success');
        response.body.should.have.property('data');
        response.body.data.should.have.property('username');
        done();
      });
  });
});
