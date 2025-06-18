const Seller = require('../models/seller');
const Buyer = require('../models/buyer');

// Get all orders for a seller
exports.getAllOrders = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const { status, sortBy, sortOrder } = req.query;

        // Find all buyers who have orders from this seller
        const buyers = await Buyer.find({
            'orders.items': {
                $elemMatch: {
                    storeId: sellerId
                }
            }
        });

        // Extract and format orders
        let allOrders = [];
        buyers.forEach(buyer => {
            buyer.orders.forEach(order => {
                // Filter items that belong to this seller
                const sellerItems = order.items.filter(item => 
                    item.storeId.toString() === sellerId
                );

                if (sellerItems.length > 0) {
                    // Calculate total amount for seller's items
                    const sellerTotal = sellerItems.reduce((total, item) => 
                        total + (item.price * item.quantity), 0
                    );

                    allOrders.push({
                        orderId: order.orderId,
                        buyerId: buyer._id,
                        buyerName: buyer.name,
                        items: sellerItems,
                        totalAmount: sellerTotal,
                        status: order.status,
                        orderDate: order.orderDate,
                        deliveryAddress: order.deliveryAddress
                    });
                }
            });
        });

        // Apply status filter if provided
        if (status) {
            allOrders = allOrders.filter(order => 
                order.status.toLowerCase() === status.toLowerCase()
            );
        }

        // Apply sorting if provided
        if (sortBy) {
            allOrders.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];
                
                if (sortBy === 'orderDate') {
                    return sortOrder === 'desc' 
                        ? new Date(bValue) - new Date(aValue)
                        : new Date(aValue) - new Date(bValue);
                }
                
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
            orders: allOrders,
            total: allOrders.length
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Get a single order
exports.getOrder = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const orderId = req.params.orderId;

        // Find buyer with this order
        const buyer = await Buyer.findOne({
            'orders.orderId': orderId
        });

        if (!buyer) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Find the specific order
        const order = buyer.orders.find(order => order.orderId === orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Filter items that belong to this seller
        const sellerItems = order.items.filter(item => 
            item.storeId.toString() === sellerId
        );

        if (sellerItems.length === 0) {
            return res.status(404).json({ message: 'No items found for this seller in the order' });
        }

        // Calculate total amount for seller's items
        const sellerTotal = sellerItems.reduce((total, item) => 
            total + (item.price * item.quantity), 0
        );

        const sellerOrder = {
            orderId: order.orderId,
            buyerId: buyer._id,
            buyerName: buyer.name,
            items: sellerItems,
            totalAmount: sellerTotal,
            status: order.status,
            orderDate: order.orderDate,
            deliveryAddress: order.deliveryAddress
        };

        res.status(200).json(sellerOrder);

    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}; 