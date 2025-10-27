#!/usr/bin/env node

// Test the password generation function
const generateSecurePassword = () => {
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*';
  
  // Ensure at least one character from each required category
  let password = '';
  password += upperCase[Math.floor(Math.random() * upperCase.length)];
  password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  
  // Fill remaining 8 characters randomly from all categories
  const allChars = upperCase + lowerCase + numbers + specialChars;
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to randomize character positions
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

// Test the password validation regex
const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

console.log('🔐 Testing Password Generation Function\n');

// Generate and test 5 passwords
for (let i = 1; i <= 5; i++) {
  const testPassword = generateSecurePassword();
  const isValid = regex.test(testPassword);
  console.log(`Password ${i}: ${testPassword}`);
  console.log(`Length: ${testPassword.length}`);
  console.log(`Meets requirements: ${isValid ? '✅' : '❌'}`);
  console.log('---');
}

console.log('\n✅ Password generation test complete');