require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const contactRoutes = require('./routes/contact');
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./middleware/logger');

const app = express();

// Middleware
app.use(logger);
const clientUrl = process.env.CLIENT_URL || '*';
app.use(cors({
  origin: clientUrl === '*' ? '*' : clientUrl.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Register API Routes
app.use('/api/auth', rateLimiter({ max: 15 }), authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact', rateLimiter({ max: 5 }), contactRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ReSell Hub API',
    status: 'Running',
    version: '1.0.0'
  });
});

// 404 Route
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resell_hub';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
