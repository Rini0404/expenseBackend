const mongoose = require('mongoose');
const DB_URI = "mongodb://admin:password@mongo.devusol.net/test-users";

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("MongoDB Connected...");
        return mongoose.connection;
        
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
};
const dbConnection = connectDB();
//console.log(dbConnection)
module.exports = dbConnection;



// mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// const connection = mongoose.connection;
// module.exports = connection;