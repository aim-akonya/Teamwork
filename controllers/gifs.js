const Pool = require('pg').Pool;
const config = require('../config');
const jwt = require('jsonwebtoken');
const checkToken = require('../middleware/checkToken');
const base64_decode = require('../services/handleImage');
const fs = require('fs');
const uuid = require('uuid');
const cloudinary = require('cloudinary').v2;


const pool = new Pool({
    user: config.db_username,
    host: config.db_host,
    database: config.db,
    password: config.db_password,
    port: config.db_port,
});

const createGif = (req, res, next)=>{
      if (!req.body){
        return res.status(400).json({status:"error"})
      }

      const {image, title} = req.body
      const userId = req.decoded.id

      //check if both image and title are provided
      if(!image || !title){
        return res.status(400).json({status:"error", message:"image and title are both required"})
      }

      const filename = `${uuid.v4()}.gif`;
      //handle the base64 encoded data
      base64_decode(image, filename);

      cloudinary.uploader.upload(filename, {tags:'gifs', resource_type:'image'})
        .then(file=>{
          //delete the image file just uploaded
          fs.unlink(`./${filename}`, (err)=>{
            if(err){
              console.log(err);
            }
          })
          //insert values to the database
          pool.query(
            'INSERT INTO gif(image, title, owner, created_at)\
            VALUES($1, $2, $3, $4)',
            [file.url, title, userId, new Date().toLocaleString()],
            (error, results)=>{
              if(error){
                return res.status(400).json({status:"error", message:error.detail})
              }
              pool.query(
                'SELECT id, created_at FROM gif WHERE image=$1',[file.url],
                (err, data)=>{
                  if(error){
                    throw error
                  }
                  return res.status(201).json({
                    status:'success',
                    data:{
                      gifId: data.rows[0].id,
                      message: 'GIF image successfully posted',
                      createdOn: data.rows[0].created_at,
                      title: title,
                      imageUrl: file.url
                    }
                  })

                }
              )
            }
          )

        })
        .catch(err=>{
          //delete the image file just uploaded
          fs.unlink(`./${filename}`, (err)=>{
            if(err){
              console.log(err);
            }
          })
          console.log(err)
          return res.status(400).json({status:'error', message:'invalid image encoding'})
        })
}

//delete gif
const deleteGif = (req, res, next)=>{
  if(!req.params.gifId){
    return res.status(400).json({status:"error", message:"missing params"})
  }
  const id = req.params.gifId
  //check if gif exists and the user is the creator
  pool.query('SELECT owner FROM gif WHERE id=$1',[id],
    (error, response)=>{
      if(error){
        return res.status(400).json({status:"error", message:"gif does not exists"})
      }
      const owner = response.rows[0].owner
      const userId = req.decoded.id
      if(owner != userId){
        return res.status(403).json({status:"error", message:'Unauthorised'})
      }
    })

    //delete the gif if it exists
    pool.query('DELETE FROM gif WHERE id=$1', [id],
    (error, response)=>{
      if(error){
        return res.status(400).json({status:"error", message:"gif does not exists"})
      }

      res.status(203).json({
        status:"Success",
        data:{
          message:"gif post successfully deleted",
        }
      })
    })
}



//comment gif
const comment = (req, res, next)=>{

  if (!req.body){
    return res.status(400).json({status:"error"})
  }

  if(!req.params.gifId){
    return res.status(400).json({status:"error", message:"missing params"})
  }

  const comment = req.body.comment
  const id = req.params.gifId;
  const currentUser = req.decoded.id;
  let title = '';
  const createdOn = new Date();

  //getting the article being commented
  pool.query('SELECT title FROM gif WHERE id=$1',[id],
    (error, response)=>{
      if(error){

        return res.status(400).json({status:"error", message:"gif does not exists"})
      }
      title = response.rows[0].title
    })

    //adding comment
    pool.query('INSERT INTO gifComments(gif, comment, owner, created_at) VALUES($1, $2, $3, $4)',
    [id, comment, currentUser, createdOn],
    (error, response)=>{
      if(error){
        return res.status(400).json({status:"error", message:"failed to insert"})
      }
      res.status(201).json({
        status:"Success",
        data:{
          message:"Comment successfully created",
          createdOn: createdOn.toLocaleString(),
          gifTitle: title,
          comment: comment
        }
      })
    }
  )
}


//get gif
const getGif=(req, res, next)=>{
  if(!req.params.gifId){
    return res.status(400).json({status:"error", message:"missing params"})
  }
  const id = req.params.gifId;
  let title=''
  let url=''
  let createdOn = ''

  pool.query('SELECT * FROM gif WHERE id=$1',[id],
    (error, response)=>{
      if(error){
        return res.status(400).json({status:"error", message:"gif does not exists"})
      }
      if(response.rows.length === 0){
        return res.status(400).json({status:"error", message:"Article does not exists"})
      }
      title = response.rows[0].title
      url = response.rows[0].image
      createdOn = response.rows[0].created_at

      //getting the comments related to the article
      pool.query('SELECT id AS commentId, comment, owner AS authorId FROM gifComments WHERE gif=$1', [id],
      (error, response)=>{
        if(error){
          return res.status(400).json({status:"error"})
        }
        res.status(200).json({
          status:"Success",
          data:{
            id:id,
            createdOn: createdOn,
            title: title,
            url: url,
            comments: response.rows
          }
        })
      })

    })

}


module.exports={
  createGif,
  deleteGif,
  comment,
  getGif
}
