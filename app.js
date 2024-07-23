require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const emailValidator = require('email-validator');
const User = require('./models/User');
const Token = require('./models/Token');
const Video = require('./models/Video'); 
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

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
  cookie: { secure: false } // Use `true` if you have HTTPS enabled
}));

const isValidEmailDomain = (email) => {
  const allowedDomains = ['example.com', 'anotherdomain.com']; // Update this with actual allowed domains
  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
};

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/index');
  } else {
    res.redirect('/login');
  }
});

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
      return res.render('reset-password', { message: 'No account found with that email' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenDoc = new Token({ userId: user._id, token });
    await tokenDoc.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset',
      text: `Please reset your password by clicking the link: http://${req.headers.host}/reset-password/${token}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email send error:', error);
        return res.status(500).send('Error sending email');
      }
      res.render('reset-password', { message: 'Password reset link sent to your email' });
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const tokenDoc = await Token.findOne({ token });
    if (!tokenDoc) {
      return res.status(400).send('Invalid or expired token');
    }

    res.render('reset-password-form', { userId: tokenDoc.userId, token });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/reset-password-form', async (req, res) => {
  const { userId, token, password } = req.body;

  try {
    const tokenDoc = await Token.findOne({ userId, token });
    if (!tokenDoc) {
      return res.status(400).send('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });
    await Token.findByIdAndDelete(tokenDoc._id);

    res.redirect('/login');
  } catch (error) {
    console.error('Password reset form error:', error);
    res.status(500).send('Internal server error');
  }
});

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

app.get('/index', (req, res) => {
  if (req.session.user) {
    res.render('index', { username: req.session.user.username });
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to logout');
    }
    res.redirect('/login');
  });
});

app.use((req, res, next) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
