const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

router.get('/', videoController.getVideo);
router.post('/upload', videoController.uploadVideo);

module.exports = router;
