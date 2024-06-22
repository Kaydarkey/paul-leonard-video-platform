// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://<Kafui Darkey>:<YgHmWjLyPieHpbnM>@<https://cloud.mongodb.com/v2/66732ed4985e361c0318b36c#/metrics/replicaSet/66771912a6190e7a9a877263/explorer/paul-leonard-video-platform/videos/find>/<paul-leonard-video-platform>?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
