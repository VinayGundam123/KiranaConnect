const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Seller = require("../models/seller");

exports.signUp = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      phone,
      storeName,
      storeAddress,
      storeType,
      openingTime,
      closingTime,
      gstNumber,
    } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: "Email already registered" });
    }
    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    // Create new seller
    const newSeller = new Seller({
      email,
      password: hashedPassword,
      name,
      phone,
      storeName,
      storeAddress,
      storeType,
      openingTime: new Date(openingTime),
      closingTime: new Date(closingTime),
      gstNumber,
    });
    // Generate JWT token
    const token = jwt.sign(
      { email, id: newSeller._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    // Save seller with token
    newSeller.token = token;
    await newSeller.save();
    // Remove password from response
    const { password: _, ...sellerResponse } = newSeller.toObject();
    res.status(201).json(newSeller._id);
  } catch (error) {
    console.error("Error during seller sign-up:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find seller by email
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res
        .status(401)
        .json({ message: "Invalid email or Email Id is not yet Registered" });
    }
    // Verify password
    const isMatch = bcrypt.compareSync(password, seller.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    // Generate new token
    const token = jwt.sign({ email, id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    // Update seller's token
    seller.token = token;
    await seller.save();
    // Remove password from response
    const { password: _, ...sellerResponse } = seller.toObject();
    res.status(200).json(seller._id);
  } catch (error) {
    console.error("Error during seller login:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};
