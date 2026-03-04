const Order = require('../models/Order');
const Product = require('../models/Product');

// Place an order
exports.placeOrder = async (req, res) => {
    try {
        const { productId, quantity = 1, shippingAddress } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.status !== 'active') {
            return res.status(400).json({ message: 'Product is not available for purchase' });
        }

        const totalPrice = product.finalPrice * quantity;

        const order = new Order({
            buyerId: req.userId,
            productId: product._id,
            sellerId: product.userId,
            quantity,
            totalPrice,
            shippingAddress,
            status: 'confirmed',
        });

        await order.save();

        // Increment product sales count
        product.sales = (product.sales || 0) + quantity;
        await product.save();

        // Populate the order before returning
        const populatedOrder = await Order.findById(order._id)
            .populate('productId', 'name imageUrl finalPrice category')
            .populate('sellerId', 'name businessName');

        res.status(201).json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get buyer's orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.userId })
            .populate('productId', 'name imageUrl finalPrice category')
            .populate('sellerId', 'name businessName')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
