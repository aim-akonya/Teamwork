const chai = require('chai');
const chaiHttp = require('chai-http');
const request = require('supertest')
const app = require('../app');
const expect = require ('chai').expect;
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const user = require('./data');
const pool = require('../controllers/employees').pool
const config = require('../config');

//configuring chai
chai.use(chaiHttp);
chai.should();

const userToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1pa2VAbWFpbC5jb20iLCJpZCI6MSwiaXNfYWRtaW4iOnRydWUsImlhdCI6MTU3MzE1NDI2Mn0.X26CpLM7mp9hclz1YS1yfZ62l70PL7ejocI45brhZLU"

describe('GET /', ()=>{
  it('responds with json', done=>{
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end( (err, res) =>{
        if (err) return done(err);
        expect(res.status).to.equal(200);
        done();
      });
  });
});

//Testing admin can create an employee account
describe('POST /auth/create-user', ()=>{

  it('responds with status 201 and returns json data containing token', done=>{
    //check if test user already exists and del the record
    pool.query('DELETE FROM employees WHERE email=$1',[user.testUser1.email],
      (err, val)=>{
        if (err){
          console.error(err)
          done(err)
        }
      })
    request(app)
      .post('/api/v1/auth/create-user')
      .send(user.testUser1) //sending test user data to be added to db
      .expect("Content-Type", /json/)
      .then( res=> {
        expect(res.status).to.equal(201);
        expect(res.body.status).to.equal("success");
        expect(res.body.data.message).to.equal("user account successfully created");
        expect(res.body.data.token).to.be.a("string");
        expect(res.body.data.userId).to.be.a("number");
        done();
      })
      .catch(err => {
        done(err)
      });
  });
});

//test admin/employee can sign in
describe('POST /auth/signin', ()=>{
  it("responds with status code 200 and returns json data containing token", done=>{
    const test=user.testUser1
    request(app)
      .post("/api/v1/auth/signin")
      .send({email:test.email, password:test.password})
      .expect("Content-Type", /json/)
      .end((err, res)=>{
        if(err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.status).to.equal("success");
        expect(res.body.data.token).to.be.a("string");
        expect(res.body.data.userId).to.be.a("number");
        done();
      })

  })
})



//employees can post gifs
describe ("POST /gifs", ()=>{
  it('should respond with status code 201 and return a json data containing token', done=>{
    //setTimeout(15000)
    request(app)
      .post('/api/v1/gifs')
      .set('authorization', userToken)
      .send(user.image)
      .expect('Content-Type', /json/)
      .end((err, res)=>{
        if (err) return done(err)
          expect(res.status).to.equal(201);
          expect(res.body.status).to.equal("success");
          expect(res.body.data.message).to.be.equal("GIF image successfully posted");
          expect(res.body.data.createdOn).to.be.a("string");
          expect(res.body.data.title).to.be.a("string");
          expect(res.body.data.imageUrl).to.be.a("string");
          expect(res.body.data.gifId).to.be.a("number");
          done();
      })
  }).timeout(15000)

})
