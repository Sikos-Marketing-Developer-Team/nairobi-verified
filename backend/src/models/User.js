// User Model Schema
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, required: true },
  password: {type: String, required: true, minlength: 8},
  displayName: { type: String, required: true },
  photo: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
