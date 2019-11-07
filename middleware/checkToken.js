
let jwt = require('jsonwebtoken');
const config = require('../config.js');

const checkToken = (req, res, next) => {

  let token =  req.headers['token'] || req.headers['authorization']

  if(!token){
    return res.status(401).json({status:"error", message:"Unauthorised"})
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.json({
          success: "error",
          message: 'Invalid Token'
        });
      }
      else {
        req.decoded = decoded;
        next();
      }
    });
  }
  else {
    return res.json({
      success: "error",
      message: 'Token is not supplied'
    });
  }
  //next()
};

module.exports = checkToken
