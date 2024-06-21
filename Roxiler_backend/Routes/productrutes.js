onst express = require('express');
const router = express.Router();
const ProductTransactionController = require('../controllers/ProductTransactionController');

router.get('/initialize', ProductTransactionController.initializeDatabase);