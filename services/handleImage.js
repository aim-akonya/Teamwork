const fs = require('fs')

const base64_decode = (base64str, file)=>{

  fs.writeFileSync(file, base64str, {encoding:'base64'}, (err)=>{
    if(err){
      throw err
    }
    console.log('file created')
  });

}

module.exports = base64_decode
