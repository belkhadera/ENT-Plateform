const mongoose = require('mongoose');

const connectDB = async () => {

    const conn = await mongoose.connect("mongodb://admin:admin123@mongodb:27017/auth_db?authSource=admin")
    .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

    
  
};

module.exports = connectDB;
