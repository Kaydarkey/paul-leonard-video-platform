// routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

router.get('/login', (req, res) => {
    res.render('admin/login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (admin) {
        const match = await bcrypt.compare(password, admin.password);
        if (match) {
            req.session.admin = admin;
            return res.redirect('/admin/dashboard');
        }
    }
    res.redirect('/admin/login');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// routes/admin.js (continuation)
const ensureAdmin = require('../middlewares/adminAuth');

router.get('/dashboard', ensureAdmin, (req, res) => {
    res.render('admin/dashboard');
});

// routes/admin.js (continuation)
const multer = require('multer');
const path = require('path');
const Video = require('../models/Video');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/videos/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.post('/upload-video', ensureAdmin, upload.single('video'), async (req, res) => {
    const { title, description } = req.body;
    const video_path = req.file.path;
    const newVideo = new Video({ title, description, video_path });
    await newVideo.save();
    res.redirect('/admin/dashboard');
});


module.exports = router;
