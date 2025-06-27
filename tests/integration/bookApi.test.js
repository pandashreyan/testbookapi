const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

// Import the Book model
const Book = require('../../models/Book');

// Create an Express application for testing
const app = express();
app.use(express.json());

// Import and use the book routes
const bookRoutes = require('../../routes/bookRoutes');
app.use('/api/books', bookRoutes);

describe('Book API Integration Tests', () => {
  let mongoServer;
  
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
  
  // Test for GET /api/books endpoint
  describe('GET /api/books', () => {
    it('should return all books', async () => {
      // Create test books in the database
      await Book.create([
        { title: 'Test Book 1', author: 'Test Author 1', publishedYear: 2020 },
        { title: 'Test Book 2', author: 'Test Author 2', publishedYear: 2021 }
      ]);
      
      // Make request to the API
      const response = await request(app).get('/api/books');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      // Check that both books exist in the response without assuming order
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: 'Test Book 1' }),
          expect.objectContaining({ title: 'Test Book 2' })
        ])
      );
    });
    
    it('should return an empty array when no books exist', async () => {
      const response = await request(app).get('/api/books');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
  
  // Test for POST /api/books endpoint
  describe('POST /api/books', () => {
    it('should create a new book', async () => {
      const newBook = {
        title: 'New Test Book',
        author: 'New Test Author',
        publishedYear: 2022
      };
      
      const response = await request(app)
        .post('/api/books')
        .send(newBook);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', 'New Test Book');
      expect(response.body).toHaveProperty('author', 'New Test Author');
      expect(response.body).toHaveProperty('publishedYear', 2022);
      
      // Verify the book was actually saved to the database
      const savedBook = await Book.findById(response.body._id);
      expect(savedBook).not.toBeNull();
      expect(savedBook.title).toBe('New Test Book');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const invalidBook = {
        title: 'Invalid Book',
        // Missing author
        publishedYear: 2022
      };
      
      const response = await request(app)
        .post('/api/books')
        .send(invalidBook);
      
      expect(response.status).toBe(400);
    });
    
    it('should return 400 if publishedYear is not a number', async () => {
      const invalidBook = {
        title: 'Invalid Book',
        author: 'Invalid Author',
        publishedYear: 'not-a-number'
      };
      
      const response = await request(app)
        .post('/api/books')
        .send(invalidBook);
      
      expect(response.status).toBe(400);
    });
  });
  
  // Test for GET /api/books/:id endpoint
  describe('GET /api/books/:id', () => {
    it('should return a book by ID', async () => {
      // Create a test book
      const book = await Book.create({
        title: 'Get By ID Book',
        author: 'Get By ID Author',
        publishedYear: 2019
      });
      
      const response = await request(app).get(`/api/books/${book._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', book._id.toString());
      expect(response.body).toHaveProperty('title', 'Get By ID Book');
    });
    
    it('should return 404 if book not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/books/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
  
  // Test for PUT /api/books/:id endpoint
  describe('PUT /api/books/:id', () => {
    it('should update a book', async () => {
      // Create a test book
      const book = await Book.create({
        title: 'Original Title',
        author: 'Original Author',
        publishedYear: 2018
      });
      
      const updatedData = {
        title: 'Updated Title',
        author: 'Updated Author',
        publishedYear: 2023
      };
      
      const response = await request(app)
        .put(`/api/books/${book._id}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Updated Title');
      expect(response.body).toHaveProperty('author', 'Updated Author');
      expect(response.body).toHaveProperty('publishedYear', 2023);
      
      // Verify the book was actually updated in the database
      const updatedBook = await Book.findById(book._id);
      expect(updatedBook.title).toBe('Updated Title');
    });
    
    it('should return 404 if book not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/books/${nonExistentId}`)
        .send({
          title: 'Updated Title',
          author: 'Updated Author',
          publishedYear: 2023
        });
      
      expect(response.status).toBe(404);
    });
  });
  
  // Test for DELETE /api/books/:id endpoint
  describe('DELETE /api/books/:id', () => {
    it('should delete a book', async () => {
      // Create a test book
      const book = await Book.create({
        title: 'Delete Test Book',
        author: 'Delete Test Author',
        publishedYear: 2017
      });
      
      const response = await request(app).delete(`/api/books/${book._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Book deleted');
      
      // Verify the book was actually deleted from the database
      const deletedBook = await Book.findById(book._id);
      expect(deletedBook).toBeNull();
    });
    
    it('should return 404 if book not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).delete(`/api/books/${nonExistentId}`);
      
      expect(response.status).toBe(404);
    });
  });
});