const db = require('../config/dbConnection')
const collections = require('../config/dbCollections')
const bcrypt = require('bcrypt');
// const { USER_COLLECTION_NAME } = require('../config/dbCollections');

module.exports = {
    // here userData has access to req.body
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            console.log(userData)
            userData.password = await bcrypt.hash(userData.password, 10);
            // just because i misspelled .collection as . collections the program executed with an 'unhandledPromiseRejection Typerror'
            db.getdbState().collection(collections.USER_COLLECTION_NAME).insertOne(userData)
            .then((data) => {
                // This show the result after signup
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
    }
}