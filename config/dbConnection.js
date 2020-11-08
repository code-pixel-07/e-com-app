const mongo = require('mongodb').MongoClient;

const dbState = {
    db: null,
}

module.exports.dbConnect = (callback) => {
    // To establish a connection we need two main things ; 
    //a url to the mongodriver, a database (more accurately a database name)
    const url = 'mongodb://localhost:27017'
    const dbName = 'e-cartdb'

    // creating connection with the database using mongoclient 
    /* Have doubt on this block of code
        // 1)return callback(err)
        2)data.db
        3)callback()
    */
    // Here the above function(callback) has access to err and data ie; callback(err, data)     
    mongo.connect(url, (err, data) => {
        if(err) {
            return callback(err);
        } else {
            dbState.db = data.db(dbName)
        }
        callback()
    })

}

module.exports.getdbState = () => {
    return dbState.db
}

// module.exports = dbConnect;
// module.exports = getdbState;