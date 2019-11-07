const express = require('express');
const headers = require('./middleware/headers');
const app = express();
const cloudinary = require('cloudinary').v2;
const checkToken = require('./middleware/checkToken');

cloudinary.config({
  cloud_name:'aim-akonya',
  api_key:'548684715427161',
  api_secret:'SGaExdNYGEb93-56siojhpsQwQM'
})




//set cors headers
app.use(headers);

//initialise bodyparser
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({ extended: false }))

//entry point
app.get('/api/v1', (req, res)=>{
  res.status(200).json({status:'success', application:'Teamwork Application'})
})

//admin can create user
app.use('/api/v1/auth', require('./routes/api/employees'))

//validate token
app.use(checkToken);

//gifs
app.use('/api/v1/gifs', require('./routes/api/gif'))


module.exports = app;
