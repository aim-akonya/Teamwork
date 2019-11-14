const express = require('express');
const app = require('../../app');
const conn = require('../../controllers/gifs.js');

const router = express.Router();

//employees can post gif
router.post('/',  conn.createGif)
router.delete('/:gifId', conn.deleteGif)

router.post('/:gifId/comment', conn.comment)

router.get('/:gifId', conn.getGif)

module.exports = router
