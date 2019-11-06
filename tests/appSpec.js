const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const expect = require ('chai').expect;

//configuring chai
chai.use(chaiHttp);
chai.should();


describe('test', ()=>{
  it('should return a string', ()=>{
    expect('Teamwork application').to.equal('Teamwork application');
  });
});

describe('employees accounts', ()=>{

    it('should allow admin to create users', (done)=>{
        chai.request(app)
            .post('/api/v1/auth/create-user')
            .end( (err, res)=>{
                if(err){
                    done()
                }else{
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.status.should.be.a('string');
                }
                done();
            })
    })
})

describe('sign in', ()=>{

})
