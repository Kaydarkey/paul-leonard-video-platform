/*const Video = require('../models/Video');

exports.getVideo = async (req, res) => {
  const videoId = req.query.videoId || (await Video.findOne())._id;
  const video = await Video.findById(videoId);
  const videos = await Video.find();
  const videoIndex = videos.findIndex(v => v._id.toString() === videoId);
  res.render('video', {
    video,
    hasPrev: videoIndex > 0,
    hasNext: videoIndex < videos.length - 1,
    prevVideoId: videoIndex > 0 ? videos[videoIndex - 1]._id : null,
    nextVideoId: videoIndex < videos.length - 1 ? videos[videoIndex + 1]._id : null,
  });
};

exports.uploadVideo = async (req, res) => {
  const { title, description, url } = req.body;
  const video = new Video({ title, description, url });
  await video.save();
  res.redirect('/admin-upload');
};
*/
// controllers/videoController.js

exports.getVideoPage = (req, res) => {
    // Fetch video data from the database or a video service
    const videoData = {
        title: 'Sample Video',
        description: 'This is a sample video.',
        url: 'path/to/video.mp4'
    };
    res.render('video', { title: 'Video Page', video: videoData });
};

