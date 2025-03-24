const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, required: true},
    username: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('User', UserSchema);