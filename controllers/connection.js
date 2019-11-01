const Pool = require('pg').Pool;
const config = require('../config');


const pool = new Pool({
    user: config.db_username,
    host: config.db_host,
    database: config.db,
    password: config.db_password,
    port: config.db_port,
});

module.exports = {
    pool
}