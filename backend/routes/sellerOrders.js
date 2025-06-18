const express = require('express');
const router = express.Router();
const sellerOrdersController = require('../controllers/sellerOrders');

// Order management routes
router
    .get('/:id', sellerOrdersController.getAllOrders)           // Get all orders
    .get('/:id/order/:orderId', sellerOrdersController.getOrder);  // Get single order

module.exports = router; 