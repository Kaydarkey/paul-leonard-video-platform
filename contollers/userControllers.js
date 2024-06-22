const User = require('../models/User');

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  const user = new User({ email, password, username: email.split('@')[0] });
  await user.save();
  res.redirect('/login');
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    req.session.user = user;
    res.redirect('/index');
  } else {
    res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};
