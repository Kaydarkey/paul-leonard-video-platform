const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware to check if user is authenticated

// Controllers
const mainController = require('../controllers/mainController');
const videoController = require('../controllers/videoController');

// Home page
router.get('/', mainController.getHomePage);

// Video page (only accessible if logged in)
router.get('/video', authMiddleware, videoController.getVideoPage);

// Account page (only accessible if logged in)
router.get('/account', authMiddleware, mainController.getAccountPage);


// routes/index.js
const express = require('express');
const Video = require('../models/Video');

router.get('/video/:id', async (req, res) => {
    const video = await Video.findById(req.params.id);
    if (!video) {
        return res.status(404).send('Video not found');
    }
    res.render('video', { video });
});

module.exports = router;



// Export the router
module.exports = router;
