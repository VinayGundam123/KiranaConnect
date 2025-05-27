const express = require('express');
const router = express.Router();

const cartController= require('../controllers/buyerCart');

router
    .get('/:id', cartController.getAllCartProducts)
    .post('/:id/add', cartController.createCartProduct)
    .delete('/:id/remove', cartController.removeCartProduct)
    .put('/:id/quantity', cartController.updateCartProductQuantity)
    .delete('/:id/clear', cartController.clearCart)
    .post('/ai',cartController.sendPrompt);

exports.router=router;