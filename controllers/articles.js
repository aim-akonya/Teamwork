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


const createArticle = (req, res, next)=>{
  if (!req.body){
    return res.status(400).json({status:"error"})
  }
  const userId = req.decoded.id
  const createdOn = new Date();
  const {title, article} = req.body;
  if(!title || !article){
    return res.status(400).json({status:"error", message:"Both title and article are required"})
  }

  pool.query(
    'INSERT INTO articles(title, article, owner, created_at) VALUES($1, $2, $3, $4)',
    [title, article, userId, createdOn],
    (error, response)=>{
      if(error){
        return res.status(400).json({status:"error", message:error.detail})
      }
      console.log(response);
      pool.query('SELECT id, created_at FROM articles WHERE created_at=($1)',[createdOn],
      (err, data)=>{
        if(err){
          return res.status(400).json({status:"error", message:error.detail})
        }
        res.status(201).json({
          status:'success',
          data:{
            message:'Article successfully posted',
            articleId:data.rows[0].id,
            createdOn: data.rows[0].created_at,
            title: title
          }
        })
      }
    )

    })
}


module.exports = {
  createArticle
}
