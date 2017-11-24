var chai = require('chai');
var chaiHttp = require('chai-http');
var url = 'http://localhost:3000';

chai.use(chaiHttp);

describe('GET /', function () {
  it("should return You're on the root path", function (done) {
    chai.request(url)
      .get('/api')
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        chai.expect(res.body.message).to.include("You're on the root path");
        done();
      });
  });
});
