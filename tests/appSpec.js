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
let articleId = ''
let gifId=''

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
  it('should respond with status code 201 and return  json data', done=>{
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
          gifId = res.body.data.gifId
          done();
      })
  }).timeout(15000)

})

//employee can create an article
describe ('POST /articles', ()=>{
  it('should respond with status 201 and return json data', (done)=>{
    //create an article
    request(app)
      .post('/api/v1/articles')
      .set('authorization', userToken)
      .send(user.testArticle)
      .expect('Content-Type', /json/)
      .end((err, res)=>{
        if (err) return done(err)
        expect(res.status).to.equal(201);
        expect(res.body.status).to.equal('success');
        expect(res.body.data).to.be.a('object');
        expect(res.body.data.message).to.equal('Article successfully posted');
        expect(res.body.data.articleId).to.be.a('number');
        expect(res.body.data.createdOn).to.be.a('string');
        expect(res.body.data.title).to.be.a('string');
        articleId = res.body.data.articleId ;
        done();
      })
  })
}).timeout(15000)

//employee can edit an article
describe('PATCH /articles/:articleId', ()=>{
  it('should respond with a status code of 200 and edit the article with the new data', (done)=>{
    request(app)
      .patch(`/api/v1/articles/${articleId}`)
      .set('authorization', userToken)
      .send({title: 'The fall of the race', article:"It indeed is an interesting article"})
      .expect('Content-Type', /json/)
      .end( (err, res)=>{
        if (err) done(err)
        expect(res.status).to.equal(200);
        expect(res.body.data).to.be.a('object');
        expect(res.body.data.message).to.equal('Article successfully updated');
        expect(res.body.data.title).to.be.a('string');
        expect(res.body.data.article).to.be.a('string');
        done();
      })
  })
})

//employee can delete an article
describe('DELETE /articles/:articleId', ()=>{
  it('should allow user to delete their article and respond with status code of 200', (done)=>{
    request(app)
      .delete(`/api/v1/articles/${articleId}`)
      .set('authorization', userToken)
      .end( (err, res)=>{
        if (err) done(err)
        expect(res.status).to.equal(203);
        expect(res.body.status).to.equal('Success')
        expect(res.body.data).to.be.a('object');
        expect(res.body.data.message).to.equal('Article successfully deleted');
        done();
      })
  })
})

//employees can delete their gifs
describe('DELETE /gifs/:gifId', ()=>{
  it('should allow user to delete their article and respond with status code of 200', (done)=>{
    request(app)
      .delete(`/api/v1/gifs/${gifId}`)
      .set('authorization', userToken)
      .end( (err, res)=>{
        if (err) done(err)
        expect(res.status).to.equal(203);
        expect(res.body.status).to.equal('Success')
        expect(res.body.data).to.be.a('object');
        expect(res.body.data.message).to.equal('gif post successfully deleted');
        done();
      })
  })
})
