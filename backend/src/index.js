const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');

dotenv.config();

const app = express();

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Connect to database
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/pricing', require('./routes/pricingRoutes'));
app.use('/api/marketplace', require('./routes/marketplaceRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'CraftLens AI Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`🚀 CraftLens AI Server running on port ${PORT}`);
});

// Handle graceful shutdown to clear the port
const shutdown = () => {
  console.log(`\\n🛑 Shutting down server on port ${PORT}...`);
  server.close(() => {
    console.log('✅ Port cleared and server closed cleanly.');
    process.exit(0);
  });

  // Force close after 5 seconds if not closed gracefully
  setTimeout(() => {
    console.log('⚠️ Forcing server shutdown...');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
