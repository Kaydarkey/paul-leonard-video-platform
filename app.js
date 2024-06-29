const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const emailValidator = require('email-validator'); // Add email-validator
const User = require('./models/User');
const Admin = require('./models/Admin');
const Video = require('./models/Video');
const ensureAdmin = require('./middlewares/adminAuth');
const app = express();
const PORT = process.env.PORT || 3001;


  mongoose.connect('mongodb://localhost:27017/paul-leonard-video-platform')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

// Ensure the upload directory exists
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

// Helper function to validate email domain
function isValidEmailDomain(email) {
  const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
  const domain = email.split('@')[1];
  return validDomains.includes(domain);
}

// Routes

// Signup Page
app.get('/', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).send('All fields are required');
    }
    if (!emailValidator.validate(email) || !isValidEmailDomain(email)) {
      return res.status(400).send('Invalid email or domain');
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
  res.render('login');
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send('Email and password are required');
    }
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = user;
      res.redirect('/index');
    } else {
      res.status(401).send('Invalid email or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Internal server error');
  }
});

// Admin Signup Page
app.get('/admin/signup', (req, res) => {
  res.render('admin/signup');
});

app.post('/admin/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate email domain
    if (!emailValidator.validate(email) || !isValidEmailDomain(email)) {
      return res.status(400).send('Invalid email or domain');
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
  res.render('admin/login');
});

app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log('Admin not found');
      return res.status(401).send('Invalid username or password');
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).send('Invalid username or password');
    }

    // Store the admin session and redirect to the dashboard
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
  res.render('reset-password');
});

// Server start
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

module.exports = app;
