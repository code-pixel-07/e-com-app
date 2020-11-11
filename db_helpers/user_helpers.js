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

    getCartItems: (userId) => {
        return new Promise(async (resolve, reject) => {
            // here we use a new method called agregate. The purpose of this in this case; is to firstly find the product_id from the cart collection (because the product_id has the information about that product) then with that product_id we need to get the productInfo that is in the product collection
            // so in short agregate() is used to do a process that involves getting data from two or more collections
            let cartItem =await db.getdbState().collection(collections.CART_COLLECTION_NAME).aggregate([
                // here we need to specify which document we need to get first from cart collection
                /* explanition: In cart collection each user has each document so we need to find the document that matches the user with that specific user id */
                {
                    $match:{user_Id: objectId(userId)}
                },
                {
                    /*
                    For reference: 
                        from: <collection to join>,
                        localField: <field from the input documents>,
                        foreignField: <field from the documents of the "from" collection>,
                        as: <output array field>
                    */

                    // To join two or more data in one or more collection OR document |Doubt|
                    $lookup: {
                        // in from we need to pass the product_id key... because that is the document object from which we will get what all products the user has added to cart... that is their ids
                        /*from: 'product_item',*/
                        // here we don't need to set the product item like above because we have already defined it the dbCollection file
                        from: collections.PRODUCT_COLLECTION_NAME,
                        // here we are storing the productInfo recieved from the cart collection ie; the items user added to cart
                        /* Quite didn't understand this line */
                        let: {
                            // here products is just a key variable and we are storing productInfo from the cart collection to it.
                            product_List: '$product_item'
                        }, 
                        // pipeline is where we write our conditions
                        pipeline: [
                            // now we need to match each product's id in the cart collection 
                            {
                                $match: {
                                    // since this is an arry we need to use an expression because the productId in cart collection is in the form of an array
                                    $expr: {
                                        /* This resembeles to the product's ID in product collection not the one in the cart collection */
                                        $in: ['$_id', '$$product_List']
                                        // the above expression will match/check each product ID in the cart collection with the ID's in the product collection .
                                        // important to understand
                                    }
                                }
                            }
                        ],
                        // now we have the productInfo compared and ready
                        // now this productInfo has been combined with the productId of the product collection and the productId of the cart collection
                        // here the value in as the name in which we want to store this combined/matched data
                        as: 'finalCartItem'
                    }
                }
                // didn't understand this part . we convert this to array because this is now in an object form? or do we purposefully need it in the form of an array?
                // maybe due to the first reason.
            ]).toArray()

            resolve(cartItem[0].finalCartItem)
        })
    },

    getCartItemCount: (userId) => {
        // here we need to get the product info [the number of products in that product_item array] of a user from the cart collection
        return new Promise(async (resolve, reject) => {
            // before that we need to check if that user has a cart
            // initially the cart count is set to 0
            let cartItemCount = 0
            let userCart =await db.getdbState().collection(collections.CART_COLLECTION_NAME).findOne({user_Id: objectId(userId)})
            if(userCart) {
                cartItemCount = userCart.product_item.length
            } else {
                cartItemCount = 0
            }
            resolve(cartItemCount)
        })
    }
}