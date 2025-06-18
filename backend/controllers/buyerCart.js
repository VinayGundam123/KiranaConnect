require('dotenv').config();
const { Groq } = require("groq-sdk");
const model = require('../models/buyer');
const Buyer = model.Buyer;
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configuration for cart abandonment and AI notifications
const CART_ABANDONMENT_TIME = 3 * 24 * 60 * 60 * 1000; //  3 days in milliseconds
const AI_NOTIFICATION_INTERVAL =3 * 24 * 60 * 60 * 1000; //  3 days for AI notifications
const CHECK_INTERVAL = 15 * 60 * 1000; // Check 15 mintutes `
const MAX_NOTIFICATIONS_PER_ITEM = 3; // Maximum notifications per item

// Store for tracking notification intervals per user
const userNotificationTimers = new Map();

// Clear notification timer for specific item
const clearItemNotificationTimer = (buyerId, itemId) => {
    const timerKey = `${buyerId}-${itemId}`;
    if (userNotificationTimers.has(timerKey)) {
        clearTimeout(userNotificationTimers.get(timerKey));
        userNotificationTimers.delete(timerKey);
        console.log(`Cleared AI notification timer for buyer ${buyerId}, item ${itemId}`);
    }
};

// Schedule next notification with increasing intervals
const scheduleNextNotification = (buyerId, itemId) => {
    const timerKey = `${buyerId}-${itemId}`;
    // Get current notification count
    Buyer.findById(buyerId).then(buyer => {
        if (!buyer) return;
        const item = buyer.cart.items.find(item => item.itemId.toString() === itemId);
        if (!item || item.notificationCount >= MAX_NOTIFICATIONS_PER_ITEM) {
            return; // Stop notifications
        }
        // Increase interval for subsequent notifications (15min, 30min, 60min)
        const intervals = [AI_NOTIFICATION_INTERVAL, AI_NOTIFICATION_INTERVAL * 2, AI_NOTIFICATION_INTERVAL * 4];
        const nextInterval = intervals[item.notificationCount] || AI_NOTIFICATION_INTERVAL * 4;
        const timer = setTimeout(async () => {
            await sendAINotificationForItem(buyerId, itemId);
            scheduleNextNotification(buyerId, itemId);
        }, nextInterval);
        userNotificationTimers.set(timerKey, timer);
    });
};

// Enhanced function to start AI notification timer for specific item
const startItemNotificationTimer = (buyerId, itemId) => {
    const timerKey = `${buyerId}-${itemId}`;
    
    // Clear existing timer if any
    if (userNotificationTimers.has(timerKey)) {
        clearTimeout(userNotificationTimers.get(timerKey));
    }
    
    // Set new timer
    const timer = setTimeout(async () => {
        await sendAINotificationForItem(buyerId, itemId);
        
        // Schedule next notification
        scheduleNextNotification(buyerId, itemId);
    }, AI_NOTIFICATION_INTERVAL);
    
    userNotificationTimers.set(timerKey, timer);
    console.log(`Started AI notification timer for buyer ${buyerId}, item ${itemId}`);
};

// Send AI notification for specific item
const sendAINotificationForItem = async (buyerId, itemId) => {
    try {
        const buyer = await Buyer.findById(buyerId);
        if (!buyer) return;
        const item = buyer.cart.items.find(item => item.itemId.toString() === itemId);
        if (!item || item.notificationCount >= MAX_NOTIFICATIONS_PER_ITEM) {
            clearItemNotificationTimer(buyerId, itemId);
            return;
        }
        // Check if item has been in cart for minimum time
        const itemAge = Date.now() - new Date(item.addedAt || item.lastUpdated).getTime();
        if (itemAge < AI_NOTIFICATION_INTERVAL) {
            return; // Too early to send notification
        }
        console.log(`\n🤖 Generating AI notification for item: ${item.name} (Buyer: ${buyer.name})`);
        // Generate AI notification
        const notification = await generateSmartItemNotification(buyer, item);
        if (notification) {
            // Update item notification status
            item.notificationCount = (item.notificationCount || 0) + 1;
            item.lastNotificationSent = new Date();
            // Store notification in buyer's record
            if (!buyer.notifications) {
                buyer.notifications = [];
            }
            buyer.notifications.push({
                type: 'ai_cart_reminder',
                message: notification.text,
                itemId: item.itemId,
                itemName: item.name,
                notificationCount: item.notificationCount,
                sentAt: new Date(),
                status: 'sent'
            });
            await buyer.save();
            //send the mail
            try {
                const to = buyer.email;
                const subject = "Regarding Your Cart at KiranaConnect";
                const message = notification.text;
                const messageHtml = notification.html;
                await sgMail.send({
                    to: to,
                    from: 'vinaygundam123@gmail.com',
                    subject: subject,
                    text: message,
                    html: `<p>${messageHtml}</p>`
                });
                console.log(`Email sent to ${to} with subject "${subject}"`);
            } catch (error) {
                console.error('Email error:', error);
                return;
            }
            console.log(`✅ AI notification sent for ${item.name} (Count: ${item.notificationCount})`);
        }
        
    } catch (error) {
        console.error('Error sending AI notification for item:', error);
    }
};

// Generate smart notification for specific item
const generateSmartItemNotification = async (buyer, item) => {
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const timeInCart = Math.floor((Date.now() - new Date(item.addedAt || item.lastUpdated).getTime()) / (1000 * 60));
        const notificationNumber = (item.notificationCount || 0) + 1;
        const couponCodes = ['KIRANA10', 'KIRANA20', 'KIRANA30', 'KIRANA40', 'KIRANA50'];
        // Adjust urgency based on notification count
        let urgencyLevel = 'gentle';
        if (notificationNumber === 2) urgencyLevel = 'moderate';
        if (notificationNumber >= 3) urgencyLevel = 'final';
        
        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: 'system', 
                    content: `You are an AI assistant for Kirana Connect that sends personalized cart reminders for individual items.

                    GUIDELINES:
                    - This is notification #${notificationNumber} of maximum 3 for this item
                    - Keep messages short, personal, and action-oriented
                    - Urgency level: ${urgencyLevel}
                    - For gentle: friendly reminder with benefits
                    - For moderate: add mild urgency and potential scarcity
                    - For final: create strong urgency with limited-time offers
                    - Use Indian context and local kirana store benefits
                    - Include clear call-to-action
                    - Mention item has been waiting for ${timeInCart} minutes
                    - Keep under 150 words for mobile notifications
                    - Do NOT include any links or sign-offs like 'Regards' or the website link. Only generate the main message body.
                    - Let them know that if the order of the cart is greater than or equals to 1000 then they will get a discount of 10% on the order and randomly generate the a coupon code form this list: ${couponCodes}`
                },
                { 
                    role: 'user', 
                    content: `Customer: ${buyer.name}
                    Item: ${item.name} (₹${item.price} x ${item.quantity} ${item.unit})
                    Store: ${item.storeName}
                    Time in cart: ${timeInCart} minutes
                    Notification count: ${notificationNumber}
                    
                    Generate a personalized cart reminder for this specific item.`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 150
        });

        const notification = completion.choices[0].message.content.trim();
        
        // Remove any leading/trailing quotes from the AI message
        let cleanMessage = notification.trim();
        if ((cleanMessage.startsWith('"') && cleanMessage.endsWith('"')) || (cleanMessage.startsWith("'") && cleanMessage.endsWith("'"))) {
            cleanMessage = cleanMessage.slice(1, -1).trim();
        }
        // Add the cart and website links
        const cartLink = 'http://localhost:5173/buyer/cart';
        const websiteLink = 'http://localhost:5173/';
        const cartLine = `View your cart and complete your purchase: ${cartLink}`;
        const scriptLine = cartLine;
        const formattedNotification = `${cleanMessage}\n\n${scriptLine}\n\nRegards,\nKiranaConnect Team\nVisit our website: ${websiteLink}`;
        const formattedNotificationHtml = `${cleanMessage.replace(/\n/g, '<br>')}<br><br><a href="${cartLink}">View your cart and complete your purchase</a><br><br>Regards,<br>KiranaConnect Team<br>Visit our website: <a href="${websiteLink}">${websiteLink}</a>`;
        
        return { text: formattedNotification, html: formattedNotificationHtml };
        
    } catch (error) {
        console.error('Error generating smart item notification:', error);
        return null;
    }
};


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
        const id = req.params.id;
        const buyer = await Buyer.findById(id);
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }

        const { itemId, name, price, quantity, image, unit, storeName, storeId } = req.body;
        if (!itemId || !name || !price || !quantity || !storeName || !storeId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingItemIndex = buyer.cart.items.findIndex(item => item.itemId.toString() === itemId);
        if (existingItemIndex > -1) {
            // If item exists, update its quantity
            const oldQuantity = buyer.cart.items[existingItemIndex].quantity;
            buyer.cart.items[existingItemIndex].quantity += quantity;
            buyer.cart.items[existingItemIndex].lastUpdated = new Date();
            
            // If quantity becomes 0 or negative, remove the item
            if (buyer.cart.items[existingItemIndex].quantity <= 0) {
                // Update totals before removing
                buyer.cart.totalQuantity -= oldQuantity;
                buyer.cart.totalPrice -= price * oldQuantity;
                // Remove the item and clear its notifications
                buyer.cart.items.splice(existingItemIndex, 1);
                clearItemNotificationTimer(id, itemId);
            } else {
                // Update totals
                console.log(buyer.cart);
                buyer.cart.totalQuantity += quantity;
                buyer.cart.totalPrice += price * quantity;
                // Reset notification count for updated item
                buyer.cart.items[existingItemIndex].notificationCount = 0;
                buyer.cart.items[existingItemIndex].lastNotificationSent = null;
                // Start notification timer for updated item
                clearItemNotificationTimer(id, itemId);
                startItemNotificationTimer(id, itemId);
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
                    storeId,
                    addedAt: new Date(),
                    lastUpdated: new Date(),
                    notificationSent: false,
                    notificationCount: 0,
                    lastNotificationSent: null
                };
                buyer.cart.items.push(newItem);
                buyer.cart.totalQuantity += quantity;
                buyer.cart.totalPrice += price * quantity;
                // Start AI notification timer for new item
                startItemNotificationTimer(id, itemId);
            }
        }
        // Update cart last activity
        buyer.cart.lastActivity = new Date();
        await buyer.save();
        res.status(200).json({message: 'Cart updated successfully', cart: buyer.cart,totalItems: buyer.cart.items.length });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
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
            
            // Clear notification timer
            clearItemNotificationTimer(id, itemId);
            await buyer.save();
            res.status(200).json({message: 'Item removed from cart successfully', cart: buyer.cart });
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        res.status(500).json({error: 'Internal server error',details: error.message });
        console.error('Error removing cart item:', error);
    }
};

// Enhanced update quantity function
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
                // Clear notification timer
                clearItemNotificationTimer(id, itemId);
            } else {
                // Update quantity and reset notification status
                item.quantity = newQuantity;
                item.lastUpdated = new Date();
                item.notificationCount = 0;
                item.lastNotificationSent = null;
                buyer.cart.totalQuantity += quantityDiff;
                buyer.cart.totalPrice += item.price * quantityDiff;
                // Restart notification timer
                clearItemNotificationTimer(id, itemId);
                startItemNotificationTimer(id, itemId);
            }
            buyer.cart.lastActivity = new Date();
            await buyer.save();
            res.status(200).json({ message: 'Cart updated successfully', cart: buyer.cart });
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
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

        // Clear all notification timers for this buyer
        buyer.cart.items.forEach(item => {
            clearItemNotificationTimer(id, item.itemId);
        });
        buyer.cart.items = [];
        buyer.cart.totalQuantity = 0;
        buyer.cart.totalPrice = 0;
        await buyer.save();
        res.status(200).json({ message: 'Cart cleared successfully', cart: buyer.cart });
        
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
        console.error('Error clearing cart:', error);
    }
};

exports.checkAbandonedCarts = async () => {
    try {
        const currentTime = new Date();
        const cutoffTime = new Date(currentTime - CART_ABANDONMENT_TIME);
        const buyersWithAbandonedCarts = await Buyer.find({
            'cart.items': { $exists: true, $ne: [] },
            $or: [
                { 'cart.lastActivity': { $lt: cutoffTime } },
                { 'cart.lastActivity': { $exists: false } }
            ]
        });
        console.log(`Found ${buyersWithAbandonedCarts.length} buyers with potentially abandoned carts`);
        for (const buyer of buyersWithAbandonedCarts) {
            const itemsNeedingNotification = buyer.cart.items.filter(item => {
                const itemCutoffTime = new Date(currentTime - CART_ABANDONMENT_TIME);
                const itemLastActivity = item.lastUpdated || item.addedAt;
                return !item.notificationSent && itemLastActivity < itemCutoffTime;
            });
            if (itemsNeedingNotification.length > 0) {
                await generateSmartCartNotification(buyer, itemsNeedingNotification);
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

// API endpoint to get AI notifications for a user
exports.getAINotifications = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 1000 } = req.query;
        const buyer = await Buyer.findById(id);
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }
        const aiNotifications = (buyer.notifications || [])
            .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
            // .filter(notification => notification.type === 'ai_cart_reminder');
        
        res.status(200).json({
            notifications: aiNotifications,
            total: aiNotifications.length
        });
        console.log(buyer.notifications);
    } catch (error) {
        console.error('Error getting AI notifications:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

// API endpoint to pause/resume notifications for specific item
exports.toggleItemNotifications = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemId, pause } = req.body;
        const buyer = await Buyer.findById(id);
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }
        const item = buyer.cart.items.find(item => item.itemId.toString() === itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        if (pause) {
            clearItemNotificationTimer(id, itemId);
            item.notificationsPaused = true;
        } else {
            item.notificationsPaused = false;
            if (item.notificationCount < MAX_NOTIFICATIONS_PER_ITEM) {
                startItemNotificationTimer(id, itemId);
            }
        }
        await buyer.save();
        res.status(200).json({
            message: `Notifications ${pause ? 'paused' : 'resumed'} for ${item.name}`,
            item: {
                itemId: item.itemId,
                name: item.name,
                notificationsPaused: item.notificationsPaused
            }
        });
    } catch (error) {
        console.error('Error toggling item notifications:', error);
        res.status(500).json({error: 'Internal server error', details: error.message });
    }
};

// Initialize enhanced cart system
exports.initializeAbandonedCartChecker = () => {
    console.log('Initializing enhanced cart system with AI notifications...');
    // Run abandoned cart check immediately
    exports.checkAbandonedCarts();
    // Set up interval for abandoned cart checks
    setInterval(() => {
        exports.checkAbandonedCarts();
    }, CHECK_INTERVAL);
    console.log(`Enhanced cart system initialized:`);
    console.log(`- Abandoned cart checks: every ${CHECK_INTERVAL / 1000 / 60} minutes`);
    console.log(`- AI notifications: every ${AI_NOTIFICATION_INTERVAL / 1000 / 60} minutes per item`);
    console.log(`- Max notifications per item: ${MAX_NOTIFICATIONS_PER_ITEM}`);
};

// Cleanup function for server shutdown
exports.cleanup = () => {
    console.log('Cleaning up notification timers...');
    userNotificationTimers.forEach((timer, key) => {
        clearTimeout(timer);
        console.log(`Cleared timer: ${key}`);
    });
    userNotificationTimers.clear();
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

exports.sendPrompt = async (req, res) => {
    try {
        const { 
            cartItems, 
            userHistory, 
            userDetails,
            companyConfig = {
                name: 'Kirana Connect',
                currency: '₹',
                discountThreshold: 1000,
                discountPercentage: 5,
                storeType: 'local store',
                supportChannel: 'platform',
                customRules: []
            }
        } = req.body;

        // Initialize Groq client
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        // Create a completion
        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: 'system', 
                    content: `1. Clear and Concise Instructions
                        Goal:
                        You are an AI agent designed to help customers complete their purchases on ${companyConfig.name} by reminding them about items left in their
                        shopping cart at their ${companyConfig.storeType}.
                        
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
                        Suggest exclusive deals, discounts, free delivery, or bundled offers from their ${companyConfig.storeType} to motivate customers to finalize their
                        purchase. If the order is greater than ${companyConfig.currency}${companyConfig.discountThreshold}, mention the ${companyConfig.discountPercentage}% discount available.
                        
                        Highlight Specific Items:
                        Clearly mention the exact products left in the cart, especially popular or frequently purchased items, to remind customers of their interest.
                        
                        Multi-Channel Communication:
                        Indicate that messages can be sent via email, SMS, push notifications, or in-app messages to maximize the chances of reaching the customer.
                        
                        Clear Calls to Action:
                        Always include a direct and easy-to-follow call to action, such as a link or button to return to their cart and complete their order.

                        Offer Support:
                        Invite customers to contact their ${companyConfig.storeType} through the ${companyConfig.supportChannel} if they have questions, need help, or want to modify their order.
                        
                        ${companyConfig.customRules.length > 0 ? 'Additional Company Rules:\n' + companyConfig.customRules.join('\n') : ''}
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

// Update cart analytics
const updateCartAnalytics = async (buyer) => {
    if (buyer.isModified('cart.items')) {
        const cartItems = buyer.cart.items || [];
        buyer.cartAnalytics.totalItemsAdded = Math.max(
            buyer.cartAnalytics.totalItemsAdded || 0,
            cartItems.length
        );
        
        if (cartItems.length > 0) {
            buyer.cartAnalytics.averageCartValue = buyer.cart.totalPrice;
        }
    }
    
    if (buyer.isModified('notifications')) {
        const aiNotifications = buyer.notifications.filter(n => n.type === 'ai_cart_reminder');
        buyer.cartAnalytics.totalNotificationsSent = aiNotifications.length;
    }
    
    return buyer.save();
};

// Mark notification as read
const markNotificationAsRead = async (buyerId, notificationId) => {
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) return null;
    
    const notification = buyer.notifications.id(notificationId);
    if (notification) {
        notification.status = 'read';
        notification.readAt = new Date();
    }
    return buyer.save();
};

// Get unread notifications
const getUnreadNotifications = async (buyerId) => {
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) return [];
    
    return buyer.notifications.filter(notification => 
        notification.status === 'sent' || notification.status === 'delivered'
    );
};

// Get cart insights
const getCartInsights = async (buyerId) => {
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) return null;
    
    const currentTime = new Date();
    const cartItems = buyer.cart.items || [];
    
    const insights = {
        totalItems: cartItems.length,
        totalValue: buyer.cart.totalPrice || 0,
        oldestItem: null,
        newestItem: null,
        itemsNeedingAttention: [],
        timeSinceLastActivity: null,
        recommendedAction: 'none',
        oldestItemAge: 0,
        itemsOlderThan30Min: 0,
        averageItemAge: 0,
        riskLevel: 'low'
    };
    
    if (cartItems.length > 0) {
        let oldest = cartItems[0];
        let newest = cartItems[0];
        
        const itemAges = cartItems.map(item => {
            const itemTime = item.addedAt || item.lastUpdated || buyer.createdAt;
            const age = Math.floor((currentTime - itemTime) / (1000 * 60));
            
            const oldestTime = oldest.addedAt || oldest.lastUpdated || buyer.createdAt;
            const newestTime = newest.addedAt || newest.lastUpdated || buyer.createdAt;
            
            if (itemTime < oldestTime) oldest = item;
            if (itemTime > newestTime) newest = item;
            
            const CART_ABANDONMENT_TIME = 30 * 60 * 1000;
            if (currentTime - itemTime > CART_ABANDONMENT_TIME && !item.notificationSent) {
                insights.itemsNeedingAttention.push({
                    name: item.name,
                    addedAgo: age
                });
            }
            
            return age;
        });
        
        insights.oldestItem = {
            name: oldest.name,
            addedAgo: Math.floor((currentTime - (oldest.addedAt || oldest.lastUpdated)) / (1000 * 60))
        };
        
        insights.newestItem = {
            name: newest.name,
            addedAgo: Math.floor((currentTime - (newest.addedAt || newest.lastUpdated)) / (1000 * 60))
        };
        
        insights.oldestItemAge = Math.max(...itemAges);
        insights.averageItemAge = Math.floor(itemAges.reduce((sum, age) => sum + age, 0) / itemAges.length);
        insights.itemsOlderThan30Min = itemAges.filter(age => age > 30).length;
        
        if (buyer.cart.lastActivity) {
            insights.timeSinceLastActivity = Math.floor((currentTime - buyer.cart.lastActivity) / (1000 * 60));
        }
        
        if (insights.itemsNeedingAttention.length > 0) {
            insights.recommendedAction = 'send_notification';
        } else if (insights.totalValue > 1000) {
            insights.recommendedAction = 'offer_discount';
        } else if (insights.timeSinceLastActivity > 15) {
            insights.recommendedAction = 'gentle_reminder';
        }
        
        if (insights.oldestItemAge > 60 && insights.totalValue > 500) {
            insights.riskLevel = 'high';
        } else if (insights.oldestItemAge > 30 || insights.totalValue > 200) {
            insights.riskLevel = 'medium';
        }
    }
    
    return insights;
};

// Find abandoned carts
const findAbandonedCarts = async (minutesThreshold = 30) => {
    const cutoffTime = new Date(Date.now() - (minutesThreshold * 60 * 1000));
    
    return Buyer.find({
        'cart.items': { $exists: true, $ne: [] },
        $or: [
            { 'cart.lastActivity': { $lt: cutoffTime } },
            { 'cart.lastActivity': { $exists: false } }
        ]
    });
};

// Check if item notifications are paused
const areItemNotificationsPaused = async (buyerId, itemId) => {
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) return false;
    
    const item = buyer.cart.items.find(item => item.itemId.toString() === itemId);
    return item ? item.notificationsPaused : false;
};

// Get notification count for an item
const getItemNotificationCount = async (buyerId, itemId) => {
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) return 0;
    
    const item = buyer.cart.items.find(item => item.itemId.toString() === itemId);
    return item ? (item.notificationCount || 0) : 0;
};

// Export the new functions
module.exports = {
    ...module.exports,
    updateCartAnalytics,
    markNotificationAsRead,
    getUnreadNotifications,
    getCartInsights,
    findAbandonedCarts,
    areItemNotificationsPaused,
    getItemNotificationCount
};