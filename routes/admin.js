var express = require('express');
const productHelpers = require('../db_helpers/product_helper')
var router = express.Router();

/* GET home page. */
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
  res.render('admin/view_products', {Products, admin:true})
});

router.get('/add-products', (req, res) => {
  res.render('admin/add_products')
});

router.post('/add-product', (req, res) => {
  console.log(req.body);
  console.log(req.files.image);
  // Here the 2nd parameter is a callback function and it works when the product data has successfully reached the server
  // Also the callback has access to the id parameter and req.body is passed from here to addProduct function
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image;
    // Here mv() is a funtion written the fileupload Module. We created a middleware for this in app.js
    console.log(id);
    image.mv(`./public/images/product_images/${id}.jpg`, (err) => {
      if(!err) {
        res.render('admin/add_products')
        return;
      } else {
        console.log(err);
      }
    })
  })
  res.send('Product added successfully')
})


module.exports = router;
