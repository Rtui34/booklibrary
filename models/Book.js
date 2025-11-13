// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String },
  year: Number,
  genre: String
});

module.exports = mongoose.model('Book', bookSchema);