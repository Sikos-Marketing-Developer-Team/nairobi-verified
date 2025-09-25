const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImhhcmRjb2RlZC1hZG1pbi1pZCIsInJvbGUiOiJzdXBlcl9hZG1pbiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTc1NDAzNTkwNSwiZXhwIjoxNzU0NjQwNzA1fQ.dUVCf9Vn5ghqkd76VP_qMXjByD6XYksOumx6uLsVj3o';
const secret = 'mark1234';

try {
  const decoded = jwt.(token, secret);
  console.log('Token is valid:', decoded);
} catch (error) {
  console.log('Token verification failed:', error.message);
}