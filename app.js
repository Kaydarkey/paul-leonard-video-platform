require('dotenv').config();

// Required libraries
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const emailValidator = require('email-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('./models/User');
const Admin = require('./models/Admin');
const Video = require('./models/Video');
const ensureAdmin = require('./middlewares/adminAuth');

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware Configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: mongoURI,
    collectionName: 'sessions'
  }),
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Upload directory
const uploadDir = path.join(__dirname, 'uploads', 'videos');
fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Helper functions
function isValidEmailDomain(email) {
  const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
  const domain = email.split('@')[1];
  return validDomains.includes(domain);
}

function isValidPassword(password) {
  // The password should have at least one uppercase letter, one symbol, and one digit
  return /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d).{8,}$/.test(password);
}

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Routes and Route Handlers

// Home Page Route
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/index');
  } else {
    res.redirect('/signup');
  }
});

// Signup Page
app.get('/signup', (req, res) => {
  res.render('signup', { message: null });
});

app.post('/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.render('signup', { message: 'All fields are required' });
    }
    if (!emailValidator.validate(email) || !isValidEmailDomain(email)) {
      return res.render('signup', { message: 'Invalid email or domain' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).send('Internal server error');
  }
});

// Login Page
app.get('/login', (req, res) => {
  res.render('login', { message: null });
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render('login', { message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = user;
      res.redirect('/index');
    } else {
      res.render('login', { message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Internal server error');
  }
});

// Admin Signup Page
app.get('/admin/signup', (req, res) => {
  res.render('admin/signup', { message: null });
});

app.post('/admin/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!emailValidator.validate(email) || !isValidEmailDomain(email)) {
      return res.render('admin/signup', { message: 'Invalid email or domain' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, username, password: hashedPassword });
    await newAdmin.save();
    res.redirect('/admin/login');
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).send('Internal server error');
  }
});

// Admin Login Page
app.get('/admin/login', (req, res) => {
  res.render('admin/login', { message: null });
});

app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.render('admin/login', { message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.render('admin/login', { message: 'Invalid username or password' });
    }

    req.session.admin = admin;
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).send('Internal server error');
  }
});

// Admin Dashboard
app.get('/admin/dashboard', ensureAdmin, (req, res) => {
  res.render('admin/dashboard');
});

app.post('/admin/upload-video', ensureAdmin, upload.single('video'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const video_path = req.file.path;
    const newVideo = new Video({ title, description, video_path });
    await newVideo.save();
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).send('Internal server error');
  }
});

// Index Page
app.get('/index', (req, res) => {
  if (req.session.user) {
    res.render('index', { username: req.session.user.username });
  } else {
    res.redirect('/login');
  }
});

// Video Page
app.get('/video', async (req, res) => {
  try {
    if (req.session.user) {
      const videos = await Video.find({});
      const videoIndex = req.query.index ? parseInt(req.query.index) : 0;
      const video = videos[videoIndex];
      const hasPrev = videoIndex > 0;
      const hasNext = videoIndex < videos.length - 1;
      const prevVideoId = hasPrev ? videoIndex - 1 : null;
      const nextVideoId = hasNext ? videoIndex + 1 : null;
      res.render('video', { video, hasPrev, hasNext, prevVideoId, nextVideoId });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.error('Video error:', error);
    res.status(500).send('Internal server error');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Route for forgot password
app.get('/reset-password', (req, res) => {
  res.render('reset-password', { message: null });
});

app.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!emailValidator.validate(email) || !isValidEmailDomain(email)) {
      return res.render('reset-password', { message: 'Invalid email or domain' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('reset-password', { message: 'User not found' });
    }

    // Generate password reset token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    const resetUrl = `http://${req.headers.host}/reset-password/${token}`;
    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    await transporter.sendMail(mailOptions);
    res.render('reset-password', { message: 'An email has been sent to ' + email + ' with further instructions.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('reset-password', { message: 'Password reset token is invalid or has expired.' });
    }

    res.render('reset-password-form', { token: req.params.token });
  } catch (error) {
    console.error('Reset password token error:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;

    if (!isValidPassword(password)) {
      return res.render('reset-password-form', { message: 'Invalid password format.', token: req.params.token });
    }

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('reset-password', { message: 'Password reset token is invalid or has expired.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.redirect('/login');
  } catch (error) {
    console.error('Reset password post error:', error);
    res.status(500).send('Internal server error');
  }
});

// Server start
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});


