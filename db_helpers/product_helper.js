const db = require('../config/dbConnection')

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
    }

}