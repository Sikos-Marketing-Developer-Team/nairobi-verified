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

const { PASSWORD_VALIDATION } = require('./backend/config/constants');

console.log('Testing password generation:');
for (let i = 0; i < 5; i++) {
  const password = generateSecurePassword();
  const isValid = PASSWORD_VALIDATION.REGEX.test(password);
  console.log(`Password ${i + 1}: ${password} (valid: ${isValid})`);
}