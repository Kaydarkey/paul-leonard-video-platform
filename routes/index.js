const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware to check if user is authenticated

// Controllers
const videoController = require('../controllers/videoController');

// Home page
router.get('/', mainController.getHomePage);

// Video page (only accessible if logged in)
router.get('/video', authMiddleware, videoController.getVideoPage);

// Account page (only accessible if logged in)
router.get('/account', authMiddleware, mainController.getAccountPage);

// Export the router
module.exports = router;
