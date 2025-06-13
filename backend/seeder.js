const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Load models
const Merchant = require('./models/Merchant');
const User = require('./models/User');
// If you have a Product model and schema, uncomment the line below
// const Product = require('./models/Product'); 

// Connect to DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

// Read JSON files (replace with actual data from frontend components)
const merchants = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data', 'merchants.json'), 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data', 'users.json'), 'utf-8')
);
// If you have a Product model and corresponding JSON data, uncomment the line below
// const products = JSON.parse(
//   fs.readFileSync(path.join(__dirname, '_data', 'products.json'), 'utf-8')
// );

// Convert string IDs to ObjectIds
const convertToObjectIds = (data) => {
  return data.map(item => ({
    ...item,
    _id: new mongoose.Types.ObjectId(item._id)
  }));
};

// Import into DB
const importData = async () => {
  try {
    await connectDB();

    await Merchant.deleteMany();
    await User.deleteMany();
    // If you have a Product model, uncomment the line below
    // await Product.deleteMany();

    const merchantsWithObjectIds = convertToObjectIds(merchants);
    const usersWithObjectIds = convertToObjectIds(users);

    // Hash passwords for users before inserting
    for (let i = 0; i < usersWithObjectIds.length; i++) {
      const user = usersWithObjectIds[i];
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }

    await Merchant.insertMany(merchantsWithObjectIds);
    await User.insertMany(usersWithObjectIds);
    // If you have a Product model, uncomment the line below
    // await Product.insertMany(products);

    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await connectDB();

    await Merchant.deleteMany();
    await User.deleteMany();
    // If you have a Product model, uncomment the line below
    // await Product.deleteMany();

    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} 