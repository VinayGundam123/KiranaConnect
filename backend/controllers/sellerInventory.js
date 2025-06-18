const Seller = require('../models/seller');

// Add a new product to inventory
exports.addProduct = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const {
            name,
            description,
            price,
            stock,
            category,
            image_url,
            sku,
            unit,
            quantity_per_unit,
            min_stock_level
        } = req.body;

        // Validate required fields
        if (!name || !price || !stock || !category || !unit) {
            return res.status(400).json({
                message: 'Missing required fields: name, price, stock, category, and unit are required'
            });
        }

        // Find seller and add product to inventory
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        // Create new inventory item
        const newItem = {
            name,
            description,
            price,
            stock: stock,
            unit,
            category,
            image: image_url,
            sku,
            quantity_per_unit,
            min_stock_level,
            isAvailable: true,
            lastUpdated: new Date()
        };

        // Add to inventory array
        seller.inventory.push(newItem);
        await seller.save();

        // Add notification if stock is below minimum level
        if (stock <= min_stock_level) {
            seller.notifications.push({
                type: 'inventory_low',
                message: `Low stock alert: ${name} is below minimum stock level`,
                read: false,
                createdAt: new Date()
            });
            await seller.save();
        }

        res.status(201).json({
            message: 'Product added successfully',
            product: newItem
        });

    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Update an existing product
exports.updateProduct = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const productId = req.params.productId;
        const updates = req.body;

        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        // Find the product in inventory
        const productIndex = seller.inventory.findIndex(
            item => item._id.toString() === productId
        );

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update product fields
        const updatedProduct = {
            ...seller.inventory[productIndex].toObject(),
            ...updates,
            lastUpdated: new Date()
        };

        // Check for low stock notification
        if (updates.quantity && updates.quantity <= updatedProduct.min_stock_level) {
            seller.notifications.push({
                type: 'inventory_low',
                message: `Low stock alert: ${updatedProduct.name} is below minimum stock level`,
                read: false,
                createdAt: new Date()
            });
        }

        // Update the product
        seller.inventory[productIndex] = updatedProduct;
        await seller.save();

        res.status(200).json({
            message: 'Product updated successfully',
            product: updatedProduct
        });

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const productId = req.params.productId;

        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        // Find and remove the product
        const productIndex = seller.inventory.findIndex(
            item => item._id.toString() === productId
        );

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const deletedProduct = seller.inventory[productIndex];
        seller.inventory.splice(productIndex, 1);
        await seller.save();

        res.status(200).json({
            message: 'Product deleted successfully',
            product: deletedProduct
        });

    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const { category, search, sortBy, sortOrder } = req.query;

        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        let products = [...seller.inventory];

        // Apply category filter
        if (category) {
            products = products.filter(item => item.category === category);
        }

        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            products = products.filter(item =>
                item.name.toLowerCase().includes(searchLower) ||
                item.description?.toLowerCase().includes(searchLower) ||
                item.sku?.toLowerCase().includes(searchLower)
            );
        }

        // Apply sorting
        if (sortBy) {
            products.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];
                
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'desc' 
                        ? bValue.localeCompare(aValue)
                        : aValue.localeCompare(bValue);
                }
                
                return sortOrder === 'desc'
                    ? bValue - aValue
                    : aValue - bValue;
            });
        }

        res.status(200).json({
            products,
            total: products.length
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Get a single product
exports.getProduct = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const productId = req.params.productId;

        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        const product = seller.inventory.find(
            item => item._id.toString() === productId
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);

    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};
