const Pool = require('pg').Pool;
const config = require('../config');

const pool = new Pool({
    user: config.db_username,
    host: config.db_host,
    database: config.db,
    password: config.db_password,
    port: config.db_port,
});

const getFeed = (req, res, next)=>{
  const data = []
  pool.query(`SELECT * FROM
      (SELECT id, created_at AS createdOn, title, image AS "article/url", owner AS authorId FROM gif
        UNION
      SELECT id, created_at AS createdOn, title, article AS "article/url", owner AS authorId FROM articles) AS feed
      ORDER BY feed.createdOn DESC
      `,
      (error, result)=>{
        if (error){
          console.log(error)
          console.log('here')
          return re.status(400).json({status:"error"})
        }
        console.log(result.rows)
        res.status(200).json({
          status:"Success",
          data:result.rows
        })
      })
}


module.exports={
  getFeed
}
