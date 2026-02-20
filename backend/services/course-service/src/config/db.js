const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI||"mongodb+srv://iarrahou_db_user:uR5TwbEMqjCsMLEm@cluster0.bvcjxcn.mongodb.net/ent-est-sale");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
