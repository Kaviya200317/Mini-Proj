const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  name: String,
  age: Number,
  description: String,
  imagePath: String
});

const Child = mongoose.model('Child', childSchema);

module.exports = Child;