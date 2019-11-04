const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

//configuring chai 
chai.use(chaiHttp);
chai.should();

describe('employees', ()=>{

    it('should allow admin to create users', (done)=>{
        chai.request(app)
            .post('/api/v1/auth/create-user')
            .end( (err, res)=>{
                if(err){
                    done()
                }else{
                    //res.should.have.status(201);
                    //res.body.should.be.a('object');
                    //res.body.data.should.be.a('object');
                    //res.body.status.should.be.a('string');
                    //res.body.data.token.should.be.a('string');
                    //res.body.data.userId.should.be.a('int');
                }
                done();
            })
    })
})