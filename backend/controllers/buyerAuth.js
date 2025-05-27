const jwt = require('jsonwebtoken');
const model = require('../models/buyer');
const Buyer = model.Buyer;
const bcrypt = require('bcrypt');

exports.signUp=async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newBuyer = await Buyer.create({ name, email, password });
        var token = jwt.sign({ email,id:newBuyer._id }, process.env.JWT_SECRET);
        newBuyer.token = token;
        const hash=bcrypt.hashSync(password, 10);
        newBuyer.password =  hash;
        await newBuyer.save();
        const { password: _, ...responseBuyer } = newBuyer.toObject();
        res.status(201).json(responseBuyer);
        console.log('Buyer signed up successfully:', responseBuyer);
    } catch (error) {
        console.error('Error during sign-up:', error);
        res.status(500).json({ error: 'Internal server error' ,error});
    }
}

exports.login=async (req, res) => {
    try {
        const { email, password } = req.body;
        const buyer = await Buyer.findOne({ email });
        if (!buyer) {
            return res.status(401).json({ message: 'Invalid email or Email Id is not yet Registared' });
        }
        const isMatch = bcrypt.compareSync(password, buyer.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        var token = jwt.sign({ email,id:buyer._id }, process.env.JWT_SECRET);
        buyer.token = token;
        await buyer.save();
        const { password: _, ...responseBuyer } = buyer.toObject();
        res.status(201).json(responseBuyer);
        console.log('Buyer logged in successfully:', responseBuyer);
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' ,error});
    }
}