const jwt = require('jsonwebtoken');
const model = require('../models/buyer');
const Buyer = model.Buyer;
const bcrypt = require('bcrypt');

exports.signUp = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if email already exists
        const existingBuyer = await Buyer.findOne({ email });
        if (existingBuyer) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password first
        const hash = bcrypt.hashSync(password, 10);

        // Create new buyer with hashed password
        const newBuyer = new Buyer({
            name,
            email,
            password: hash,
            phone
        });

        // Generate token
        const token = jwt.sign({ email, id: newBuyer._id }, process.env.JWT_SECRET);
        newBuyer.token = token;

        // Save buyer
        await newBuyer.save();

        // Remove password from response
        const { password: _, ...responseBuyer } = newBuyer.toObject();
        res.status(201).json(newBuyer._id);
        console.log('Buyer signed up successfully:', responseBuyer);
    } catch (error) {
        console.error('Error during sign-up:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find buyer by email
        const buyer = await Buyer.findOne({ email });
        if (!buyer) {
            return res.status(401).json({ message: 'Invalid email or Email Id is not yet Registered' });
        }

        // Verify password
        const isMatch = bcrypt.compareSync(password, buyer.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate new token
        const token = jwt.sign({ email, id: buyer._id }, process.env.JWT_SECRET);
        buyer.token = token;
        await buyer.save();

        // Remove password from response
        const { password: _, ...responseBuyer } = buyer.toObject();
        res.status(200).json(buyer._id);
        console.log('Buyer logged in successfully:', responseBuyer);
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
}