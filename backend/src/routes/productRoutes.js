const express = require('express');
const productController = require('../controllers/productController');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Middleware to verify JWT
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

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

router.post('/analyze', auth, upload.single('image'), productController.analyzeProduct);
router.post('/upload', auth, upload.single('image'), productController.uploadProduct);
router.get('/', auth, productController.getUserProducts);
router.get('/:id', auth, productController.getProduct);
router.put('/:id/price', auth, productController.updateProductPrice);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
