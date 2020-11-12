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
        let productObj = {
            item: objectId(productId),
            quantity: 1
        }
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
                    productInfo: [productObj],
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
                // Now to increase the quantity of a product we need to check if the product exists in that cart
                // here findIndex() is used to find if an element exist in an array then return it's index value if it exists.

                let checkProductExistence = cartInfo.productInfo.findIndex(
                    // This line might cause an error
                    // exactly like item in item of foreach loop 
                    product => product.item == productId
                    // if this matches it will return the index Value
                )
                console.log(checkProductExistence);
                /* if the above log() returns -1 it means no product found and if it returns 0 it has found a product that matches the id that we passed with the one in the database */
                /* If the below condition is like 
                    checkProductExistence == 0 instead of checkProductExistence != -1
                    then a bug arises : only the first item that is added to the cart will get incremented other will never be incremented
                */
                if(checkProductExistence != -1) {
                    db.getdbState().collection(collections.CART_COLLECTION_NAME).updateOne(
                        {
                            'productInfo.item': objectId(productId)
                        },
                        
                        {
                            // to increment a value , here 1 is the increment controll value
                            // here $. is used because productInfo is an array
                            /* The problem caused if we don't use $.
                            
                            MongoError: Cannot create field 'quantity' in element {productInfo: [ { item: ObjectId('5fa7c5f040c4d71f149fff93'), quantity: 1 } ]}
                            */
                            $inc: {'productInfo.$.quantity': 1}
                        }
                        // here after updating the cart stuff we need to resolve it
                    ).then(() => {
                        resolve()
                    })
                } else {
                    // This is the case if a cart already exist
                    db.getdbState().collection(collections.CART_COLLECTION_NAME)
                    .updateOne({user_Id: objectId(userId)}, {$push:{productInfo: productObj}})
                    .then(() => {
                        resolve()
                    })
                }
            }

            // we have pushed the productId to the cart ...now we need to set/ push the quantity of that product
            // we have already made the cart object and added userId and productId (as an array). To this productId is where we need to store the quantity of that item. So we create another object for the items to store in the productId array.
            // see top!
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
                // New method as opposed to the below old method ie; the $lookup stuff
                {
                    $unwind: '$productInfo'
                },

                {
                    // now on the project object we need to extract the things that we need from the documtent
                    $project: {
                        item: '$productInfo.item',
                        quantity: '$productInfo.quantity'
                    }
                }, 

                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION_NAME,
                        // explanation for the below two lines is given in the below comment section
                        localField: 'item',
                        foreignField: '_id',
                        as: 'finalCartItem'
                    }
                }
                // {
                //     /*
                //     For reference: 
                //         from: <collection to join>,
                //         localField: <field from the input documents>,
                //         foreignField: <field from the documents of the "from" collection>,
                //         as: <output array field>
                //     */

                //     // To join two or more data in one or more collection 
                //     $lookup: {
                //         // // in from we need to pass the product_id key... because that is the document object from which we will get what all products the user has added to cart... that is their ids
                //         /*from: 'product_item',*/
                //         // here we don't need to set the product item like above because we have already defined it the dbCollection file
                //         from: collections.PRODUCT_COLLECTION_NAME,
                //         // here we are storing the productInfo recieved from the cart collection ie; the items user added to cart
                //         /* Quite didn't understand this line */
                //         let: {
                //             // here product_List is just a key variable and we are storing productInfo from the cart collection to it.
                //             product_List: '$productInfo'
                //         }, 
                //         // pipeline is where we write our conditions
                //         // cart collection (=====) product collection
                //         pipeline: [
                //             // now we need to match each product's id in the cart collection 
                //             {
                //                 $match: {
                //                     // since this is an arry we need to use an expression because the productId in cart collection is in the form of an array
                //                     $expr: {
                //                         /* This resembeles to the product's ID in product collection not the one in the cart collection */
                //                         // the first argument is the product id in product collection and the second one is the product id in the cart collection.
                //                         $in: ['$_id', '$$product_List']
                //                         // the above expression will match/check each product ID in the cart collection with the ID's in the product collection .
                                        
                //                         // important to understand
                //                     }
                //                 }
                //             }
                //         ],
                //         // now we have the productInfo compared and ready
                //         // now this productInfo has been combined with the productId of the product collection and the productId of the cart collection
                //         // here the value in as the name in which we want to store this combined/matched data
                //         as: 'finalCartItem'
                //     }
                // }
                // // didn't understand this part . we convert this to array because this is now in an object form? or do we purposefully need it in the form of an array?
                // // maybe due to the first reason.
            ]).toArray()
            console.log('before unwinding');
            console.log("_id 5fad2bd01adcad409cb34811 user_Id 5fa8f200971b3b15d4dab66b, productInfo [[Object], [Object], [Object], [Object], [Object]]");
            console.log('after unwinding productInfo has became an array');
            console.log('productInfo :');
            // console.log(cartItem[0].finalCartItem);
            resolve(cartItem)
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
                cartItemCount = userCart.productInfo.length
            } else {
                cartItemCount = 0
            }
            resolve(cartItemCount)
        })
    }
}