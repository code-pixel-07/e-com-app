const { PRODUCT_COLLECTION_NAME } = require('../config/dbCollections');
const db = require('../config/dbConnection')
const collections = require('../config/dbCollections')
const objectId = require('mongodb').ObjectID

module.exports = {
    // This callback is triggerd when an action is completed... In this case it wait for the product to be added then start it's process
    addProduct: (product_info, callback) => {
        console.log(product_info);
        // we use then here because the database is already using promise
        // Here the result parameter in the then block has access to the submitted form-data it works on the basis of product_info and this product_info has access the req.body
        db.getdbState().collection('products').insertOne(product_info).then((result) => {
            // console.log(result.ops[0]._id);
            callback(result.ops[0]._id)
        }).catch((err) => {
            console.log(err)
        });
    }, 

    // code to display data from database
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            // we need to recieve the products as an Array so we use .toArray at last
            // we use await because we need to fitst get the data from the database then resolve it
            let products = await db.getdbState().collection(collections.PRODUCT_COLLECTION_NAME).find().toArray()
            resolve(products)
        })
    }, 

    // code to delete a product from the database
    deleteProduct: (productToDeleteIdInfo) => {
        let productIsDeleted = false
        // // we won't need to use the above statement because we are calling the then method here itself ... and this then method will have the true case code
        return new Promise(async (resolve, reject) => {
            let productToDelete = await db.getdbState().collection(collections.PRODUCT_COLLECTION_NAME).removeOne({ _id: objectId(productToDeleteIdInfo)})
                console.log(productToDelete)
                // console.log(response);
                productIsDeleted = true
                resolve(productIsDeleted)
        })
    }

}