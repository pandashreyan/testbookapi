const Book = require('../models/Book');

const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBook = async (req, res) => {
  const { title, author, publishedYear } = req.body;
  
  console.log('Request body:', req.body);
  console.log('publishedYear type:', typeof publishedYear);

  // Add validation check
  if (!title || !author || !publishedYear || typeof publishedYear !== 'number') {
    console.log('Validation failed:', { title, author, publishedYear, type: typeof publishedYear });
    return res.status(400).json({ 
      message: 'All fields required (title, author, publishedYear as number)' 
    });
  }
  try {
    const book = await Book.create(req.body);
    console.log('Book created:', book);
    res.status(201).json(book);
  } catch (err) {
    console.error('Error creating book:', err.message);
    res.status(400).json({ error: err.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getBooks,
  createBook,
  getBookById,
  updateBook,
  deleteBook
};