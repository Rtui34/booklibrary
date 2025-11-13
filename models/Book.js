// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  // ISBN is required and must be unique
  isbn: { type: String, required: true, unique: true },
  year: Number,
  genre: String
});

// Ensure a unique index on isbn (non-sparse). Make sure DB is cleaned of null/empty or duplicates before creating.
bookSchema.index({ isbn: 1 }, { unique: true });

module.exports = mongoose.model('Book', bookSchema);