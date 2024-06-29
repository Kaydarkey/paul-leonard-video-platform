// middlewares/adminAuth.js

function ensureAdmin(req, res, next) {
    if (req.session.admin) {
      return next();
    }
    res.redirect('/admin/login');
  }
  
  module.exports = ensureAdmin;
  