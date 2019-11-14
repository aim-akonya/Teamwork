const express = require('express');
const app = require('../../app');
const conn = require('../../controllers/feed');

const router = express.Router();

router.get('/', conn.getFeed);

module.exports = router
