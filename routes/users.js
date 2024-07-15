const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.redirect('/login');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.redirect('/login');
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.redirect('/login');
  }
  req.session.user = user;
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;

// Route for verifying account
router.get('/verify/:token', async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        { verificationToken: req.params.token },
        { $set: { verified: true, verificationToken: null } }
      );
      if (!user) {
        throw new Error('Invalid verification token');
      }
      res.redirect('/login');
    } catch (err) {
      res.status(400).send(err.message);
    }
  });
  
  // Route for sending password reset email
  router.post('/forgot-password', async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        throw new Error('User not found');
      }
      const token = generateToken(); // Implement a function to generate a unique token
      await sendPasswordResetEmail(user.email, token); // Implement a function to send the email
      await user.updateOne({ passwordResetToken: token });
      res.send('Password reset email sent');
    } catch (err) {
      res.status(400).send(err.message);
    }
  });
  
  // Route for resetting password
  router.post('/reset-password/:token', async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        { passwordResetToken: req.params.token },
        { $set: { password: req.body.password, passwordResetToken: null } }
      );
      if (!user) {
        throw new Error('Invalid password reset token');
      }
      res.send('Password reset successful');
    } catch (err) {
      res.status(400).send(err.message);
    }
  });
  