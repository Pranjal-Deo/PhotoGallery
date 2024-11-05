const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  inRecycleBin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Photo', photoSchema);
