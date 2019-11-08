
const imageVal = require('./image');
//employee account creation and signin data
exports.defaultUser = {
  firstname:'mike',
  lastname:'akonya',
  gender:'M',
  email:'mike@mail.com',
  password: 'mike123',
  jobrole:'developer',
  department:'development',
  address:'123 jw street',
  is_admin: true
}

exports.testUser1 = {
  firstname:'Jane',
  lastname:'Janice',
  gender:'Female',
  email:'jane@mail.com',
  password: 'jane123',
  jobrole:'developer',
  department:'development',
  address:'123 jw street',
  is_admin: false
}

//test image object
exports.image={
  image:imageVal.encodedImage,
  title:'Sample image'
}

//sample article
exports.testArticle = {
  title: 'The fall of the race',
  article:'some interesting article'
}
