const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.route('/')
  .get(bookController.getBooks)
  .post(bookController.createBook);

router.route('/:id')
  .get(bookController.getBookById)
  .put(bookController.updateBook)
  .delete(bookController.deleteBook);

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - isbn
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The book title
 *         author:
 *           type: string
 *           description: The book author
 *         isbn:
 *           type: string
 *           description: The book ISBN
 *         publishedDate:
 *           type: string
 *           format: date
 *           description: The date the book was published
 *       example:
 *         id: 60d5ecf7b7e1c20015a4b1a0
 *         title: The Great Gatsby
 *         author: F. Scott Fitzgerald
 *         isbn: 978-0743273565
 *         publishedDate: 1925-04-10
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: The Books managing API
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Returns the list of all the books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: The list of the books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get('/', bookController.getBooks);

module.exports = router;