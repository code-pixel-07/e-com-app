var express = require('express');
const productHelpers = require('../db_helpers/product_helper')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((Products) => {
    res.render('admin/view_products', {Products, admin:true})
  }).catch((err) => {
    console.log(err);
  });
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
  // res.send('Product added successfully')
  res.redirect('/admin')
})

router.get('/delete-product/:product_id', (req, res) => {
  let productId = req.params.product_id
  console.log(productId)
  productHelpers.deleteProduct(productId).then((result) => {
    if(result) {
      res.redirect('/admin')
      console.log('Product Deleted Successfully')
    } else {
      console.log('Unable to delete product');
    }
  })
})

router.get('/edit-product/:product_Id', async (req, res) => {
  let productId = req.params.product_Id
  // console.log(productId)
  let productInfo = await productHelpers.getProductInfo(productId)
  console.log(productInfo)
  res.render('admin/edit_product', {productInfo})
})

router.post('/edit-product/:product_id', (req, res) => {
  productHelpers.updateProduct(req.params.product_id, req.body).then((result) => {
    console.log(result);
    res.redirect('/admin')
    if(req.files.image) {
      let image = req.files.image
      image.mv(`./public/images/product_images/${req.params.product_id}.jpg`)
    }
  })
})


module.exports = router;
