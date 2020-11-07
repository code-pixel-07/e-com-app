var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const Products = [
    {
      name:'Redmi Note 9 pro',
      categoty:'Smartphones',
      description:'Lorem ipsum dolor sit amet, adipisicing elit. Maxime quia voluptatum ab.',
      image:'https://images-na.ssl-images-amazon.com/images/I/81mtDLql%2BXL._SX342_.jpg'
    },
    {
      name:'Realme Narzo',
      categoty:'Smartphones',
      description:'Lorem ipsum dolor sit amet, adipisicing elit. Maxime quia voluptatum ab.',
      image:'https://images-na.ssl-images-amazon.com/images/I/71bp9IpcK-L._SX679_.jpg'
    },
    {
      name:'Vivo X50 Pro',
      categoty:'Smartphones',
      description:'Lorem ipsum dolor sit amet, adipisicing elit. Maxime quia voluptatum ab.',
      image:'https://images-na.ssl-images-amazon.com/images/I/71hrhKdmwDL._SX522_.jpg'
    },
    {
      name:'HP Pavilion gaming laptop',
      categoty:'Laptops',
      description:'Lorem ipsum dolor sit amet, adipisicing elit. Maxime quia voluptatum ab.',
      image:'https://images-na.ssl-images-amazon.com/images/I/81pezrPSgOL._SX569_.jpg'
    },
  ]
  res.render('index', {Products, admin:false});
});

module.exports = router;
