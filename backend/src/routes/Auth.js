const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { login, signUp, logout } = require('../controllers/authController');

// Google Auth (Sessions)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: true }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }), (req, res) => res.redirect(`${process.env.FRONTEND_URL}/dashboard`));
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) { // Google session
    return res.json({ id: req.user._id, email: req.user.email, displayName: req.user.displayName, photo: req.user.photo });
  }
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    User.findById(decoded.userId).then(user => {
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ id: user._id, email: user.email, username: user.username });
    });
  });
});

// Local Auth + Others
router.post('/login', login);
router.post('/signup', signUp);
router.post('/logout', logout);


module.exports = router;