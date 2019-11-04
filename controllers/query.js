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

    const {firstname, lastname,gender,email, password, jobrole, department, address, is_admin}=req.body

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


        pool.query(
          'INSERT INTO employees(\
            firstname, lastname, gender, email, password, jobrole, department, address, is_admin)\
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [firstname, lastname, gender, email, hashed_password, jobrole, department, address, is_admin],
            (error, results)=>{
              if(error){
                console.log(error)
                return res.status(400).json({status:"error", message:error.detail})
              }
              res.status(201).json({
                status:"success",
                data:{
                  message:"user account successfully created",
                  token: jwt.sign({email:email, is_admin:is_admin}, config.secret),
                  userId: email
                }
              })
            }
        )


      })



/*
    pool.query(
        'INSERT INTO employees(id, name) VALUES($1,$2)',[id, name],
        (error, results)=>{
            if(error){
                throw error
            }
            res.status(201).json({
                status:'success',
                data:{
                    message:"user account successfully created",
                    token: jwt.sign({id: id, name:name}, config.secret),
                    userId: id
                }
            })
        }
        )
*/
}



module.exports = {
    createUser
}
