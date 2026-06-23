require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Payment = require('./models/Payment');
const Category = require('./models/Category');

const seedData = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('MONGODB_URI environment variable not found');
      process.exit(1);
    }

    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected. Clearing existing collections...');

    // Clear old data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Payment.deleteMany({});
    await Category.deleteMany({});

    console.log('Collections cleared. Seeding categories...');

    // Hashed Password for seed users
    const salt = await bcrypt.genSalt(10);
    const dummyPassword = await bcrypt.hash('password123', salt);

    // 1. Seed Categories
    const categoriesData = [
      {
        name: 'Electronics',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=200',
        description: 'Laptops, keyboards, computer accessories, and gadgets'
      },
      {
        name: 'Furniture',
        image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=200',
        description: 'Sofas, chairs, study desks, and household decors'
      },
      {
        name: 'Vehicles',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=200',
        description: 'Cars, motorbikes, and cycles'
      },
      {
        name: 'Fashion',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=200',
        description: 'Clothing, watches, shoes, and lifestyle collections'
      },
      {
        name: 'Mobile Phones',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200',
        description: 'Smartphones, covers, chargers, and tablets'
      }
    ];
    await Category.insertMany(categoriesData);
    console.log('Categories seeded. Seeding users...');

    // 2. Seed Users
    // Md. Rakib Hasan (Buyer)
    const buyer = new User({
      name: 'Md. Rakib Hasan',
      email: 'rakib.hasan@gmail.com',
      password: dummyPassword,
      photo: 'https://i.pravatar.cc/300?img=1',
      role: 'buyer',
      phone: '+8801712345678',
      location: 'Dhaka, Bangladesh',
      status: 'active'
    });
    await buyer.save();

    // Nusrat Jahan (Seller)
    const seller = new User({
      name: 'Nusrat Jahan',
      email: 'nusrat.jahan@gmail.com',
      password: dummyPassword,
      photo: 'https://i.pravatar.cc/300?img=2',
      role: 'seller',
      phone: '+8801812345678',
      location: 'Dhaka, Bangladesh',
      status: 'active',
      verified: true // Seed as verified seller
    });
    await seller.save();

    console.log('Users seeded. Seeding products...');

    // 3. Seed Products
    const product = new Product({
      title: 'Used Dell Inspiron 15 Laptop',
      category: 'Electronics',
      condition: 'Used', // Good maps to Used condition enum
      price: 35000,
      images: [
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600'
      ],
      description: 'Dell Inspiron 15, Core i5 10th Gen, 8GB RAM, 512GB SSD. Used for 2 years.',
      location: 'Dhaka, Bangladesh',
      sellerInfo: {
        userId: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        verified: seller.verified
      },
      status: 'available',
      stock: 1
    });
    await product.save();

    console.log('Products seeded. Seeding orders...');

    // 4. Seed Orders
    const order = new Order({
      buyerInfo: {
        userId: buyer._id,
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
        address: buyer.location
      },
      sellerInfo: {
        userId: seller._id,
        name: seller.name,
        email: seller.email
      },
      productId: product._id,
      productTitle: product.title,
      productPrice: product.price,
      quantity: 1,
      totalAmount: 35000,
      paymentStatus: 'paid',
      orderStatus: 'processing',
      transactionId: 'BKASH-TRX-987654321'
    });
    await order.save();

    console.log('Orders seeded. Seeding reviews...');

    // 5. Seed Reviews
    const review = new Review({
      reviewerInfo: {
        userId: buyer._id,
        name: buyer.name
      },
      productId: product._id,
      rating: 5,
      comment: 'Laptop condition was exactly as described. Highly recommended seller.'
    });
    await review.save();

    console.log('Reviews seeded. Seeding payments...');

    // 6. Seed Payments
    const payment = new Payment({
      orderId: order._id,
      transactionId: 'BKASH-TRX-987654321',
      amount: 35000,
      buyerId: buyer._id,
      paymentStatus: 'success',
      paymentMethod: 'bkash'
    });
    await payment.save();

    // 7. Update classification category counts
    const count = await Product.countDocuments({ category: 'Electronics', status: 'available' });
    await Category.findOneAndUpdate({ name: 'Electronics' }, { productCount: count });

    console.log('==============================================');
    console.log('Seed completed successfully!');
    console.log(`Buyer Account Created: ${buyer.email}`);
    console.log(`Seller Account Created: ${seller.email}`);
    console.log(`Product Loaded: ${product.title}`);
    console.log(`Transaction logged: ${payment.transactionId}`);
    console.log('==============================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding process error:', error);
    process.exit(1);
  }
};

seedData();
