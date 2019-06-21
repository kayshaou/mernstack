const mongoose = require('mongoose');
const config = require('config'); //require config file
const db = config.get('mongoURI');


const connectDB = async () => {
    try{
        await mongoose.connect(db, {
            useNewUrlParser: true, useFindAndModify: true
        });
        console.log('> MongoDB connected');
    } catch(Error){
        console.error(Error.message);
        process.exit(1);
    }
}

module.exports = connectDB;

