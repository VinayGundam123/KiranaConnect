require('dotenv').config();
const { Groq } = require("groq-sdk");
const model = require('../models/buyer');
const Buyer = model.Buyer;


// Configuration for cart abandonment
const CART_ABANDONMENT_TIME = 300 * 60 * 1000; // 30 minutes in milliseconds
const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

exports.getAllCartProducts = async (req, res) => {
    try {
        const id = req.params.id;
        const buyer = await Buyer.findById(id);
        
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }
        
        res.status(200).json(buyer.cart.items);
        console.log('Buyer cart products:', buyer.cart.items);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
        console.error('Error during fetching cart products:', error);
    }
};

exports.createCartProduct = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request params:', req.params);

        const { id } = req.params;
        const buyer = await Buyer.findById(id);
        
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }

        const { itemId, name, price, quantity, image, unit, storeName, storeId } = req.body;
        
        // Validate required fields
        if (!itemId || !name || !price || !quantity || !storeName || !storeId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingItemIndex = buyer.cart.items.findIndex(item => item.itemId.toString() === itemId);

        if (existingItemIndex > -1) {
            // If item exists, update its quantity
            const oldQuantity = buyer.cart.items[existingItemIndex].quantity;
            buyer.cart.items[existingItemIndex].quantity += quantity;
            
            // If quantity becomes 0 or negative, remove the item
            if (buyer.cart.items[existingItemIndex].quantity <= 0) {
                // Update totals before removing
                buyer.cart.totalQuantity -= oldQuantity;
                buyer.cart.totalPrice -= price * oldQuantity;
                
                // Remove the item
                buyer.cart.items.splice(existingItemIndex, 1);
            } else {
                // Update totals
                buyer.cart.totalQuantity += quantity;
                buyer.cart.totalPrice += price * quantity;
            }
        } else {
            // Only add new item if quantity is positive
            if (quantity > 0) {
                const newItem = {
                    itemId,
                    name,
                    price,
                    quantity,
                    image,
                    unit,
                    storeName,
                    storeId
                };
                buyer.cart.items.push(newItem);
                buyer.cart.totalQuantity += quantity;
                buyer.cart.totalPrice += price * quantity;
            }
        }

        await buyer.save();
        res.status(200).json({ 
            message: 'Cart updated successfully', 
            cart: buyer.cart,
            totalItems: buyer.cart.items.length 
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
        console.error('Error updating cart:', error);
    }
};

// New function to remove item completely from cart
exports.removeCartProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemId } = req.body;
        
        const buyer = await Buyer.findById(id);
        
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }

        const itemIndex = buyer.cart.items.findIndex(item => item.itemId.toString() === itemId);
        
        if (itemIndex > -1) {
            const item = buyer.cart.items[itemIndex];
            
            // Update totals
            buyer.cart.totalQuantity -= item.quantity;
            buyer.cart.totalPrice -= item.price * item.quantity;
            
            // Remove the item
            buyer.cart.items.splice(itemIndex, 1);
            
            await buyer.save();
            
            res.status(200).json({ 
                message: 'Item removed from cart successfully', 
                cart: buyer.cart 
            });
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
        
    } catch (error) {
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
        console.error('Error removing cart item:', error);
    }
};

// New function to update item quantity to a specific value
exports.updateCartProductQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemId, newQuantity } = req.body;
        
        const buyer = await Buyer.findById(id);
        
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }

        const itemIndex = buyer.cart.items.findIndex(item => item.itemId.toString() === itemId);
        
        if (itemIndex > -1) {
            const item = buyer.cart.items[itemIndex];
            const oldQuantity = item.quantity;
            const quantityDiff = newQuantity - oldQuantity;
            
            if (newQuantity <= 0) {
                // Remove item if quantity is 0 or negative
                buyer.cart.totalQuantity -= oldQuantity;
                buyer.cart.totalPrice -= item.price * oldQuantity;
                buyer.cart.items.splice(itemIndex, 1);
            } else {
                // Update quantity
                item.quantity = newQuantity;
                buyer.cart.totalQuantity += quantityDiff;
                buyer.cart.totalPrice += item.price * quantityDiff;
            }
            
            await buyer.save();
            
            res.status(200).json({ 
                message: 'Cart updated successfully', 
                cart: buyer.cart 
            });
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
        
    } catch (error) {
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
        console.error('Error updating cart quantity:', error);
    }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
    try {
        const { id } = req.params;
        
        const buyer = await Buyer.findById(id);
        
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }

        buyer.cart.items = [];
        buyer.cart.totalQuantity = 0;
        buyer.cart.totalPrice = 0;
        
        await buyer.save();
        
        res.status(200).json({ 
            message: 'Cart cleared successfully', 
            cart: buyer.cart 
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
        console.error('Error clearing cart:', error);
    }
};

// New function to check for abandoned carts and send notifications
exports.checkAbandonedCarts = async () => {
    try {
        const currentTime = new Date();
        const cutoffTime = new Date(currentTime - CART_ABANDONMENT_TIME);
        
        // Find buyers with abandoned carts
        const buyersWithAbandonedCarts = await Buyer.find({
            'cart.items': { $exists: true, $ne: [] },
            $or: [
                { 'cart.lastActivity': { $lt: cutoffTime } },
                { 'cart.lastActivity': { $exists: false } }
            ]
        });

        console.log(`Found ${buyersWithAbandonedCarts.length} buyers with potentially abandoned carts`);
        
        for (const buyer of buyersWithAbandonedCarts) {
            // Check if any items haven't received notification yet
            const itemsNeedingNotification = buyer.cart.items.filter(item => {
                const itemCutoffTime = new Date(currentTime - CART_ABANDONMENT_TIME);
                const itemLastActivity = item.lastUpdated || item.addedAt;
                return !item.notificationSent && itemLastActivity < itemCutoffTime;
            });

            if (itemsNeedingNotification.length > 0) {
                // Generate AI notification for this buyer
                await generateSmartCartNotification(buyer, itemsNeedingNotification);
                
                // Mark items as notified
                buyer.cart.items.forEach(item => {
                    const itemLastActivity = item.lastUpdated || item.addedAt;
                    if (!item.notificationSent && itemLastActivity < new Date(currentTime - CART_ABANDONMENT_TIME)) {
                        item.notificationSent = true;
                    }
                });
                
                await buyer.save();
            }
        }
        
    } catch (error) {
        console.error('Error checking abandoned carts:', error);
    }
};

// Function to generate smart cart notification using AI
const generateSmartCartNotification = async (buyer, abandonedItems) => {
    try {
        // Initialize Groq client
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        // Prepare cart items data
        const cartItemsDescription = abandonedItems.map(item => 
            `${item.name} (₹${item.price} x ${item.quantity} ${item.unit}) from ${item.storeName}`
        ).join(', ');
        
        // Get user's recent purchase history (you can enhance this based on your orders schema)
        const userHistory = buyer.orders && buyer.orders.length > 0 
            ? buyer.orders.slice(-3).map(order => 
                `Order on ${order.orderDate}: ${order.items.length} items, ₹${order.totalAmount}`
              ).join('; ')
            : 'No previous purchase history';
        
        // Create a completion
        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: 'system', 
                    content: `You are an AI agent for Kirana Connect that helps customers complete their purchases by sending personalized cart abandonment reminders.

                    GUIDELINES:
                    - Keep messages friendly, personal, and culturally appropriate for Indian customers
                    - Mention specific items left in cart to create urgency
                    - For orders above ₹1000, mention 15% discount available
                    - Include local kirana store benefits (freshness, quick delivery, supporting local business)
                    - Add gentle urgency without being pushy
                    
                    - End with clear call-to-action
                    - Use Indian rupee (₹) symbol and local context
                    ` 
                },
                { 
                    role: 'user', 
                    content: `Customer: ${buyer.name} (${buyer.email})
                    Abandoned cart items: ${cartItemsDescription}
                    Purchase history: ${userHistory}
                    Cart total: ₹${abandonedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                    
                    Generate a personalized cart abandonment message.` 
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7
        });

        const aiMessage = completion.choices[0].message.content;
        
        // Here you would integrate with your notification system
        // For now, we'll log the notification and store it
        console.log(`\n--- SMART CART NOTIFICATION ---`);
        console.log(`To: ${buyer.name} (${buyer.email})`);
        console.log(`Message: ${aiMessage}`);
        console.log(`Items: ${cartItemsDescription}`);
        console.log(`---------------------------\n`);
        
        // Store notification in buyer's record (optional)
        if (!buyer.notifications) {
            buyer.notifications = [];
        }
        
        buyer.notifications.push({
            type: 'cart_abandonment',
            message: aiMessage,
            items: abandonedItems.map(item => ({
                itemId: item.itemId,
                name: item.name,
                quantity: item.quantity
            })),
            sentAt: new Date(),
            status: 'sent'
        });
        
        return aiMessage;
        
    } catch (error) {
        console.error('Error generating smart cart notification:', error);
        return null;
    }
};

// API endpoint to manually trigger smart cart notification for a specific user
exports.triggerSmartCartNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const buyer = await Buyer.findById(id);
        
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }
        
        if (!buyer.cart.items || buyer.cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        
        const notification = await generateSmartCartNotification(buyer, buyer.cart.items);
        
        if (notification) {
            // Mark all items as notified
            buyer.cart.items.forEach(item => {
                item.notificationSent = true;
            });
            
            await buyer.save();
            
            res.status(200).json({
                message: 'Smart cart notification generated successfully',
                notification: notification,
                cartItems: buyer.cart.items.length
            });
        } else {
            res.status(500).json({ message: 'Failed to generate notification' });
        }
        
    } catch (error) {
        console.error('Error triggering smart cart notification:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
};

// API endpoint to get smart cart insights for a user
exports.getSmartCartInsights = async (req, res) => {
    try {
        const { id } = req.params;
        const buyer = await Buyer.findById(id);
        
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }
        
        const currentTime = new Date();
        const cartInsights = {
            totalItems: buyer.cart.items.length,
            totalValue: buyer.cart.totalPrice,
            oldestItem: null,
            newestItem: null,
            itemsNeedingAttention: [],
            timeSinceLastActivity: null,
            recommendedAction: 'none'
        };
        
        if (buyer.cart.items.length > 0) {
            // Find oldest and newest items
            let oldest = buyer.cart.items[0];
            let newest = buyer.cart.items[0];
            
            buyer.cart.items.forEach(item => {
                const itemTime = item.addedAt || item.lastUpdated;
                const oldestTime = oldest.addedAt || oldest.lastUpdated;
                const newestTime = newest.addedAt || newest.lastUpdated;
                
                if (itemTime < oldestTime) oldest = item;
                if (itemTime > newestTime) newest = item;
                
                // Check if item needs attention (older than abandonment time)
                if (currentTime - itemTime > CART_ABANDONMENT_TIME && !item.notificationSent) {
                    cartInsights.itemsNeedingAttention.push({
                        name: item.name,
                        addedAgo: Math.floor((currentTime - itemTime) / (1000 * 60)) // minutes ago
                    });
                }
            });
            
            cartInsights.oldestItem = {
                name: oldest.name,
                addedAgo: Math.floor((currentTime - (oldest.addedAt || oldest.lastUpdated)) / (1000 * 60))
            };
            
            cartInsights.newestItem = {
                name: newest.name,
                addedAgo: Math.floor((currentTime - (newest.addedAt || newest.lastUpdated)) / (1000 * 60))
            };
            
            // Time since last activity
            if (buyer.cart.lastActivity) {
                cartInsights.timeSinceLastActivity = Math.floor((currentTime - buyer.cart.lastActivity) / (1000 * 60));
            }
            
            // Recommend action
            if (cartInsights.itemsNeedingAttention.length > 0) {
                cartInsights.recommendedAction = 'send_notification';
            } else if (cartInsights.totalValue > 1000) {
                cartInsights.recommendedAction = 'offer_discount';
            } else if (cartInsights.timeSinceLastActivity > 15) {
                cartInsights.recommendedAction = 'gentle_reminder';
            }
        }
        
        res.status(200).json(cartInsights);
        
    } catch (error) {
        console.error('Error getting smart cart insights:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
};

// Initialize abandoned cart checker (call this when your server starts)
exports.initializeAbandonedCartChecker = () => {
    console.log('Initializing abandoned cart checker...');
    
    // Run immediately on startup
    exports.checkAbandonedCarts();
    
    // Then run every CHECK_INTERVAL
    setInterval(() => {
        exports.checkAbandonedCarts();
    }, CHECK_INTERVAL);
    
    console.log(`Abandoned cart checker will run every ${CHECK_INTERVAL / 1000 / 60} minutes`);
};

exports.sendPrompt = async (req, res) => {
    try {
        const { cartItems, userHistory, userDetails } = req.body; // Input from client
        
        // Initialize Groq client
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        // Create a completion
        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: 'system', 
                    content: `1. Clear and Concise Instructions
                        Goal:
                        You are an AI agent designed to help customers complete their purchases on Kirana Connect by reminding them about items left in their
                         shopping cart at their local kirana store.
                        Actions:
                        Identify customers who have abandoned their carts and send them personalized, friendly messages to encourage them to complete their purchase.
                        Personalization:
                        Use customer data—including their name, current cart contents, and previous purchase history—to craft messages that feel relevant and
                         tailored to each individual.
                        Urgency:
                        Incorporate a sense of urgency in your messages, such as highlighting limited-time offers, low stock alerts, or special discounts available 
                        only for a short period.

                        2. Tailored Messaging and Strategies
                        Offer Incentives:
                        Suggest exclusive deals, discounts, free delivery, or bundled offers from their local kirana store to motivate customers to finalize their
                         purchase,if the  order is greater than Rs.1000/- then you will get around 15% discount.
                        Highlight Specific Items:
                        Clearly mention the exact products left in the cart, especially popular or frequently purchased items, to remind customers of their interest.
                        Multi-Channel Communication:
                        Indicate that messages can be sent via email, SMS, push notifications, or in-app messages to maximize the chances of reaching the customer.
                        Clear Calls to Action:
                        Always include a direct and easy-to-follow call to action, such as a link or button to return to their cart and complete their order.

                        Offer Support:
                        Invite customers to contact their local kirana store through the platform if they have questions, need help, or want to modify their order.
                    ` 
                },
                { 
                    role: 'user', 
                    content: `A user named ${userDetails} abandoned their cart with: ${cartItems}. Purchase history: ${userHistory}. Write a friendly recovery message.` 
                }
            ],
            model: "llama-3.3-70b-versatile"
        });

        // Log the result and send it back to the client
        const responseContent = completion.choices[0].message.content;
        console.log(responseContent);
        res.json({ message: responseContent });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Failed to communicate with the model" });
    }
};