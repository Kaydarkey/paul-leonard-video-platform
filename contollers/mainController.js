// controllers/mainController.js

exports.getHomePage = (req, res) => {
    const username = req.session.username || 'Guest';
    res.render('index', { title: 'Home', message: `Welcome, ${username}` });
};

exports.getAccountPage = (req, res) => {
    const username = req.session.username;
    res.render('account', { title: 'Account', username });
};
