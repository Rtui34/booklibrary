const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true },
  publishYear: { type: Number },
  status: { 
    type: String, 
    enum: ['Available', 'Borrowed'], 
    default: 'Available' 
  }
});

module.exports = mongoose.model('Book', bookSchema);