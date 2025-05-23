require('dotenv').config();
const { Groq } = require("groq-sdk");

exports.sendPrompt= async (req, res) => {
    try {
        const { cartItems,userHistory,userDetails } = req.body; // Input from client
        
        // Initialize Groq client
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        // Create a completion
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: `1. Clear and Concise Instructions
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
                ` },
                { role: 'user', content: `A user named ${userDetails} abandoned their cart with: ${cartItems}. Purchase history: ${userHistory}. Write a friendly recovery message.` }
            ],
            model: "llama-3.3-70b-versatile"
        });

        // Log the result and send it back to the client
        const responseContent = completion.choices[0].message.content;
        console.log(responseContent);
        res.json(responseContent);

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Failed to communicate with the model" });
    }
};