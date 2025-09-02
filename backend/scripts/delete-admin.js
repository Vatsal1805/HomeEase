const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function deleteAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin
    await User.deleteOne({ email: 'admin@homeease.com' });
    console.log('Deleted existing admin');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteAdmin();
