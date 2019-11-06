const express = require('express');
const app = require('../../app');
const conn = require('../../controllers/gifs.js');

const router = express.Router();

//employees can post gif
router.post('/',  conn.createGif)

module.exports = router
