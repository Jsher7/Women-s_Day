const express = require('express');
const marketplaceController = require('../controllers/marketplaceController');

const router = express.Router();

// All routes are public (no auth required)
router.get('/', marketplaceController.browseProducts);
router.get('/categories', marketplaceController.getCategories);
router.get('/:id', marketplaceController.getProductDetail);
router.get('/:id/similar', marketplaceController.getSimilarProducts);

module.exports = router;
