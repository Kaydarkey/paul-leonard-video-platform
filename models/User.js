const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Regex to validate common email structures
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Regex to ensure the password contains at least one uppercase letter, one symbol, and is not similar to the username
        return /^(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(v) && !v.includes(this.username);
      },
      message: props => 'Password must contain at least one uppercase letter, one symbol, and should not be similar to the username!'
    }
  }
});

module.exports = mongoose.model('User', userSchema);
