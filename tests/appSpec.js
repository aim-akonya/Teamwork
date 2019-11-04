const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

//configuring chai
chai.use(chaiHttp);
chai.should();

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
  it('should allow admin/employees to signin', (done)=>{
    
  })
})
