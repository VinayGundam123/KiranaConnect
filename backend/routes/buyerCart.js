const express = require('express');
const router = express.Router();

const cartController = require('../controllers/buyerCart');

// Basic cart operations
router
    .get('/:id', cartController.getAllCartProducts)                    // Get all cart items
    .post('/:id', cartController.createCartProduct)                    // Add/update cart item
    .delete('/:id/remove', cartController.removeCartProduct)           // Remove specific item
    .put('/:id/quantity', cartController.updateCartProductQuantity)    // Update item quantity
    .delete('/:id/clear', cartController.clearCart);                   // Clear entire cart

// AI-powered cart features
router
    .get('/:id/insights', cartController.getSmartCartInsights)         // Get cart analytics
    .post('/:id/smart-notification', cartController.triggerSmartCartNotification)  // Manual notification trigger
    .post('/:id/send-prompt', cartController.sendPrompt);             // Custom AI prompt

// Notification management
router
    .get('/:id/ai-notifications', cartController.getAINotifications)      // Get AI notifications history
    .post('/:id/toggle-notifications', cartController.toggleItemNotifications); // Pause/resume notifications

// Admin/system operations
router
    .post('/check-abandoned-carts', async (req, res) => {
        try {
            await cartController.checkAbandonedCarts();
            res.json({ 
                message: 'Abandoned cart check completed successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in abandoned cart check route:', error);
            res.status(500).json({ 
                error: 'Failed to check abandoned carts',
                details: error.message 
            });
        }
    });

// Health check route for cart system
router.get('/health', (req, res) => {
    res.json({
        status: 'Cart system operational',
        features: [
            'Basic cart operations',
            'AI-powered notifications',
            'Smart cart insights',
            'Abandoned cart recovery'
        ],
        timestamp: new Date().toISOString()
    });
});

exports.router = router;