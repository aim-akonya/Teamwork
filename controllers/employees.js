const Pool = require('pg').Pool;
const config = require('../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const pool = new Pool({
    user: config.db_username,
    host: config.db_host,
    database: config.db,
    password: config.db_password,
    port: config.db_port,
});


//admin can create user
const createUser = (req, res, next)=>{
    if (!req.body){
      return res.status(400).json({status:"error"})
    }


    const {firstname, lastname, gender, email, password, jobrole, department, address, is_admin}=req.body

    if(email===undefined){
      return res.status(400).json({status:"error", message:"email is required"})
    }
    if(password===undefined){
      return res.status(400).json({status:"error", message:"password is required"})
    }


    let hashed_password = ''
    bcrypt.hash(password, 10)
      .then((val)=>{
        hashed_password = val
        //check if email already exists
        pool.query('SELECT email FROM employees WHERE email=$1',[email],
        (error, results)=>{
          if(error){
            return res.status(400).json({status:"error", message:error.detail})
          }
          if (results.rows.length !== 0){
            return res.status(400).json({status:"error", message:"user already exists"})
          }

          pool.query(
            'INSERT INTO employees(\
              firstname, lastname, gender, email, password, jobrole, department, address, is_admin)\
              VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
              [firstname, lastname, gender, email, hashed_password, jobrole, department, address, is_admin],
              (error, results)=>{
                if(error){
                  //console.log(error)
                  return res.status(400).json({status:"error", message:error.detail})
                }
                //get the new user's id
                pool.query('SELECT id, email FROM employees WHERE email=$1',[email],
                (err, data)=>{
                  if(err){
                    return res.status(400).json({status:"error", message:"user not created"})
                  }
                  res.status(201).json({
                    status:"success",
                    data:{
                      message:"user account successfully created",
                      token: jwt.sign({email:email, id:data.rows[0].id, is_admin:is_admin}, config.secret),
                      userId: data.rows[0].id
                    }
                  })
                })
              }
          )
        }
      )
      })
}

const userSignin=(req, res, next)=>{
  if (!req.body){
    return res.status(400).json({status:"error"})
  }
  const {email, password} = req.body;

  if(email === undefined){
    return res.status(400).json({status:"error", message:"email is required"})
  }

  pool.query("SELECT id, password, email, is_admin FROM employees WHERE email=$1",[email],
  (error, results)=>{
    if(error){
      return res.status(400).json({status:"error", message:error.detail})
    }
    console.log(results.rows[0]);
    bcrypt.compare(password, results.rows[0].password, (err, response)=>{
      if(response){
        res.status(200).json({
          status:"success",
          data:{
            token:jwt.sign({email:email, id:results.rows[0].id, is_admin:results.rows[0].is_admin}, config.secret),
            userId:results.rows[0].id,
            email:results.email
          }
        })
      }
    })
  }
)
}



module.exports = {
    pool,
    createUser,
    userSignin
}
