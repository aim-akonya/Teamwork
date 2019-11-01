const express = require('express');
const headers = require('./middleware/headers');
const app = express();


//set cors headers
app.use(headers);

//initialise bodyparser
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


module.exports = app;