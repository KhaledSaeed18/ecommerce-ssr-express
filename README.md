<div align="center">
  <img src="public/assets/images/logo.png" alt="SSR E-Commerce Logo" width="400"/>
</div>

# SSR E-Commerce Platform

A server-side rendered e-commerce web application built with Node.js, Express.js, and MongoDB. This project implements session-based authentication to manage user login and shopping sessions. Users can browse products, add items to their cart, and complete orders, while administrators can manage products, categories, and orders through a dedicated admin panel. The application uses EJS templating for dynamic page rendering and includes essential security features like CSRF protection, password hashing, and role-based access control.

## Live Demo

**Deployed Application:** [https://ecommerce-ssr-express.onrender.com/](https://ecommerce-ssr-express.onrender.com/)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Security Features](#security-features)

## Features

### User Features

- **Authentication & Authorization**
  - User registration and login with secure password hashing
  - Session-based authentication with encrypted cookies
  - Role-based access control (User, Admin)
  - Account security management

- **Product Catalog**
  - Browse products with detailed information
  - Product categories and filtering
  - Product image galleries
  - Responsive product listings

- **Shopping Cart**
  - Add/remove items from cart
  - Update item quantities
  - Persistent cart storage
  - Clear cart functionality

- **Order Management**
  - Secure checkout process
  - Order placement and tracking
  - Order history with detailed view
  - Order status updates

- **Contact System**
  - Contact form for customer inquiries
  - Message submission with validation

### Admin Features

- **Dashboard**
  - Overview of key metrics and statistics
  - Recent orders and activities
  
- **Product Management**
  - Create, edit, and delete products
  - Upload product images via UploadThing
  - Manage product inventory and pricing
  
- **Category Management**
  - Create and manage product categories
  - Category-based product organization
  
- **Order Management**
  - View all customer orders
  - Update order status
  - Detailed order information
  
- **Contact Management**
  - View customer messages
  - Mark messages as read
  - Delete messages

## Tech Stack

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### View Engine

- **EJS** - Embedded JavaScript templating
- **express-ejs-layouts** - Layout support for EJS

### Authentication & Security

- **express-session** - Session middleware
- **connect-mongo** - MongoDB session store
- **bcrypt** - Password hashing
- **csurf** - CSRF protection
- **helmet** - HTTP security headers
- **cookie-parser** - Cookie parsing middleware
- **express-rate-limit** - Rate limiting

### File Upload

- **UploadThing** - File upload service
- **Multer** - Multipart form data handling

### Additional Tools

- **compression** - Response compression
- **dotenv** - Environment variable management
- **Lucide** - Icon library
- **Nodemon** - Development auto-restart

## System Architecture

The application follows the MVC (Model-View-Controller) pattern:

- **Models**: Data schemas and database interactions
- **Views**: EJS templates for server-side rendering
- **Controllers**: Business logic and request handling
- **Services**: Reusable business logic
- **Routes**: API endpoint definitions
- **Middlewares**: Request processing and authentication
- **Config**: Application configuration and setup

## Prerequisites

Before installing the application, ensure you have the following installed:

- **Node.js**
- **npm**
- **MongoDB**
- **UploadThing Account**

## Installation

1. Clone the repository:

```bash
git clone https://github.com/KhaledSaeed18/ecommerce-ssr-express.git
cd ecommerce-ssr-express
```

1. Install dependencies:

```bash
npm install
```

1. Create a `.env` file in the root directory (see [Environment Variables](#environment-variables) section)

2. Ensure MongoDB is running locally or you have a MongoDB Atlas connection string

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=mongodb://localhost:27017/ecommerce
# Or use MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# Session
SESSION_SECRET=your-secret-session-key

# File Upload
UPLOADTHING_TOKEN=your-uploadthing-token
```

### Environment Variable Details

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode (development/production) | No | `development` |
| `PORT` | Server port number | No | `3000` |
| `DATABASE_URL` | MongoDB connection string | Yes | - |
| `SESSION_SECRET` | Secret key for session encryption | Yes | - |
| `UPLOADTHING_TOKEN` | UploadThing API token for file uploads | Yes | - |

### Getting UploadThing Token

1. Sign up at [uploadthing.com](https://uploadthing.com)
2. Create a new app
3. Copy the API token from your dashboard
4. Add it to your `.env` file

## Running the Application

### Development Mode

Run the application with auto-restart on file changes:

```bash
npm run dev
```

### Production Mode

Run the application in production:

```bash
npm start
```

The server will start at `http://localhost:3000` (or your specified PORT).

## Project Structure

```bash
ecommerce-ssr-express/
├── src/
│   ├── app.js                 # Express application setup
│   ├── server.js              # Server entry point
│   ├── config/                # Configuration files
│   │   ├── db.js              # Database connection
│   │   ├── env.js             # Environment variables
│   │   ├── session.js         # Session configuration
│   │   ├── upload.js          # Multer configuration
│   │   └── uploadthing.js     # UploadThing configuration
│   ├── controllers/           # Request handlers
│   │   ├── admin.controller.js
│   │   ├── adminOrder.controller.js
│   │   ├── auth.controller.js
│   │   ├── cart.controller.js
│   │   ├── category.controller.js
│   │   ├── contact.controller.js
│   │   ├── order.controller.js
│   │   ├── product.controller.js
│   │   ├── public.controller.js
│   │   └── user.controller.js
│   ├── middlewares/           # Custom middleware
│   │   ├── csrf.js            # CSRF protection
│   │   ├── guestOnly.js       # Guest-only routes
│   │   ├── locals.js          # Template variables
│   │   ├── requireAuth.js     # Authentication check
│   │   └── requireRole.js     # Role-based access
│   ├── models/                # Database schemas
│   │   ├── Cart.model.js
│   │   ├── Category.model.js
│   │   ├── Contact.model.js
│   │   ├── Order.model.js
│   │   ├── Product.model.js
│   │   ├── User.model.js
│   │   └── UserSession.model.js
│   ├── routes/                # API routes
│   │   ├── admin.routes.js
│   │   ├── adminOrder.routes.js
│   │   ├── auth.routes.js
│   │   ├── cart.routes.js
│   │   ├── category.routes.js
│   │   ├── contact.routes.js
│   │   ├── index.routes.js
│   │   ├── order.routes.js
│   │   ├── product.routes.js
│   │   ├── public.routes.js
│   │   └── user.routes.js
│   ├── services/              # Business logic
│   │   ├── auth.service.js
│   │   ├── cart.service.js
│   │   ├── category.service.js
│   │   ├── contact.service.js
│   │   ├── order.service.js
│   │   ├── product.service.js
│   │   └── session.service.js
│   └── views/                 # EJS templates
│       ├── layouts/           # Layout templates
│       ├── auth/              # Authentication pages
│       ├── admin/             # Admin pages
│       ├── cart/              # Cart pages
│       ├── checkout/          # Checkout pages
│       ├── dashboard/         # User dashboard
│       ├── orders/            # Order pages
│       └── public/            # Public pages
├── public/                    # Static assets
│   ├── css/                   # Stylesheets
│   ├── js/                    # Client-side scripts
│   ├── assets/                # Images and media
│   └── uploads/               # User uploads
├── package.json               # Dependencies and scripts
└── .env                       # Environment variables (create this)
```

## API Routes

### Public Routes

- `GET /` - Home page
- `GET /about` - About page
- `GET /products` - Product listing
- `GET /products/:id` - Product details
- `GET /contact` - Contact page
- `POST /contact` - Submit contact form

### Authentication Routes

- `GET /auth/login` - Login page
- `POST /auth/login` - Login submit
- `GET /auth/register` - Registration page
- `POST /auth/register` - Registration submit
- `POST /auth/logout` - Logout

### User Routes (Authenticated)

- `GET /dashboard` - User dashboard
- `GET /orders` - Order history
- `GET /orders/:id` - Order details
- `GET /account/security` - Security settings
- `POST /account/change-password` - Change password

### Cart Routes (Authenticated)

- `GET /cart` - View cart
- `POST /cart/add` - Add to cart
- `POST /cart/update` - Update quantity
- `POST /cart/remove` - Remove item
- `POST /cart/clear` - Clear cart

### Checkout Routes (Authenticated)

- `GET /checkout` - Checkout page
- `POST /checkout` - Place order

### Admin Routes (Admin Only)

- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/products` - Manage products
- `GET /admin/products/new` - Create product
- `POST /admin/products` - Save product
- `GET /admin/products/:id/edit` - Edit product
- `POST /admin/products/:id` - Update product
- `POST /admin/products/:id/delete` - Delete product
- `GET /admin/categories` - Manage categories
- `GET /admin/orders` - Manage orders
- `GET /admin/contacts` - View messages

## Security Features

- **Password Security**: Bcrypt hashing with salt rounds
- **Session Management**: Secure, encrypted session cookies
- **CSRF Protection**: Token-based CSRF prevention
- **HTTP Security**: Helmet.js for security headers
- **Rate Limiting**: Prevent brute-force attacks
- **Input Validation**: Server-side validation and sanitization
- **Role-Based Access**: Protected admin routes
- **Secure Cookies**: HTTPOnly and Secure flags in production
