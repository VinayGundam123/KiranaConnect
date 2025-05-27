require('dotenv').config();
const { Groq } = require("groq-sdk");
const model = require('../models/buyer');
const Buyer = model.Buyer;

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