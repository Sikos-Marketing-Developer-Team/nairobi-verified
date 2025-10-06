const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('./models/User');
  
  // Clean up and create test user
  await User.deleteOne({ email: 'simple-test@example.com' });
  const user = await User.create({
    firstName: 'Simple',
    lastName: 'Test', 
    email: 'simple-test@example.com',
    phone: '1234567890',
    password: 'Password123!'
  });
  console.log('User created:', user.email);
  
  // Now call forgot password API
  console.log('Calling forgot password API...');
  const axios = require('axios');
  try {
    const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
      email: 'simple-test@example.com'
    });
    console.log('API Response:', response.data);
    
    // Check if token was created
    const updatedUser = await User.findOne({ email: 'simple-test@example.com' });
    console.log('User has reset token:', !!updatedUser.resetPasswordToken);
    console.log('Token expiry:', updatedUser.resetPasswordExpire ? new Date(updatedUser.resetPasswordExpire).toISOString() : 'None');
    
  } catch (error) {
    console.error('API Error:', error.message);
  }
  
  await User.deleteOne({ email: 'simple-test@example.com' });
  await mongoose.disconnect();
})();