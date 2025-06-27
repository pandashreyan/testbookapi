const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import the Book model
const Book = require('../../models/Book');

// Create an Express application for testing
const app = express();
app.use(express.json());

// Import and use the book routes
const bookRoutes = require('../../routes/bookRoutes');
app.use('/api/books', bookRoutes);

describe('Book API', () => {
  let mongoServer;
  let createdBookId;
  
  // Setup connection to the in-memory database
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  
  // Close database connection after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  // Clear the database between tests
  afterEach(async () => {
    await Book.deleteMany({});
  });

  test('POST /api/books - Create a new book', async () => {
    const book = { title: 'API Test Book', author: 'API Author', publishedYear: 2022 };
    const response = await request(app)
      .post('/api/books')
      .send(book)
      .set('Content-Type', 'application/json');

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.title).toBe(book.title);
    
    createdBookId = response.body._id; // Save ID for later tests
  });

  test('GET /api/books - Get all books', async () => {
    // Create a test book first to ensure there's data
    const testBook = await Book.create({ 
      title: 'Test Book', 
      author: 'Test Author', 
      publishedYear: 2021 
    });
    
    const response = await request(app).get('/api/books');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('PUT /api/books/:id - Update a book', async () => {
    // Create a test book first
    const testBook = await Book.create({ 
      title: 'Original Title', 
      author: 'Original Author', 
      publishedYear: 2020 
    });
    
    const updatedBook = { title: 'Updated API Book', author: 'Updated Author', publishedYear: 2023 };
    const response = await request(app)
      .put(`/api/books/${testBook._id}`)
      .send(updatedBook)
      .set('Content-Type', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(updatedBook.title);
  });

  test('DELETE /api/books/:id - Delete a book', async () => {
    // Create a test book first
    const testBook = await Book.create({ 
      title: 'Book to Delete', 
      author: 'Delete Author', 
      publishedYear: 2019 
    });
    
    const response = await request(app)
      .delete(`/api/books/${testBook._id}`);

    expect(response.statusCode).toBe(200); // Changed from 204 to 200
    expect(response.body).toHaveProperty('message', 'Book deleted'); // Add this assertion
    
    // Verify deletion
    const getResponse = await request(app).get('/api/books');
    const deletedBook = getResponse.body.find(book => book._id.toString() === testBook._id.toString());
    expect(deletedBook).toBeUndefined();
  });
});