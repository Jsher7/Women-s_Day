const Product = require('../models/Product');

// Cosine similarity for finding similar products
const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    let dotProduct = 0, magnitudeA = 0, magnitudeB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }
    const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return denominator === 0 ? 0 : dotProduct / denominator;
};

// Browse all active products (public)
exports.browseProducts = async (req, res) => {
    try {
        const { search, category, sort, page = 1, limit = 12 } = req.query;
        const query = { status: 'active' };

        // Text search on name and description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        // Category filter
        if (category && category !== 'all') {
            query.category = { $regex: `^${category}$`, $options: 'i' };
        }

        // Sort options
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (sort === 'price_asc') sortOption = { finalPrice: 1 };
        else if (sort === 'price_desc') sortOption = { finalPrice: -1 };
        else if (sort === 'popular') sortOption = { sales: -1, views: -1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Product.countDocuments(query);

        const products = await Product.find(query)
            .populate('userId', 'name businessName')
            .select('-embeddingVector -priceHistory')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get product detail (public)
exports.getProductDetail = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('userId', 'name businessName avatar');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Increment views
        product.views = (product.views || 0) + 1;
        await product.save();

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get similar products (public)
exports.getSimilarProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const allProducts = await Product.find({
            _id: { $ne: product._id },
            status: 'active',
        })
            .populate('userId', 'name businessName')
            .select('-priceHistory')
            .lean();

        // Calculate similarity scores
        const similar = allProducts
            .map((p) => ({
                ...p,
                similarity: cosineSimilarity(product.embeddingVector, p.embeddingVector),
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 6)
            .map(({ embeddingVector, similarity, ...rest }) => ({
                ...rest,
                matchScore: Math.round(similarity * 100),
            }));

        res.json(similar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get distinct categories (public)
exports.getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category', { status: 'active' });
        res.json(categories.filter(Boolean));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
