const express = require('express');
const app = require('../../app');
const conn = require('../../controllers/articles');

const router = express.Router();

router.post('/', conn.createArticle)

module.exports=router
