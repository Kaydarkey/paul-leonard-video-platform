const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
});

module.exports = mongoose.model('Video', videoSchema);
