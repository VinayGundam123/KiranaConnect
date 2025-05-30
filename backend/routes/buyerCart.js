const express = require('express');
const router = express.Router();

const cartController= require('../controllers/buyerCart');

router
    .get('/:id', cartController.getAllCartProducts)
    .post('/:id', cartController.createCartProduct)
    .delete('/:id/remove', cartController.removeCartProduct)
    .put('/:id/quantity', cartController.updateCartProductQuantity)
    .delete('/:id/clear', cartController.clearCart)
    .get('/:id/insights', cartController.getSmartCartInsights)
    .post('/:id/smart-notification', cartController.triggerSmartCartNotification)
    .post('/:id/send-prompt',cartController.sendPrompt)
    .post('/:id/check-abandoned-carts', async (req, res) => {
        try {
            await cartController.checkAbandonedCarts();
            res.json({ message: 'Abandoned cart check completed' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to check abandoned carts' });
        }
    });

exports.router=router;

