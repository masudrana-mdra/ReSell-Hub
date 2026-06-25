# 🏪 ReSell Hub - Second-Hand Marketplace Platform

> **A production-ready, full-stack circular economy marketplace connecting buyers and sellers of pre-loved items with seamless transactions, advanced analytics, and sustainable commerce.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Active-brightgreen?style=for-the-badge)](https://resellhub-one.vercel.app)
[![GitHub Client](https://img.shields.io/badge/GitHub%20Client-Repository-blue?style=for-the-badge)](https://github.com/masudranamdra/ReSell-Hub)
[![GitHub Server](https://img.shields.io/badge/GitHub%20Server-Repository-blue?style=for-the-badge)](https://github.com/masudrana-mdra/ReSell-Hub)

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Purpose & Impact](#purpose--impact)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Key Features](#key-features)
6. [Project Structure](#project-structure)
7. [Frontend Details](#frontend-details)
8. [Backend Details](#backend-details)
9. [Database Schema](#database-schema)
10. [Authentication & Security](#authentication--security)
11. [API Endpoints](#api-endpoints)
12. [Setup & Installation](#setup--installation)
13. [Development Guide](#development-guide)
14. [Deployment](#deployment)
15. [Contact & Links](#contact--links)

---

## 🎯 Project Overview

**ReSell Hub** is a comprehensive second-hand marketplace platform designed to revolutionize how people buy and sell pre-loved items. Built with modern technologies and best practices, the platform provides a seamless experience for three distinct user roles: **Buyers**, **Sellers**, and **Administrators**.

The platform operates on a **role-based authentication system** with JWT tokens, ensuring secure and scalable user management. Integration with **Stripe Payment Gateway** provides secure transactions, while **MongoDB** ensures reliable data persistence.

**Key Metrics:**
- Multi-role dashboard system (Buyer, Seller, Admin)
- 10+ database models for comprehensive data management
- 50+ API endpoints for robust backend operations
- Real-time analytics and sales tracking
- Email notification system for alerts and updates

---

## 🌍 Purpose & Sustainability Impact

Millions of usable items are discarded annually, generating significant environmental waste and economic loss. **ReSell Hub** addresses this critical issue by:

- **♻️ Reduce Waste**: Keep items in circulation instead of landfills
- **🌱 Promote Sustainability**: Enable circular economy practices
- **💰 Economic Empowerment**: Help sellers earn money from unused items
- **💵 Affordability**: Enable buyers to access quality products at lower prices
- **🌐 Environmental Responsibility**: Reduce carbon footprint through secondhand commerce

---

## 🛠️ Tech Stack

### Frontend Technologies
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Next.js** | React framework with App Router | Latest |
| **React** | UI library | 18+ |
| **Tailwind CSS** | Utility-first CSS framework | 3+ |
| **Framer Motion** | Animation library | Latest |
| **Recharts** | Data visualization & analytics | Latest |
| **Stripe.js** | Payment gateway integration | Latest |
| **Lucide React** | Icon library | Latest |
| **React Hot Toast** | Toast notifications | Latest |
| **Canvas Confetti** | Success animations | Latest |

### Backend Technologies
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | JavaScript runtime | 16+ |
| **Express.js** | Web application framework | 4+ |
| **MongoDB** | NoSQL database | Latest |
| **Mongoose** | MongoDB ODM | Latest |
| **JWT** | Authentication tokens | Latest |
| **bcryptjs** | Password hashing | Latest |
| **Stripe API** | Payment processing | Latest |
| **Nodemailer** | Email notifications | Latest |
| **CORS** | Cross-origin resource sharing | Latest |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ReSell Hub Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐          ┌──────────────────────┐    │
│  │   Frontend Client│          │   Backend Server     │    │
│  │  (Next.js/React) │◄────────►│  (Node/Express)      │    │
│  │                  │ HTTP/REST│                      │    │
│  └──────────────────┘          └──────────────────────┘    │
│        │                                  │                 │
│        │                                  │                 │
│   ┌────▼─────┐                    ┌──────▼────────┐        │
│   │ Tailwind  │                    │  MongoDB      │        │
│   │ CSS       │                    │  Database     │        │
│   └───────────┘                    └───────────────┘        │
│                                     │                        │
│   ┌──────────────────────────┐     │                        │
│   │  External Services        │     │                        │
│   ├──────────────────────────┤     │                        │
│   │ • Stripe Payments        │     │                        │
│   │ • Email Service (SMTP)   │     │                        │
│   │ • JWT Authentication     │     │                        │
│   └──────────────────────────┘     │                        │
│                                    │                         │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 1️⃣ Multi-Role Dashboard System

#### **👤 Buyer Dashboard**
- View purchase history and order tracking
- Manage wishlist with saved items
- Compare products side-by-side
- View transaction logs and receipts
- Update profile and payment methods
- Subscribe to restock alerts
- Search and filter products with advanced options
- View recently viewed products

#### **🛍️ Seller Dashboard**
- Add, edit, and delete product listings (Full CRUD)
- Manage incoming customer orders
- Track sales and generate revenue reports
- View seller analytics and statistics
- Manage seller profile and verification status
- Monitor product approval status
- Track best-selling items
- Receive sales performance notifications

#### **⚙️ Admin Dashboard**
- **User Management:** Search, block/unblock, delete users, change roles
- **Product Moderation:** Approve/reject listings with feedback
- **Category Management:** Create, read, update, delete categories
- **Payment Audit:** Review all transactions and billing records
- **Platform Analytics:** View overall sales, user statistics
- **Seller Verification:** Verify and badge trusted sellers
- **Report Management:** Review and resolve user complaints
- **Dashboard Analytics:** Real-time platform metrics

### 2️⃣ Advanced Search, Filtering & Sorting

- **Search Functionality:**
  - Keyword-based search
  - Category-based filtering
  - Location-based discovery

- **Advanced Filters:**
  - Price range slider (min-max)
  - Product condition (New, Like New, Good, Fair)
  - Location preferences
  - Seller rating filters

- **Sorting Options:**
  - Price (Low to High / High to Low)
  - Listing date (Newest / Oldest)
  - Popularity (Most viewed)
  - Rating (Highest rated)

### 3️⃣ Secure Payment Integration

- **Stripe Payment Gateway:**
  - PCI-compliant secure checkout
  - Multiple card payment support
  - Real-time payment processing
  - Automatic order creation on successful payment
  - Transaction receipt generation

- **Mock Payment Simulator:**
  - Fallback testing environment
  - Development-friendly payment testing
  - Full transaction lifecycle simulation

- **Automated Workflows:**
  - Stock deduction on purchase
  - Automatic order generation
  - Dynamic billing log creation
  - Email confirmation to buyer and seller

### 4️⃣ Interactive User Experience

- **🌓 Dark Mode / Light Mode**
  - Class-based theme implementation
  - Persistent theme in localStorage
  - Smooth theme transitions

- **🔄 Product Comparison**
  - Add up to 3 products for comparison
  - Compare: Price, Category, Condition, Seller Rating, Description
  - Side-by-side visual layout
  - Quick removal of products

- **📜 Recently Viewed Products**
  - Auto-tracking in localStorage
  - Quick access to browsing history
  - Persistent session tracking

- **🔔 Restock Availability Alerts**
  - Email notification system
  - Subscribe to out-of-stock items
  - Automatic notification on restock

- **⚠️ Complaint Reporting**
  - Report suspicious listings
  - Detailed complaint descriptions
  - Admin review and action
  - Issue resolution tracking

- **✅ Seller Verification Badges**
  - Admin-verified seller status
  - Badge display on seller profile
  - Badge on product listings
  - Trust indicator for buyers

---

## 📂 Complete Project Structure

```
resell-hub/
│
├── 📁 client/                          # Next.js Frontend Application
│   ├── 📄 package.json
│   ├── 📄 next.config.js
│   ├── 📄 tailwind.config.js
│   ├── 📄 postcss.config.js
│   ├── 📄 make_commits.ps1
│   │
│   └── 📁 app/                         # Next.js App Router
│       ├── 📄 layout.js               # Root layout wrapper
│       ├── 📄 page.js                 # Home page
│       ├── 📄 globals.css             # Global styles
│       ├── 📄 not-found.js            # 404 page
│       │
│       ├── 📁 about/                  # About page
│       ├── 📁 contact/                # Contact page
│       ├── 📁 login/                  # Authentication pages
│       ├── 📁 register/               # Registration page
│       │
│       ├── 📁 products/               # Product browsing
│       │   └── 📁 [id]/              # Product detail page
│       │
│       ├── 📁 categories/             # Category browsing
│       │   └── 📁 [categoryName]/    # Category listings
│       │
│       ├── 📁 sellers/                # Seller profiles
│       │   └── 📁 [id]/              # Individual seller page
│       │
│       ├── 📁 cart/                   # Shopping cart
│       ├── 📁 checkout/               # Checkout flow
│       │   └── 📁 success/           # Payment success page
│       │
│       ├── 📁 compare/                # Product comparison
│       │
│       └── 📁 dashboard/              # Role-based dashboards
│           ├── 📄 layout.js          # Dashboard layout
│           ├── 📄 page.js            # Dashboard home
│           ├── 📁 admin/             # Admin dashboard
│           ├── 📁 seller/            # Seller dashboard
│           │   └── 📁 add-product/   # Add product form
│           ├── 📁 buyer/             # Buyer dashboard
│           ├── 📁 orders/            # Order tracking
│           ├── 📁 payments/          # Payment history
│           ├── 📁 wishlist/          # Wishlist management
│           ├── 📁 profile/           # User profile
│           ├── 📁 manage-products/   # Product CRUD
│           ├── 📁 manage-orders/     # Order management
│           ├── 📁 my-products/       # My listings
│           ├── 📁 categories/        # Category management
│           ├── 📁 users/             # User management
│           ├── 📁 all-payments/      # Payment audit
│           ├── 📁 sales-analytics/   # Sales charts
│           └── 📁 platform-analytics/# Platform stats
│
│   └── 📁 components/                 # Reusable Components
│       ├── 📄 Navbar.jsx             # Navigation component
│       ├── 📄 Footer.jsx             # Footer component
│       └── 📄 Providers.jsx          # Context providers
│
│
├── 📁 server/                         # Express.js Backend Application
│   ├── 📄 package.json
│   ├── 📄 server.js                 # Entry point
│   ├── 📄 seed.js                   # Database seeding
│   ├── 📄 make_commits.ps1
│   │
│   ├── 📁 config/                    # Configuration files
│   │   └── 📄 mail.js               # Email configuration
│   │
│   ├── 📁 middleware/                # Express middleware
│   │   ├── 📄 auth.js               # JWT authentication
│   │   ├── 📄 logger.js             # Request logging
│   │   └── 📄 rateLimiter.js        # Rate limiting
│   │
│   ├── 📁 models/                    # MongoDB schemas (Mongoose)
│   │   ├── 📄 User.js               # User account model
│   │   ├── 📄 Product.js            # Product listings
│   │   ├── 📄 Category.js           # Product categories
│   │   ├── 📄 Order.js              # Purchase orders
│   │   ├── 📄 Payment.js            # Payment records
│   │   ├── 📄 Review.js             # Product reviews
│   │   ├── 📄 Wishlist.js           # User wishlists
│   │   ├── 📄 Alert.js              # Restock alerts
│   │   ├── 📄 Contact.js            # Contact form submissions
│   │   ├── 📄 Report.js             # User complaints
│   │   └── (More schemas)
│   │
│   ├── 📁 routes/                    # API endpoints
│   │   ├── 📄 auth.js               # Auth routes (login, register, logout)
│   │   ├── 📄 users.js              # User management routes
│   │   ├── 📄 products.js           # Product CRUD routes
│   │   ├── 📄 categories.js         # Category management
│   │   ├── 📄 orders.js             # Order management
│   │   ├── 📄 payments.js           # Payment processing
│   │   ├── 📄 analytics.js          # Analytics data
│   │   ├── 📄 contact.js            # Contact form submission
│   │   └── (More routes)
│   │
│   └── 📁 utils/                     # Utility functions
│       └── 📄 mailer.js             # Email sending utility

└── 📄 README.md                       # Project documentation
```

---

## 🎨 Frontend Details

### Technology Stack Breakdown

**Framework & Styling:**
- **Next.js 14** with App Router for file-based routing and server-side rendering
- **Tailwind CSS** for responsive, utility-first styling
- **PostCSS** for CSS processing and optimization

**Interactivity & Animation:**
- **Framer Motion** for smooth page transitions and component animations
- **Recharts** for data visualization in analytics dashboards
- **Canvas Confetti** for celebratory animations on successful purchases

**UI Components & Icons:**
- **Lucide React** for consistent icon usage throughout the app
- **React Hot Toast** for non-intrusive notifications

**Payment Integration:**
- **@stripe/react-stripe-js** for secure payment form integration
- **@stripe/stripe-js** for client-side Stripe operations

### Pages & Routes Structure

| Route | Purpose | Access Level | Features |
|-------|---------|--------------|----------|
| `/` | Home page with featured products | Public | Search, filters, featured listings |
| `/about` | About ReSell Hub | Public | Mission, vision, sustainability info |
| `/contact` | Contact form | Public | Customer support inquiry |
| `/products` | All products catalog | Public | Search, filter, sort |
| `/products/[id]` | Product detail page | Public | Reviews, seller info, purchase option |
| `/categories` | Category browser | Public | Browse by category |
| `/categories/[categoryName]` | Category products | Public | Filtered product listings |
| `/sellers/[id]` | Seller profile | Public | Seller info, ratings, products |
| `/cart` | Shopping cart | Authenticated | View cart, modify items |
| `/checkout` | Payment checkout | Authenticated | Stripe payment form |
| `/checkout/success` | Payment confirmation | Authenticated | Order confirmation, confetti animation |
| `/compare` | Product comparison | Authenticated | Compare up to 3 products |
| `/login` | User login | Public | JWT authentication |
| `/register` | User registration | Public | Account creation |
| `/dashboard` | Main dashboard | Authenticated | Role-based dashboard access |
| `/dashboard/admin/*` | Admin controls | Admin only | User/product/payment management |
| `/dashboard/seller/*` | Seller controls | Seller only | Product listing, order management |
| `/dashboard/buyer/*` | Buyer controls | Buyer only | Orders, wishlists, profile |

### Key Frontend Components

**Navbar Component:**
- Responsive navigation menu
- User authentication status indicator
- Role-based menu items
- Search functionality
- Cart notification badge
- Dark/Light mode toggle

**Footer Component:**
- Links to key pages
- Social media integration
- Contact information
- Sustainability messaging

**Providers Component:**
- Context providers setup
- Theme provider (Dark/Light mode)
- User context
- Global state management

---

## ⚙️ Backend Details

### Server Architecture

**Port:** `5000`
**Framework:** Express.js
**Database:** MongoDB
**Authentication:** JWT with HTTP-only cookies
**CORS:** Enabled for frontend cross-origin requests

### Middleware Stack

1. **CORS Middleware** - Enable cross-origin requests
2. **JSON Parser** - Parse incoming JSON payloads
3. **Logger Middleware** - Log all incoming requests
4. **Rate Limiter** - Prevent abuse and DDoS attacks
5. **Auth Middleware** - Verify JWT tokens on protected routes

### Request Processing Flow

```
Incoming Request
    ↓
CORS Check
    ↓
JSON Parse
    ↓
Logger (Record Request)
    ↓
Rate Limiter Check
    ↓
Route Handler
    ↓
Auth Middleware (if protected)
    ↓
Business Logic
    ↓
Database Operation (if needed)
    ↓
Response
```

---

## 📊 Database Schema

### Core Models

#### **User Model**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum [buyer, seller, admin],
  phone: String,
  address: String,
  profileImage: String,
  isVerified: Boolean,
  isBlocked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Product Model**
```javascript
{
  title: String,
  description: String,
  price: Number,
  category: ObjectId (ref: Category),
  seller: ObjectId (ref: User),
  condition: Enum [new, like-new, good, fair],
  image: String,
  stock: Number,
  rating: Number,
  reviews: [ObjectId] (ref: Review),
  isApproved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Order Model**
```javascript
{
  buyer: ObjectId (ref: User),
  products: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: Enum [pending, confirmed, shipped, delivered],
  deliveryAddress: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Payment Model**
```javascript
{
  order: ObjectId (ref: Order),
  stripePaymentId: String,
  amount: Number,
  currency: String,
  status: Enum [pending, completed, failed],
  paymentMethod: String,
  transactionId: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Additional Models**
- **Category:** Product categories with CRUD operations
- **Review:** Product reviews and ratings
- **Wishlist:** User saved items
- **Alert:** Restock notifications
- **Contact:** Customer inquiries
- **Report:** User complaints and moderation

---

## 🔐 Authentication & Security

### JWT Authentication Flow

```
1. User Login/Register
        ↓
2. Verify Credentials (bcrypt compare)
        ↓
3. Generate JWT Token
        ↓
4. Send Token to Client
        ↓
5. Client stores Token (localStorage/cookie)
        ↓
6. Each request includes Authorization header
        ↓
7. Server verifies token signature
        ↓
8. Process authenticated request
```

### Security Measures

**Password Security:**
- bcryptjs hashing with salt rounds
- Never store plain-text passwords
- Password validation on registration

**Token Security:**
- JWT with expiration time
- Signed with secret key
- Verified on each protected request
- Token refresh mechanism

**Data Protection:**
- CORS configuration for trusted domains
- Rate limiting to prevent brute force
- Input validation on all endpoints
- MongoDB injection prevention with Mongoose

**HTTPS:**
- Production deployment enforces HTTPS
- Secure cookies with httpOnly flag
- CSRF protection headers

---

## 📡 API Endpoints Overview

### Authentication Routes (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - User login with credentials
- `GET /logout` - Clear authentication tokens
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile

### User Routes (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /:id` - Get user details
- `PUT /:id` - Update user information
- `DELETE /:id` - Delete user account (admin)
- `PUT /:id/role` - Change user role (admin)
- `PUT /:id/block` - Block/unblock user (admin)

### Product Routes (`/api/products`)
- `GET /` - List all products with filters
- `GET /:id` - Get product details
- `POST /` - Create new product (seller)
- `PUT /:id` - Update product (seller/admin)
- `DELETE /:id` - Delete product (seller/admin)
- `PUT /:id/approve` - Approve product (admin)
- `GET /:id/reviews` - Get product reviews

### Order Routes (`/api/orders`)
- `GET /` - Get user orders
- `POST /` - Create new order
- `GET /:id` - Get order details
- `PUT /:id/status` - Update order status
- `DELETE /:id` - Cancel order

### Payment Routes (`/api/payments`)
- `POST /create-intent` - Create Stripe payment intent
- `POST /confirm` - Confirm payment completion
- `GET /` - Get payment history
- `GET /:id` - Get payment details

### Category Routes (`/api/categories`)
- `GET /` - List all categories
- `POST /` - Create category (admin)
- `PUT /:id` - Update category (admin)
- `DELETE /:id` - Delete category (admin)

### Analytics Routes (`/api/analytics`)
- `GET /sales` - Get sales data
- `GET /users` - Get user statistics
- `GET /products` - Get product statistics
- `GET /platform` - Get overall platform metrics

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn
- Stripe account (for payment integration)
- SMTP credentials (for email notifications)

### Environment Configuration

**Server Environment (`server/.env`):**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/resellhub
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resellhub

# Authentication
JWT_SECRET=your_jwt_secret_key_generate_strong_random_string

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Client Environment (`client/.env.local`):**
```env
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Stripe Publishable Key
NEXT_PUBLIC_STRIPE_KEY=pk_test_your_stripe_publishable_key
```

### Installation Steps

#### Step 1: Clone Repository
```bash
# Clone the entire project
git clone https://github.com/masudranamdra/ReSell-Hub.git
cd resell-hub
```

#### Step 2: Setup Backend Server
```bash
cd server

# Install dependencies
npm install

# Create .env file and configure
# (Copy the server .env template above)

# Seed database with initial data
npm run seed

# Start development server
npm run dev
# Server will run on http://localhost:5000
```

#### Step 3: Setup Frontend Client
```bash
cd ../client

# Install dependencies
npm install

# Create .env.local file and configure
# (Copy the client .env template above)

# Start development server
npm run dev
# Client will run on http://localhost:3000
```

#### Step 4: Access the Application
- Open browser to `http://localhost:3000`
- Register as a buyer or seller
- Admin panel access with provided credentials

---

## 🚀 Development Guide

### Running the Application Locally

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Runs on http://localhost:5000 with hot reload
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:3000 with hot reload
```

### Development Best Practices

**Code Structure:**
- Follow component-based architecture
- Keep components small and focused
- Use meaningful variable and function names
- Document complex logic with comments

**Database Operations:**
- Use Mongoose for all MongoDB operations
- Implement proper error handling
- Use transactions for complex operations
- Validate data before saving

**API Development:**
- Use RESTful conventions
- Implement proper HTTP status codes
- Use middleware for common operations
- Document API endpoints

**Frontend Development:**
- Use Next.js best practices
- Optimize images and assets
- Implement proper error boundaries
- Use context for global state

### Testing the Application

**Test Data:**
- Use admin credentials to manage platform
- Create test products as seller
- Purchase items as buyer
- Test payment flow with Stripe test cards

---

## 🌐 Deployment

### Deployment Strategy

**Frontend (Vercel):**
- Deployed to Vercel with automatic builds
- Environment variables configured in Vercel dashboard
- Auto-deploy on git push to main branch

**Backend (Can be deployed to):**
- Heroku, Railway, Render, or DigitalOcean
- MongoDB Atlas for cloud database
- Environment variables configured on hosting platform

### Live Application

**Live URLs:**
- **Frontend:** [https://resellhub-one.vercel.app](https://resellhub-one.vercel.app)
- **Backend API:** Running on production server

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database connected and migrated
- [ ] Stripe API keys validated
- [ ] Email configuration tested
- [ ] CORS origins whitelisted
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error logging setup
- [ ] Performance optimization complete

---

## 👥 Roles & Permissions Matrix

| Feature | Buyer | Seller | Admin |
|---------|-------|--------|-------|
| Browse Products | ✅ | ✅ | ✅ |
| Purchase Items | ✅ | ✅ | ❌ |
| List Products | ❌ | ✅ | ❌ |
| Manage Orders | ✅ | ✅ | ✅ |
| View Analytics | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Approve Products | ❌ | ❌ | ✅ |
| Verify Sellers | ❌ | ❌ | ✅ |
| Block Users | ❌ | ❌ | ✅ |
| View All Payments | ❌ | ❌ | ✅ |

---

## 📚 Technology Highlights

### Why These Technologies?

**Next.js:**
- Server-side rendering for SEO
- File-based routing for easy navigation
- Built-in API routes
- Optimized performance
- Production-ready framework

**Express.js:**
- Lightweight and flexible
- Extensive middleware ecosystem
- RESTful API development
- Large community support
- Proven in production

**MongoDB + Mongoose:**
- Flexible schema for various data types
- Powerful query language
- Transaction support
- Easy horizontal scaling
- Rich data modeling capabilities

**Stripe:**
- Industry-standard payment processing
- Secure PCI-compliant checkout
- Comprehensive documentation
- Test mode for development
- Excellent customer support

---

## 🎓 Learning Outcomes

This project demonstrates proficiency in:

✅ Full-stack development (MERN-style stack)
✅ JWT-based authentication & authorization
✅ Payment gateway integration
✅ Role-based access control
✅ RESTful API design
✅ Database design and optimization
✅ Responsive UI with Tailwind CSS
✅ Real-time data visualization
✅ Email notification system
✅ Production deployment strategies
✅ Error handling and validation
✅ Security best practices

---

## 📞 Contact & Links

### Developer Information
- **Name:** Masud Rana
- **Email:** masud.dev01@gmail.com
- **Username:** masudranamdra

### Application Access
- **Live Application:** [https://resellhub-one.vercel.app](https://resellhub-one.vercel.app)
- **Admin Email:** masud.dev01@gmail.com
- **Admin Password:** 41757100

### Code Repositories
- **Frontend Repository:** [https://github.com/masudranamdra/ReSell-Hub](https://github.com/masudranamdra/ReSell-Hub)
- **Backend Repository:** [https://github.com/masudrana-mdra/ReSell-Hub](https://github.com/masudrana-mdra/ReSell-Hub)

### Repository Information
| Repository | URL | Type |
|------------|-----|------|
| Client (Frontend) | [GitHub Link](https://github.com/masudranamdra/ReSell-Hub) | Next.js, React, Tailwind |
| Server (Backend) | [GitHub Link](https://github.com/masudrana-mdra/ReSell-Hub) | Node.js, Express, MongoDB |

---

## 📄 License

This project is developed as an educational portfolio project. All code is available for review and educational purposes.

---

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by sustainable commerce principles
- Community-driven development approach
- Focus on user experience and performance

---

## 📝 Notes

- **Payment Testing:** Use Stripe test card numbers for development
- **Email Testing:** Configure SMTP credentials for email features
- **Database:** Ensure MongoDB is running before starting the server
- **CORS:** Configure allowed origins for production deployment

---

**Last Updated:** June 2024 | **Version:** 1.0.0 | **Status:** Production Ready ✅
