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

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const memoryUsage = process.memoryUsage();
  res.json({
    success: true,
    status: 'Healthy',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`
    }
  });
});

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

// MongoDB Connection options
const mongooseOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

const connectWithRetry = (retryCount = 0) => {
  const maxRetries = 5;
  mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(() => {
      console.log('MongoDB connected successfully to ReSell Hub database');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error(`MongoDB connection error (Attempt ${retryCount + 1}/${maxRetries}):`, err.message);
      if (retryCount < maxRetries - 1) {
        console.log('Retrying MongoDB connection in 5 seconds...');
        setTimeout(() => connectWithRetry(retryCount + 1), 5000);
      } else {
        console.error('Max MongoDB connection retries reached. Exiting process.');
        process.exit(1);
      }
    });
};

connectWithRetry();
