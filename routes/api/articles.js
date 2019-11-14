const express = require('express');
const app = require('../../app');
const conn = require('../../controllers/articles');

const router = express.Router();

router.post('/', conn.createArticle)
router.patch('/:articleId', conn.editArticle)
router.delete('/:articleId', conn.deleteArticle)

//comments
router.post('/:articleId/comment', conn.comment)

//get article
router.get('/:articleId', conn.getArticle)

module.exports=router
