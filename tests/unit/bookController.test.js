const { MongoMemoryServer } = require('mongodb-memory-server');

// Non-mocked (real database) tests
describe('Book Controller (Real DB)', () => {
  let mongoServer;
  let createBook;
  let mongoose;

  beforeAll(async () => {
    // Use isolateModules to create a clean environment
    jest.isolateModules(async () => {
      mongoose = require('mongoose');
      const controllers = require('../../controllers/bookController');
      createBook = controllers.createBook;
      
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      console.log('MongoDB Memory Server URI:', uri);
      await mongoose.connect(uri);
      console.log('Connected to MongoDB Memory Server');
    });
  });

  afterAll(async () => {
    if (mongoose) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test('createBook should create new book', async () => {
    const mockReq = {
      body: {
        title: 'Test Book',
        author: 'Test Author',
        publishedYear: 2021
      }
    };
    
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await createBook(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Book'
      })
    );
  });
});

// Separate describe block with mocked modules
describe('Book Controller (Mocked DB)', () => {
  let Book;
  let getBooks;
  let createBook;

  beforeAll(() => {
    jest.resetModules(); // Reset modules
    
    // Mock the Book model
    jest.mock('../../models/Book', () => ({
      find: jest.fn().mockResolvedValue([
        { title: 'Mocked Book 1' },
        { title: 'Mocked Book 2' }
      ]),
      create: jest.fn().mockImplementation((data) => Promise.resolve({...data, _id: 'mockedid123'})),
      findById: jest.fn().mockImplementation((id) => Promise.resolve({_id: id, title: 'Mocked Book', author: 'Mocked Author', publishedYear: 2021})),
      findByIdAndUpdate: jest.fn().mockImplementation((id, data) => Promise.resolve({_id: id, ...data})),
      findByIdAndDelete: jest.fn().mockImplementation((id) => Promise.resolve({_id: id, title: 'Deleted Book'}))
    }));
    
    // Import the controller after mocking
    const controllers = require('../../controllers/bookController');
    getBooks = controllers.getBooks;
    createBook = controllers.createBook;
    Book = require('../../models/Book');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getBooks should return all books (mocked)', async () => {
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getBooks(mockReq, mockRes);
    
    expect(Book.find).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Mocked Book 1' }),
        expect.objectContaining({ title: 'Mocked Book 2' })
      ])
    );
  });

  test('createBook should reject invalid publishedYear', async () => {
    const mockReq = {
      body: {
        title: 'Bad Book',
        author: 'Bad Author',
        publishedYear: "not-a-number"
      }
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await createBook(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'All fields required (title, author, publishedYear as number)'
      })
    );
  });

  test('getBookById should return a book by ID (mocked)', async () => {
    const mockReq = {
      params: {
        id: 'mockedid123'
      }
    };
    
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Import getBookById
    const { getBookById } = require('../../controllers/bookController');
    
    await getBookById(mockReq, mockRes);
    
    expect(Book.findById).toHaveBeenCalledWith('mockedid123');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Mocked Book'
      })
    );
  });

  test('updateBook should update a book by ID (mocked)', async () => {
    const mockReq = {
      params: {
        id: 'mockedid123'
      },
      body: {
        title: 'Updated Mocked Book',
        author: 'Updated Author',
        publishedYear: 2022
      }
    };
    
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Import updateBook
    const { updateBook } = require('../../controllers/bookController');
    
    await updateBook(mockReq, mockRes);
    
    expect(Book.findByIdAndUpdate).toHaveBeenCalledWith(
      'mockedid123',
      mockReq.body,
      { new: true }
    );
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Updated Mocked Book'
      })
    );
  });

  test('deleteBook should delete a book by ID (mocked)', async () => {
    const mockReq = {
      params: {
        id: 'mockedid123'
      }
    };
    
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Import deleteBook
    const { deleteBook } = require('../../controllers/bookController');
    
    await deleteBook(mockReq, mockRes);
    
    expect(Book.findByIdAndDelete).toHaveBeenCalledWith('mockedid123');
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Book deleted'
      })
    );
  });
});
