const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['seller', 'buyer', 'admin'],
      default: 'seller',
    },
    avatar: String,
    businessName: String,
    businessCategory: String,
    totalProducts: {
      type: Number,
      default: 0,
    },
    subscription: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
    subscriptionEndDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
