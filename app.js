const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Video = require('./models/Video');
const app = express();
const PORT = process.env.PORT || 3001;

mongoose.connect('mongodb://localhost:27017/paul-leonard-video-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

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
      res.render('video', { video, videoIndex, videoCount: videos.length });
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
  // Render the reset password page
  res.render('reset-password');
});

// Route for signup
app.get('/signup', (req, res) => {
  // Render the signup page
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).send('Error signing up. Please ensure your email and password meet the requirements.');
  }
});




// Server start
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

module.exports = app;
