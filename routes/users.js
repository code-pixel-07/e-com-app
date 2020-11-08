var express = require('express');
const productHelpers = require('../db_helpers/product_helper')
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((Products) => {
    res.render('users/homepage', {Products, admin:false})
  }).catch((err) => {
    console.log(err);
  });
});

module.exports = router;
