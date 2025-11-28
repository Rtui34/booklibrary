const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const Book = require('./models/Book');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://kotw36547_mongdb:kotw36547@cluster0.pxofk4t.mongodb.net/booklib?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected to booklib'))
  .catch(err => console.error('MongoDB connection error:', err));

app.set('view engine', 'ejs');
app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(cookieSession({
  name: 'session',
  keys: ['secretKey1', 'secretKey2'], 
  maxAge: 24 * 60 * 60 * 1000 
}));

const checkAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};


app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    if (user && user.password === password) {
      req.session.user = user.username; 
      res.redirect('/');
    } else {
      res.render('login', { error: 'Invalid username or password' });
    }
  } catch (err) {
    res.render('login', { error: 'Login error, please try again.' });
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('register', { error: 'Username already exists!' });
    }
    await User.create({ username, password });  
    res.redirect('/login');
  } catch (err) {
    res.render('register', { error: 'Error registering user.' });
  }
});


app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});


app.get('/', checkAuth, async (req, res) => {
  let query = {};
  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    query = { $or: [{ title: regex }, { author: regex }] };
  }
  try {
    const books = await Book.find(query);
    res.render('list', { books, user: req.session.user, search: req.query.search });
  } catch (err) {
    res.status(500).send("Error fetching books");
  }
});

app.get('/create', checkAuth, (req, res) => {
  res.render('form', { book: {}, action: '/create', title: 'Add New Book' });
});

app.post('/create', checkAuth, async (req, res) => {
  try {
    await Book.create(req.body);
    res.redirect('/');
  } catch (err) {
    res.send("Error creating book: " + err.message);
  }
});

app.get('/edit/:id', checkAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    res.render('form', { book, action: `/edit/${book._id}`, title: 'Edit Book' });
  } catch (err) {
    res.redirect('/');
  }
});

app.post('/edit/:id', checkAuth, async (req, res) => {
  try {
    await Book.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/');
  } catch (err) {
    res.send("Error updating book");
  }
});

app.get('/delete/:id', checkAuth, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    res.send("Error deleting book");
  }
});

app.get('/api/books', async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({error: 'Book not found'});
    res.json(book);
  } catch (err) { res.status(500).json({error: err.message}); }
});

app.post('/api/books', async (req, res) => {
  try {
    const newBook = await Book.create(req.body);
    res.status(201).json(newBook);
  } catch (err) { res.status(400).json({error: err.message}); }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBook);
  } catch (err) { res.status(400).json({error: err.message}); }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.status(204).send(); 
  } catch (err) { res.status(400).json({error: err.message}); }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});