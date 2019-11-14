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

//edit article
const editArticle = (req,res, next)=>{
  if (!req.body){
    return res.status(400).json({status:"error"})
  }
  if(!req.params.articleId){
    return res.status(400).json({status:"error", message:"missing params"})
  }
  const id = req.params.articleId
  const {title, article} = req.body
  if(!title || !article){
    return res.status(400).json({status:"error", message:"both article and title should be provided"})
  }
  pool.query('SELECT owner FROM articles WHERE id=$1',[id],
    (error, response)=>{
      if(error){
        return res.status(400).json({status:"error", message:"article does not exists"})
      }
      const owner = response.rows[0].owner
      const userId = req.decoded.id
      if(owner != userId){
        return res.status(403).json({status:"error", message:'Unauthorised'})
      }
    }
  )
  pool.query('UPDATE articles SET title=$1, article=$2 WHERE id=$3', [title, article, id],
    (error, response)=>{
      if(error){
        return res.status(400).json({status:"error", message:error.detail})
      }
      res.status(200).json({
        status:"success",
        data:{
          message:"Article successfully updated",
          title:title,
          article:article
        }
      })
    }
)}

//delete article
const deleteArticle =(req, res, next)=>{
  if(!req.params.articleId){
    return res.status(400).json({status:"error", message:"missing params"})
  }
  const id = req.params.articleId

  //check if article exists and the user is the creator
  pool.query('SELECT owner FROM articles WHERE id=$1',[id],
    (error, response)=>{
      if(error){
        return res.status(400).json({status:"error", message:"article does not exists"})
      }
      const owner = response.rows[0].owner
      const userId = req.decoded.id
      if(owner != userId){
        return res.status(403).json({status:"error", message:'Unauthorised'})
      }
    })

    //delete the article
    pool.query('DELETE FROM articles WHERE id=$1', [id],
    (error, response)=>{
      if(error){
        return res.status(400).json({status:"error", message:"article does not exists"})
      }

      res.status(203).json({
        status:"Success",
        data:{
          message:"Article successfully deleted",
        }
      })
    }
  )
}




module.exports = {
  createArticle,
  editArticle,
  deleteArticle
}
