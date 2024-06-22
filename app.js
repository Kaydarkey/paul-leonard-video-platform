const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const videoRoutes = require('./routes/videos');

mongoose.connect('mongodb://localhost:27017/video-platform', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

app.use('/', userRoutes);
app.use('/videos', videoRoutes);

app.get('/index', (req, res) => {
  if (req.session.user) {
    res.render('index', { username: req.session.user.username });
  } else {
    res.redirect('/login');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
