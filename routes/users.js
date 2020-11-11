const { response } = require('express');
var express = require('express');
const productHelpers = require('../db_helpers/product_helper')
const userHelpers = require('../db_helpers/user_helpers')
var router = express.Router();

// middleware to check login status
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET users listing. */
router.get('/', (req, res) => {
  // to change/ update the content in the user page or homepage if the use has loggedIn, we need to first check if the user has loggedIn successfully
  let userLoginStatus = req.session.userInfo;
  let checkLoggedInStatus = req.session.loggedIn;
  // changeLoggedInStatus = false
  // Here checkUserLoginStatus will be null if the user has not loggedIn ... else it will have the value; And we can pass this value to the render function so that we can extract required data from it to display it on the homepage.
  // console.log(`session info : ${userLoginStatus}`);
  productHelpers.getAllProducts().then((Products) => {
    res.render('users/homepage', {Products, userLoginStatus, checkLoggedInStatus})
  }).catch((err) => {
    console.log(err);
  });
});

router.get('/signup', (req, res) => {
  res.render('users/signup')
})

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    // if user had signed up ... that means he has also in other words loggedIn
    req.session.loggedIn = true
    req.session.userInfo = response
    res.redirect('/')
  })
  // res.send('<h1>Account created successfully</h1>')
})

router.get('/login', (req, res) => {
  // if the user has already logged in and if he tries to go back, he should'nt go back to the login form, instead we need to redirect the user to the homepage itself
  if(req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('users/login', { "loginErr": req.session.loginErr})
    // if it has already been passed or checked
    req.session.loginErr = false
  }
})

router.post('/login', (req, res) => {
  // Here we need to authenticate the user
  userHelpers.doLogin(req.body).then((result) => {
    if(result.userIsLogged) {
      // if the user has successfully logged in then we need to set the session for the user
      req.session.loggedIn = true;
      req.session.userInfo = result.userInfo
      // console.log(req.session);
      res.redirect('/')
    } else {
      // now we need to throw an error message if the user tries to login with invalid credentials
      req.session.loginErr = "Invalid Credentials.Try again or click forgot password."
      res.redirect('/login')
      console.log('Authentication failed');
    }
  })
  // res.send('login successfull')
})

router.get('/logout', (req, res) => {
  // for logging out , we firstly need to destroy our session info
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart', verifyLogin, (req, res, next) => {
    res.render('users/userCart')
})

router.get('/cart-items/:product_id', verifyLogin, (req, res) => {
  let productId = req.params.product_id
  // console.log(req.session.userInfo);
  // the first parameter passes the info of the product to be added to the cart
  // the second parameter is to pass the unique id of the user
  /* here userInfo will throw an error if we forgot to verify that the user's session exist or in short the user has logged in. 
    for this purpose we need to pass the middleware to the get request to /cart-items
    so even if a user logs out from an account that's already loggedin ... the user will be redirected to the login page.
  */
  userHelpers.addToCart(productId, req.session.userInfo._id).then(() => {
    res.redirect('/')
  })
})

router.get('/orders', (req, res) => {
  res.send('orders page')
})

module.exports = router;
