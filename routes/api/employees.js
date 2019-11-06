const express = require('express');
const app = require('../../app');
const conn = require('../../controllers/employees.js');


const router = express.Router();

//admin can create a user
router.post('/create-user', conn.createUser);

//signin
router.post('/signin', conn.signin);

module.exports = router
