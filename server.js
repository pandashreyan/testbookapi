const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

const bookRoutes = require('./routes/bookRoutes');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Book API',
      version: '1.0.0',
      description: 'A simple Express Book API',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Book: {
          type: 'object',
          required: ['title', 'author', 'isbn'],
          properties: {
            title: {
              type: 'string',
              description: 'The title of the book',
            },
            author: {
              type: 'string',
              description: 'The author of the book',
            },
            isbn: {
              type: 'string',
              description: 'The ISBN of the book (unique)',
            },
            publishedDate: {
              type: 'string',
              format: 'date',
              description: 'The publication date of the book',
            },
          },
          example: {
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            isbn: '978-0743273565',
            publishedDate: '1925-04-10',
          },
        },
      },
    },
  },
  apis: ['./routes/*.js', './models/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use('/api/books', bookRoutes); // This is correct

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});