const Pool = require('pg').Pool;
const config = require('../config');


const pool = new Pool({
    user: config.db_username,
    host: config.db_host,
    database: config.db,
    password: config.db_password,
    port: config.db_port,
});

//admin can create user
const createUser = (req, res, next)=>{
    if(!req.body){
        return res.status(400).json({status:"error", message:"Bad Request"})
    }
    const {firstName, lastName, email, password, gender, jobRole, department, address}=req.body

    pool.query(
        'INSERT INTO employees(firstname, lastname, email, password, gender, jobrole, department, address, is_admin)\
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)', 
        [firstName, lastName, email, password, gender, jobRole, department, address, false],
        (error, results)=>{
            if(error){
                throw error
            }
            res.status(201).json({
                status:'success',
                data:{
                    message:"user account successfully created",
                    token: "hjshdvcakjhdkjchajdhc",
                    userId: 1
                }
            })
        }
        )
}



module.exports = {
    createUser
}