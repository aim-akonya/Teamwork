const express = require('express');
const app = require('../../app');
const conn = require('../../controllers/query.js');


const router = express.Router();

//admin can create a user
router.post('/create-user', conn.createUser);

module.exports = router