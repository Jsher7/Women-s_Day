const Product = require('../models/Product');
const MarketDataset = require('../models/MarketDataset');

// Calculate cosine similarity
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

// ============================================================
// SMART AI PRICING ENGINE
// Factors in: material cost, labor hours, and marketplace data
// ============================================================

const HOURLY_RATE = 150;          // ₹/hour — fair wage for handmade work
const DEFAULT_PROFIT_MARGIN = 0.4; // 40% minimum profit margin over costs
const COST_WEIGHT = 0.4;          // 40% weight to cost-based pricing
const MARKET_WEIGHT = 0.6;        // 60% weight to market-based pricing

/**
 * Calculate cost-based floor price.
 * This ensures the seller never prices below their material + labor costs.
 */
const calculateCostBasedPrice = (materialCost, hoursSpent) => {
  const laborCost = hoursSpent * HOURLY_RATE;
  const totalCost = materialCost + laborCost;
  const floorPrice = totalCost * (1 + DEFAULT_PROFIT_MARGIN);
  return { totalCost, laborCost, floorPrice: Math.round(floorPrice) };
};

/**
 * Calculate market-based price from similar products.
 * Uses similarity-weighted average with outlier removal.
 */
const calculateMarketBasedPrice = (similarItems) => {
  if (!similarItems || similarItems.length === 0) {
    return { marketPrice: 0, minPrice: 0, maxPrice: 0, medianPrice: 0, confidence: 0 };
  }

  const prices = similarItems.map((p) => p.price).sort((a, b) => a - b);

  // Remove outliers (bottom 10% and top 10%)
  const startIdx = Math.max(0, Math.ceil(prices.length * 0.1));
  const endIdx = Math.min(prices.length, Math.floor(prices.length * 0.9));
  const filtered = prices.length > 4 ? prices.slice(startIdx, endIdx) : prices;

  const minPrice = filtered[0];
  const maxPrice = filtered[filtered.length - 1];
  const medianPrice = filtered[Math.floor(filtered.length / 2)];

  // Similarity-weighted average
  let weightedSum = 0;
  let totalWeight = 0;
  similarItems.forEach((item) => {
    const weight = Math.pow(Math.max(0, item.similarity), 2); // Square similarity for stronger weighting
    weightedSum += item.price * weight;
    totalWeight += weight;
  });

  const marketPrice = totalWeight > 0 ? weightedSum / totalWeight : medianPrice;

  // Confidence based on quantity and quality of matches
  const quantityScore = Math.min(50, similarItems.length * 5);
  const avgSimilarity = similarItems.reduce((s, p) => s + p.similarity, 0) / similarItems.length;
  const qualityScore = Math.min(50, Math.round(avgSimilarity * 100));
  const confidence = Math.min(100, quantityScore + qualityScore);

  return {
    marketPrice: Math.round(marketPrice),
    minPrice: Math.round(minPrice),
    maxPrice: Math.round(maxPrice),
    medianPrice: Math.round(medianPrice),
    confidence,
  };
};

/**
 * Main smart pricing function.
 * Blends cost-based and market-based pricing.
 */
const calculateSmartPrice = (materialCost, hoursSpent, similarItems) => {
  const costBased = calculateCostBasedPrice(materialCost, hoursSpent);
  const marketBased = calculateMarketBasedPrice(similarItems);

  let suggestedPrice;
  let confidenceScore;

  if (marketBased.marketPrice > 0 && similarItems.length > 0) {
    // Blend: cost-based (40%) + market-based (60%)
    const blendedPrice = (costBased.floorPrice * COST_WEIGHT) + (marketBased.marketPrice * MARKET_WEIGHT);

    // Ensure we never suggest below cost floor
    suggestedPrice = Math.max(costBased.floorPrice, Math.round(blendedPrice));
    confidenceScore = marketBased.confidence;
  } else {
    // No market data — use cost-based with default margin
    suggestedPrice = costBased.floorPrice;
    confidenceScore = 15; // Low confidence without market data
  }

  return {
    suggestedPrice,
    minPrice: marketBased.minPrice || Math.round(costBased.totalCost),
    maxPrice: marketBased.maxPrice || Math.round(costBased.floorPrice * 1.5),
    medianPrice: marketBased.medianPrice || suggestedPrice,
    confidenceScore,
    breakdown: {
      materialCost,
      laborCost: costBased.laborCost,
      totalCost: costBased.totalCost,
      costFloor: costBased.floorPrice,
      marketAvg: marketBased.marketPrice,
      marketMin: marketBased.minPrice,
      marketMax: marketBased.maxPrice,
    },
  };
};

// Upload Product with Image
exports.uploadProduct = async (req, res) => {
  try {
    const { name, description, cost, hourSpent, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const materialCost = parseFloat(cost) || 0;
    const hours = parseFloat(hourSpent) || 0;

    // Create embedding (mock for now — replace with actual AI model)
    const embedding = Array(512)
      .fill(0)
      .map(() => Math.random() - 0.5);

    // --- Gather market data from TWO sources ---

    // Source 1: MarketDataset (external scraped data)
    const marketProducts = await MarketDataset.find().lean();
    const similarFromDataset = marketProducts
      .map((p) => ({
        price: p.price,
        similarity: cosineSimilarity(embedding, p.embedding),
        source: 'dataset',
      }))
      .filter((p) => p.similarity > 0.3);

    // Source 2: Existing active products in same category on our marketplace
    const categoryQuery = category ? { category, status: 'active' } : { status: 'active' };
    const existingProducts = await Product.find(categoryQuery).lean();
    const similarFromMarketplace = existingProducts
      .map((p) => ({
        price: p.finalPrice,
        similarity: cosineSimilarity(embedding, p.embeddingVector),
        source: 'marketplace',
      }))
      .filter((p) => p.similarity > 0.3);

    // Combine and rank all similar products
    const allSimilar = [...similarFromDataset, ...similarFromMarketplace]
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 30);

    // --- Calculate smart price ---
    const pricing = calculateSmartPrice(materialCost, hours, allSimilar);

    const product = new Product({
      userId: req.userId,
      name,
      description,
      imageUrl,
      embeddingVector: embedding,
      cost: materialCost,
      hourSpent: hours,
      suggestedPrice: pricing.suggestedPrice,
      finalPrice: pricing.suggestedPrice,
      marketMinPrice: pricing.minPrice,
      marketMaxPrice: pricing.maxPrice,
      marketMedianPrice: pricing.medianPrice,
      confidenceScore: pricing.confidenceScore,
      category,
    });

    await product.save();

    res.json({
      product,
      pricing: {
        ...pricing,
        similarProductsUsed: allSimilar.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Products
exports.getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Product Details
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Product Price
exports.updateProductPrice = async (req, res) => {
  try {
    const { finalPrice } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        finalPrice,
        lastModified: new Date(),
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
