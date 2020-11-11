const db = require('../config/dbConnection')
const collections = require('../config/dbCollections')
const bcrypt = require('bcrypt');
// const { USER_COLLECTION_NAME } = require('../config/dbCollections');
const objectId = require('mongodb').ObjectID

module.exports = {
    // here userData has access to req.body
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            // console.log(userData)
            userData.password = await bcrypt.hash(userData.password, 10);
            // just because i misspelled .collection as . collections the program executed with an 'unhandledPromiseRejection Typerror'
            db.getdbState().collection(collections.USER_COLLECTION_NAME).insertOne(userData)
            .then((data) => {
                // This show the result after signup
                // console.log(data);
                resolve(data.ops[0])
            })
        })
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            // first we need to get the user details for authentication
            // Here we are checking if the user has logined with the same email that he used for signup
            let userInfo = await db.getdbState().collection(collections.USER_COLLECTION_NAME).findOne({email: userData.email})
            if(userInfo) {
                bcrypt.compare(userData.password, userInfo.password).then((result) => {
                    if(result) {
                        // userIsLogged = true
                        response.userInfo = userInfo;
                        response.userIsLogged = true
                        resolve(response)
                        console.log('Passwords match');
                        console.log('user Authenticated. Login successful');
                    } else {
                        console.log("Passwords doesn't match");
                        console.log('user not Authenticated. Login failed');
                        resolve({ userIsLogged: false})
                    }
                })
            } else {
                console.log('Email not found');
                resolve({ userIsLogged: false})
            }
        })
    },

    addToCart: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            // let productInfo =await db.getdbState().collection(collections.PRODUCT_COLLECTION_NAME).findOne({_id: objectId(productId)})
            // let userInfo = await db.getdbState().collection(collections.USER_COLLECTION_NAME).findOne({_id: objectId(userId)})
            // here we are finding out if the user already has a cart by using 
            let cartInfo = await db.getdbState().collection(collections.CART_COLLECTION_NAME).findOne({user_Id: objectId(userId)})
            if(!cartInfo) {
                // The cart should have productId and userId so we create an object to store it
                let cartObj = {
                    user_Id: objectId(userId),
                    // we need an array to store projects because projects are always being added to the cart
                    product_item: [objectId(productId)],
                }
                // now we need to store this cartObj to the database as an object
                // we need not need to specify the data as objects as object in insertOne function because we have already created a parent object which contains the data to be stored
                db.getdbState().collection(collections.CART_COLLECTION_NAME).insertOne(cartObj)
                .then((data) => {
                    // E-code
                    console.log(data.ops[0]);
                    resolve();
                })
            } else {
                db.getdbState().collection(collections.CART_COLLECTION_NAME)
                .updateOne({user_Id: objectId(userId)}, {$push:{product_item: objectId(productId)}})
                .then((result) => {
                    resolve()
                })
            }
        })
    },
}