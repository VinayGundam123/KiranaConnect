const express = require('express');
const router = express.Router();
const sellerInventoryController = require('../controllers/sellerInventory');

// Inventory management routes
router
    .get('/:id', sellerInventoryController.getAllProducts)           // Get all products
    .get('/:id/product/:productId', sellerInventoryController.getProduct)  // Get single product
    .post('/:id', sellerInventoryController.addProduct)              // Add new product
    .put('/:id/product/:productId', sellerInventoryController.updateProduct)  // Update product
    .delete('/:id/product/:productId', sellerInventoryController.deleteProduct);  // Delete product

module.exports = router; 