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
                      message: 'GIF successfully posted',
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


/*


pool.query(
  'INSERT INTO gif(image, title, owner)\
  VALUES($1, $2, $3)',
  [file.url, title, userId],
  (error, results)=>{
    if(error){
      return res.status(400).json({status:"error", message:error.detail})
    }
    console.log(results)
    return res.status(400).json({status:"done"})
  )







   //upload image file to cloudinary

   .then((file)=>{
     //del the uploaded file from filesystem
     fs.unlink(`./${filename}`, (err)=>{
       if(err){
         console.log(err)
       }
     });
   })


   pool.query(
     'INSERT INTO gif(image, title, owner)\
     VALUES($1, $2, $3)',
     ['sasa', title, userId],
     (error, results)=>{
       if(error){
         return res.status(400).json({status:"error", message:error.detail})
         //throw error
       }
       else{
         res.status(201).json({
           status:"success",
           data:{
             gifId:4,
             message:"GIF successfully posted",
             created_on: 'time',
             title: title,
             imageURL: 'some url'
           }
         })

       }
     }
   )


}

pool.query(
  'INSERT INTO gif(image, title, owner)\
  VALUES($1, $2, $3)',
  [file.url, title, userId],
  (error, results)=>{
    if(error){
      //return res.status(400).json({status:"error", message:error.detail})
      throw error
    }
    else{
      res.status(201).json({
        status:"success",
        data:{
          gifId:4,
          message:"GIF successfully posted",
          created_on: 'time',
          title: title,
          imageURL: file.url
        }
      })

    }
  }
)
*/


module.exports={
  createGif
}
