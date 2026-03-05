const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/craftlens-ai', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

const DUMMY_PRODUCTS = [
    // Embroidery (10)
    { name: 'Floral Hoop Embroidery', desc: 'Hand-stitched floral design on a 6-inch bamboo hoop.', category: 'embroidery', price: 45, img: 'https://images.unsplash.com/photo-1626291650371-15553648ebc3?w=500&q=80' },
    { name: 'Custom Pet Portrait Embroidery', desc: 'Customized embroidery of your beloved pet.', category: 'embroidery', price: 85, img: 'https://images.unsplash.com/photo-1611082531610-d8531dbb80bc?w=500&q=80' },
    { name: 'Botanical Initial Thread Art', desc: 'Personalized initial with botanical elements.', category: 'embroidery', price: 55, img: 'https://images.unsplash.com/photo-1542171542-a2a2202b8d00?w=500&q=80' },
    { name: 'Minimalist Landscape Stitches', desc: 'A serene mountain landscape embroidered on canvas.', category: 'embroidery', price: 60, img: 'https://images.unsplash.com/photo-1625807831623-68d37aa2d5d8?w=500&q=80' },
    { name: 'Vintage Rose Embroidery', desc: 'Classic vintage rose design using premium silk thread.', category: 'embroidery', price: 40, img: 'https://images.unsplash.com/photo-1616853272990-25a81caeb57f?w=500&q=80' },
    { name: 'Abstract Line Art Pattern', desc: 'Modern abstract continuous line embroidery.', category: 'embroidery', price: 35, img: 'https://images.unsplash.com/photo-1626291650371-15553648ebc3?w=500&q=80' },
    { name: 'Sun and Moon Dual Hoop', desc: 'Set of two hoops depicting celestial bodies.', category: 'embroidery', price: 95, img: 'https://images.unsplash.com/photo-1542171542-a2a2202b8d00?w=500&q=80' },
    { name: 'Embroidered Tote Bag', desc: 'Canvas tote bag with cute stitched daisies.', category: 'embroidery', price: 25, img: 'https://images.unsplash.com/photo-1611082531610-d8531dbb80bc?w=500&q=80' },
    { name: 'Hand-sewn Denim Jacket', desc: 'Denim jacket featuring a tiger embroidery patch.', category: 'embroidery', price: 120, img: 'https://images.unsplash.com/photo-1625807831623-68d37aa2d5d8?w=500&q=80' },
    { name: 'Geometric Rainbow Stitch', desc: 'Vibrant colors structured in a geometric rainbow pattern.', category: 'embroidery', price: 50, img: 'https://images.unsplash.com/photo-1616853272990-25a81caeb57f?w=500&q=80' },

    // Crochet (10)
    { name: 'Chunky Knit Blanket', desc: 'Cozy, warm, chunky crochet blanket ideal for winter.', category: 'crochet', price: 150, img: 'https://images.unsplash.com/photo-1584992236310-6edaec98fc6a?w=500&q=80' },
    { name: 'Amigurumi Bunny Plushie', desc: 'Cute, soft handmade stuffed bunny.', category: 'crochet', price: 30, img: 'https://images.unsplash.com/photo-1653835697268-3d1f11c75502?w=500&q=80' },
    { name: 'Crochet Bucket Hat', desc: 'Trendy 90s style bucket hat made of cotton yarn.', category: 'crochet', price: 45, img: 'https://images.unsplash.com/photo-1584992236310-6edaec98fc6a?w=500&q=80' },
    { name: 'Sunflower Cardigan', desc: 'Unique patchwork sunflower cardigan.', category: 'crochet', price: 180, img: 'https://images.unsplash.com/photo-1653835697268-3d1f11c75502?w=500&q=80' },
    { name: 'Boho Fringe Crop Top', desc: 'A beautiful summer crop top with bohemian fringes.', category: 'crochet', price: 40, img: 'https://images.unsplash.com/photo-1584992236310-6edaec98fc6a?w=500&q=80' },
    { name: 'Granny Square Bag', desc: 'A classic 70s-inspired granny square shoulder bag.', category: 'crochet', price: 65, img: 'https://images.unsplash.com/photo-1653835697268-3d1f11c75502?w=500&q=80' },
    { name: 'Baby Booties & Hat Set', desc: 'Softest merino wool baby shower gift set.', category: 'crochet', price: 35, img: 'https://images.unsplash.com/photo-1584992236310-6edaec98fc6a?w=500&q=80' },
    { name: 'Crocheted Coaster Set (4)', desc: 'Set of four colorful woven drink coasters.', category: 'crochet', price: 20, img: 'https://images.unsplash.com/photo-1653835697268-3d1f11c75502?w=500&q=80' },
    { name: 'Pumpkin Throw Pillow', desc: 'Autumn decorative pumpkin shaped cushion.', category: 'crochet', price: 45, img: 'https://images.unsplash.com/photo-1584992236310-6edaec98fc6a?w=500&q=80' },
    { name: 'Hanging Plant Pods', desc: 'Set of two suspended planters for succulents.', category: 'crochet', price: 55, img: 'https://images.unsplash.com/photo-1653835697268-3d1f11c75502?w=500&q=80' },

    // Jewelry (10)
    { name: 'Resin Flower Earrings', desc: 'Pressed real forget-me-nots inside resin drop earrings.', category: 'jewelry', price: 28, img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80' },
    { name: 'Wire Wrapped Crystal Necklace', desc: 'Amethyst raw stone wrapped in tarnish-free copper wire.', category: 'jewelry', price: 42, img: 'https://images.unsplash.com/photo-1599643478514-4a5202336071?w=500&q=80' },
    { name: 'Polymer Clay Daisy Ring', desc: 'Adjustable brass ring with a sculpey daisy face.', category: 'jewelry', price: 20, img: 'https://images.unsplash.com/photo-1602751586071-7eb92eb82dc1?w=500&q=80' },
    { name: 'Macrame Tassel Earrings', desc: 'Boho chic muted tone macrame dangling earrings.', category: 'jewelry', price: 25, img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80' },
    { name: 'Stamped Brass Cuff Wrap', desc: 'Hand stamped personalized phrase on brass cuff.', category: 'jewelry', price: 38, img: 'https://images.unsplash.com/photo-1599643478514-4a5202336071?w=500&q=80' },
    { name: 'Freshwater Pearl Choker', desc: 'Classic real pearl choker with gold clasp.', category: 'jewelry', price: 65, img: 'https://images.unsplash.com/photo-1602751586071-7eb92eb82dc1?w=500&q=80' },
    { name: 'Dainty Gold Chain Anklet', desc: 'Minimalist 14k gold filled summer anklet.', category: 'jewelry', price: 30, img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80' },
    { name: 'Beaded Cherry Bracelet', desc: 'Y2k inspired seed bead cherry bracelet.', category: 'jewelry', price: 15, img: 'https://images.unsplash.com/photo-1599643478514-4a5202336071?w=500&q=80' },
    { name: 'Turquoise Silver Ring', desc: 'Hand-forged sterling silver ring with raw turquoise.', category: 'jewelry', price: 90, img: 'https://images.unsplash.com/photo-1602751586071-7eb92eb82dc1?w=500&q=80' },
    { name: 'Layered Coin Necklaces', desc: 'Set of two vintage-style coin pendant chains.', category: 'jewelry', price: 45, img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80' },

    // DIY Crafts (10)
    { name: 'DIY Candle Making Kit', desc: 'Everything you need to pour 3 soy candles.', category: 'diy', price: 45, img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80' },
    { name: 'Beginner Macrame Wall Hanging', desc: 'Macrame cord, wooden dowel, and pattern instructions.', category: 'diy', price: 35, img: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&q=80' },
    { name: 'Paint By Numbers Canvas', desc: 'Acrylic paint set and printed Parisian landscape canvas.', category: 'diy', price: 28, img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80' },
    { name: 'Resin Starter Bundle', desc: 'UV resin, molds, and decorative glitters.', category: 'diy', price: 55, img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80' },
    { name: 'Pottery at Home Kit', desc: 'Air dry clay, carving tools, and glossy sealant.', category: 'diy', price: 40, img: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&q=80' },
    { name: 'Cross Stitch Starter Pattern', desc: 'Cute cactus pattern with thread palette and aida cloth.', category: 'diy', price: 18, img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80' },
    { name: 'Soap Crafting Molds Set', desc: 'Essential oils, shea butter base and floral molds.', category: 'diy', price: 42, img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80' },
    { name: 'Knit Your Own Scarf Box', desc: 'Bamboo needles and three skeins of chunky wool.', category: 'diy', price: 50, img: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=500&q=80' },
    { name: ' pressed Flower Frame Kit', desc: 'Glass floating frame and a book of pre-pressed florals.', category: 'diy', price: 30, img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80' },
    { name: 'Origami Plant Hanger Course', desc: 'Specialty paper, beads, and an instructional video link.', category: 'diy', price: 22, img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80' }
];

const seedData = async () => {
    try {
        await connectDB();

        // 1. Create a mock seller to own these products
        let dummySeller = await User.findOne({ email: 'seller@dummy.com' });
        if (!dummySeller) {
            dummySeller = new User({
                name: 'CraftLens Masters',
                email: 'seller@dummy.com',
                password: await bcrypt.hash('password123', 10),
                role: 'seller',
                businessName: 'CraftLens Original Seller',
                businessCategory: 'All Crafts',
            });
            await dummySeller.save();
        }

        // 2. Fetch the test buyer account to assign the orders to
        const testBuyer = await User.findOne({ email: 'test2@test.com' });
        if (!testBuyer) {
            console.error('The test account test2@test.com does not exist! Please register it first.');
            process.exit(1);
        }

        // Clear existing mock data if needed (optional, keeping it cumulative for now or clearing)
        // await Product.deleteMany({ userId: dummySeller._id });
        // await Order.deleteMany({ buyerId: testBuyer._id, sellerId: dummySeller._id });

        // 3. Insert Products
        const createdProducts = [];
        for (const pd of DUMMY_PRODUCTS) {
            // Check if it already exists to prevent duplicate seeding
            let exists = await Product.findOne({ name: pd.name, userId: dummySeller._id });
            if (!exists) {
                const newProd = new Product({
                    userId: dummySeller._id,
                    name: pd.name,
                    description: pd.desc,
                    category: pd.category,
                    finalPrice: pd.price,
                    cost: pd.price * 0.4, // Fake cost
                    hourSpent: Math.floor(Math.random() * 10) + 1,
                    suggestedPrice: pd.price + 10,
                    imageUrl: pd.img,
                    status: 'active',
                    views: Math.floor(Math.random() * 500) + 50,
                    sales: Math.floor(Math.random() * 50) + 1,
                    marketMinPrice: pd.price - 10,
                    marketMaxPrice: pd.price + 20,
                    marketMedianPrice: pd.price + 5,
                    confidenceScore: 0.85
                });
                await newProd.save();
                createdProducts.push(newProd);
            } else {
                createdProducts.push(exists);
            }
        }
        console.log(`✅ Seeded ${createdProducts.length} dummy products for Marketplace.`);

        // 4. Insert 5 Dummy Orders for test2@test.com
        let orderCount = await Order.countDocuments({ buyerId: testBuyer._id });

        if (orderCount < 5) {
            const numOrdersToCreate = 5 - orderCount;
            for (let i = 0; i < numOrdersToCreate; i++) {
                // Pick a random product
                const randomProd = createdProducts[Math.floor(Math.random() * createdProducts.length)];

                const newOrder = new Order({
                    buyerId: testBuyer._id,
                    sellerId: dummySeller._id,
                    productId: randomProd._id,
                    quantity: Math.floor(Math.random() * 3) + 1,
                    totalPrice: randomProd.finalPrice * (Math.floor(Math.random() * 3) + 1),
                    status: ['pending', 'confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
                    shippingAddress: {
                        name: 'Test Buyer',
                        address: '123 Fake Street, Apt 4',
                        city: 'New York',
                        state: 'NY',
                        pincode: '10001',
                        phone: '123-456-7890'
                    }
                });
                await newOrder.save();
            }
            console.log(`✅ Seeded ${numOrdersToCreate} dummy orders for ${testBuyer.email}.`);
        } else {
            console.log(`✅ Test buyer already has ${orderCount} orders.`);
        }

        console.log('✅ Seeding Complete!');
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
