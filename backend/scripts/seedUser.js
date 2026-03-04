const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');
const Product = require('../src/models/Product');

const DUMMY_SELLER = {
    name: 'Demo Seller',
    email: 'demo@craftlens.ai',
    password: 'Demo@1234',
    businessName: 'CraftLens Demo Shop',
    businessCategory: 'embroidery',
    role: 'seller',
};

const DUMMY_BUYER = {
    name: 'Demo Buyer',
    email: 'buyer@craftlens.ai',
    password: 'Buyer@1234',
    role: 'buyer',
};

const SAMPLE_PRODUCTS = [
    { name: 'Hand-Embroidered Floral Tote Bag', description: 'Beautiful hand-embroidered tote bag with floral motifs, perfect for everyday use.', category: 'embroidery', finalPrice: 1200, cost: 350, hourSpent: 8 },
    { name: 'Crochet Baby Blanket', description: 'Soft crochet baby blanket in pastel colors, made with premium cotton yarn.', category: 'crochet', finalPrice: 1800, cost: 400, hourSpent: 15 },
    { name: 'Beaded Pearl Necklace', description: 'Elegant handmade pearl necklace with gold-plated clasp, great for special occasions.', category: 'jewelry', finalPrice: 950, cost: 300, hourSpent: 4 },
    { name: 'DIY Macrame Wall Hanging', description: 'Bohemian macrame wall hanging with intricate knot patterns, adds charm to any room.', category: 'diy', finalPrice: 750, cost: 150, hourSpent: 6 },
    { name: 'Cross-Stitch Portrait Frame', description: 'Custom cross-stitch portrait in a wooden frame, a unique personalized gift.', category: 'embroidery', finalPrice: 2500, cost: 600, hourSpent: 20 },
    { name: 'Crochet Amigurumi Bear', description: 'Adorable stuffed crochet bear toy, safe for children and handmade with love.', category: 'crochet', finalPrice: 650, cost: 120, hourSpent: 5 },
    { name: 'Wire-Wrapped Gemstone Ring', description: 'Handcrafted wire-wrapped ring with natural gemstone, each piece is one-of-a-kind.', category: 'jewelry', finalPrice: 550, cost: 200, hourSpent: 2 },
    { name: 'Handpainted Ceramic Mug', description: 'Unique hand-painted ceramic mug with abstract art design, microwave safe.', category: 'diy', finalPrice: 450, cost: 100, hourSpent: 3 },
    { name: 'Embroidered Denim Jacket Patch Set', description: 'Set of 5 hand-embroidered patches for denim jackets, vibrant thread colors.', category: 'embroidery', finalPrice: 800, cost: 200, hourSpent: 10 },
    { name: 'Crochet Market Bag', description: 'Reusable crochet market bag, eco-friendly and stylish for grocery shopping.', category: 'crochet', finalPrice: 500, cost: 80, hourSpent: 4 },
];

async function seedData() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftlens-ai';
        console.log(`\n🔗 Connecting to MongoDB: ${mongoUri}`);

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully!\n');

        // --- Seed Seller ---
        let seller = await User.findOne({ email: DUMMY_SELLER.email });
        if (!seller) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(DUMMY_SELLER.password, salt);
            seller = new User({ ...DUMMY_SELLER, password: hashedPassword });
            await seller.save();
            console.log('🎉 Demo seller created!');
        } else {
            console.log('ℹ️  Demo seller already exists.');
        }
        console.log(`   Email:    ${DUMMY_SELLER.email}`);
        console.log(`   Password: ${DUMMY_SELLER.password}\n`);

        // --- Seed Buyer ---
        let buyer = await User.findOne({ email: DUMMY_BUYER.email });
        if (!buyer) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(DUMMY_BUYER.password, salt);
            buyer = new User({ ...DUMMY_BUYER, password: hashedPassword });
            await buyer.save();
            console.log('🎉 Demo buyer created!');
        } else {
            console.log('ℹ️  Demo buyer already exists.');
        }
        console.log(`   Email:    ${DUMMY_BUYER.email}`);
        console.log(`   Password: ${DUMMY_BUYER.password}\n`);

        // --- Seed Products ---
        const existingCount = await Product.countDocuments({ userId: seller._id });
        if (existingCount >= SAMPLE_PRODUCTS.length) {
            console.log(`ℹ️  ${existingCount} products already exist. Skipping product seeding.\n`);
        } else {
            // Clear old products from this seller
            await Product.deleteMany({ userId: seller._id });

            for (const p of SAMPLE_PRODUCTS) {
                const embedding = Array(512).fill(0).map(() => Math.random() - 0.5);
                const product = new Product({
                    userId: seller._id,
                    name: p.name,
                    description: p.description,
                    imageUrl: '/uploads/placeholder.jpg',
                    embeddingVector: embedding,
                    cost: p.cost,
                    hourSpent: p.hourSpent,
                    suggestedPrice: p.finalPrice,
                    finalPrice: p.finalPrice,
                    marketMinPrice: Math.round(p.finalPrice * 0.7),
                    marketMaxPrice: Math.round(p.finalPrice * 1.4),
                    marketMedianPrice: Math.round(p.finalPrice * 1.05),
                    confidenceScore: Math.floor(Math.random() * 30) + 65,
                    category: p.category,
                    status: 'active',
                    views: Math.floor(Math.random() * 100),
                    sales: Math.floor(Math.random() * 20),
                });
                await product.save();
            }
            console.log(`🎉 ${SAMPLE_PRODUCTS.length} sample products created!\n`);
        }

        console.log('   ┌──────────────────────────────────────┐');
        console.log('   │          SEEDING COMPLETE             │');
        console.log('   └──────────────────────────────────────┘\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedData();
