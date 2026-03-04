const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'secret');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

router.post('/', auth, orderController.placeOrder);
router.get('/', auth, orderController.getMyOrders);

module.exports = router;
