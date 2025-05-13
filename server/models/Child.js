const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imagePath: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Child = mongoose.model('Child', childSchema);

module.exports = Child;