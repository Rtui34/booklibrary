require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const app = express();

// === MongoDB Atlas ===
// Ensure dotenv is loaded before attempting to connect
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI not set in environment. Set it in a .env file or environment variables.');
  process.exit(1);
}

console.log('Attempting MongoDB connect to:', process.env.MONGODB_URI);
console.log('Mongoose initial readyState=', mongoose.connection.readyState);
mongoose.connect(process.env.MONGODB_URI, { dbName: 'booklib', serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    console.log('Mongoose readyState after connect.then=', mongoose.connection.readyState);
    // Start server only after successful DB connection
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Mongoose readyState at server start=', mongoose.connection.readyState);
    });
  })
  .catch(err => {
    console.error('DB Connection Error (connect.catch):', err && err.message ? err.message : err);
    // Do not exit immediately here to allow diagnostic handlers to report; still exit after short delay
    setTimeout(() => process.exit(1), 1000);
  });

// Mongoose connection event diagnostics
mongoose.connection.on('connected', () => {
  console.log('Mongoose event: connected. readyState=', mongoose.connection.readyState);
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose event: error', err && err.message ? err.message : err);
});
mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose event: disconnected');
});

// === Middleware ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'fallback_key'],
  maxAge: 24 * 60 * 60 * 1000,
  secure: false,
  httpOnly: true
}));

// === Models ===
let User, Book;
try {
  User = require('./models/User');
  Book = require('./models/Book');
} catch (err) {
  console.error('Failed to load models:', err);
  process.exit(1);
}

// === Auth Middleware ===
const requireAuth = (req, res, next) => {
  // Diagnostic logging to help trace 401/unauthorized issues
  if (req.session && req.session.userId) return next();

  console.warn('Unauthorized request:', {
    path: req.path,
    method: req.method,
    cookies: req.headers.cookie || null,
    ip: req.ip
  });

  // If it's an API call, send 401 JSON. For normal page requests, redirect to login.
  if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.redirect('/login');
};

// === ROUTES ===
app.get('/', (req, res) => res.redirect('/login'));

app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new Error('Username and password required');
    const hashed = await bcrypt.hash(password, 10);
    const createdUser = await User.create({ username, password: hashed });
    // auto-login after successful registration
    req.session.userId = createdUser._id;
    // Diagnostics: print session and Set-Cookie header (if available)
    console.log('Register success:', { username: createdUser.username, userId: createdUser._id });
    console.log('Session after register:', req.session);
    const setCookie = res.getHeader && res.getHeader('Set-Cookie');
    console.log('Set-Cookie header (register):', setCookie || '<not-present-yet>');
    // If debug flag is present, return JSON so tests can inspect the session and headers
    if (req.query && (req.query.debug === '1' || req.query.debug === 'true')) {
      // Note: res.getHeader may not show signed cookie until headers are flushed, but include whatever is available
      return res.json({ createdUser: { username: createdUser.username, id: createdUser._id }, session: req.session, setCookie: setCookie || null });
    }
    return res.redirect('/books');
  } catch (err) {
    console.error('Register error:', err && err.message ? err.message : err);
    // Handle duplicate username (E11000) with clearer message
    if (err && err.code === 11000) {
      return res.send('Username already exists. <a href="/register">Try again</a>');
    }
    return res.send(`Error: ${err.message} <a href="/register">Try again</a>`);
  }
});


app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      req.session.userId = user._id;
      // Diagnostics: print session and Set-Cookie header (if available)
      console.log('Login success:', { username: user.username, userId: user._id });
      console.log('Session after login:', req.session);
      const setCookieLogin = res.getHeader && res.getHeader('Set-Cookie');
      console.log('Set-Cookie header (login):', setCookieLogin || '<not-present-yet>');
      return res.redirect('/books');
    }
    return res.send('Invalid login <a href="/login">Try again</a>');
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).send(`Error: ${err.message}`);
  }
});

app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// CRUD + Search
app.get('/books', requireAuth, async (req, res) => {
  try {
    let query = {};
    if (req.query.author) query.author = new RegExp(req.query.author, 'i');
    if (req.query.genre) query.genre = req.query.genre;
    if (req.query.year) query.year = parseInt(req.query.year);

  const books = await Book.find(query).sort({ title: 1 });
  // Render either 'books' or 'book' depending on which template exists
  const viewsDir = path.join(__dirname, 'views');
  const prefers = ['books.ejs', 'book.ejs'];
  let viewName = 'books';
  for (const v of prefers) {
    if (fs.existsSync(path.join(viewsDir, v))) {
      viewName = v.replace('.ejs', '');
      break;
    }
  }
  try {
    return res.render(viewName, { books, query: req.query });
  } catch (renderErr) {
    console.error('View render error for', viewName, renderErr && renderErr.message ? renderErr.message : renderErr);
    // Fallback: render a simple HTML list if view missing or render fails
    const listHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Books</title></head><body><h1>Books</h1><ul>${books.map(b => `<li>${b.title} — ${b.author}</li>`).join('')}</ul></body></html>`;
    return res.send(listHtml);
  }
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

app.get('/books/create', requireAuth, (req, res) => res.render('create'));
app.post('/books', requireAuth, async (req, res) => {
  try {
    await Book.create(req.body);
    res.redirect('/books');
  } catch (err) {
    res.send(`Error: ${err.message} <a href="/books/create">Try again</a>`);
  }
});

app.get('/books/edit/:id', requireAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.send('Book not found');
    res.render('edit', { book });
  } catch (err) {
    res.send(`Error: ${err.message}`);
  }
});
app.post('/books/update/:id', requireAuth, async (req, res) => {
  try {
    await Book.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/books');
  } catch (err) {
    res.send(`Error: ${err.message}`);
  }
});

app.post('/books/delete/:id', requireAuth, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/books');
  } catch (err) {
    res.send(`Error: ${err.message}`);
  }
});

// RESTful APIs
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Global Error Handlers ===
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Server is started after successful MongoDB connection above