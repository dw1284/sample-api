const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);

describe('routes/authenticate', function () {
  describe('post', function () {
    it('should return status 401 and when bad credentials are sent on /authenticate POST', function (done) {
      chai
        .request(global.server)
        .post('/authenticate')
        .send({username: 'TestUser', password: 'BadPassword'})
        .end(function (error, response, body) {
          response.should.have.status(401);
          response.should.be.json;
          response.body.should.have.property('status', 'fail');
          done();
        });
    });
    
    it('should return status 200 and a valid JSON web token on /authenticate POST', function (done) {
      chai
        .request(global.server)
        .post('/authenticate')
        .send({username: 'TestUser', password: 'TestPassword'})
        .end(function (error, response, body) {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.have.property('status', 'success');
          response.body.should.have.property('data');
          response.body.data.should.have.property('accessToken');
          done();
        });
    });
  });
});
