# Cloud Kitchen Backend API

Express.js backend API for the Cloud Kitchen web application.

## 🚀 Tech Stack

- **Runtime:** Node.js 18 LTS
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **ORM:** Sequelize
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** Bcrypt

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── menuController.js    # Menu CRUD operations
│   │   └── orderController.js   # Order management
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── MenuItem.js          # Menu item model
│   │   ├── Order.js             # Order model
│   │   ├── OrderItem.js         # Order items (join table)
│   │   └── index.js             # Model associations
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── menu.js              # Menu routes
│   │   ├── order.js             # Order routes
│   │   └── index.js             # Route aggregator
│   ├── utils/
│   │   └── jwt.js               # JWT utilities
│   └── server.js                # Express app entry point
├── tests/
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18 or higher
- MySQL 8.0
- npm or yarn

### 2. Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE cloud_kitchen_db;

# Exit MySQL
exit
```

### 4. Environment Variables

Update `.env` with your configuration:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=cloud_kitchen_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:3000
```

### 5. Run the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| GET | `/me` | Get current user | Private |

### Menu Items (`/api/v1/menu`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all menu items | Public |
| GET | `/:id` | Get menu item by ID | Public |
| POST | `/` | Create menu item | Admin |
| PUT | `/:id` | Update menu item | Admin |
| DELETE | `/:id` | Delete menu item | Admin |

### Orders (`/api/v1/orders`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create new order | Customer |
| GET | `/` | Get all orders | Private |
| GET | `/:id` | Get order by ID | Private |
| PUT | `/:id/status` | Update order status | Admin |

## 🔐 Authentication

Include JWT token in request headers:

```
Authorization: Bearer <your_jwt_token>
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📦 Database Models

### User
- id, name, email, password (hashed), phone, role, timestamps

### MenuItem
- id, name, description, price, category, imageUrl, isAvailable, preparationTime, timestamps

### Order
- id, userId, totalAmount, status, deliveryAddress, phoneNumber, notes, timestamps

### OrderItem
- id, orderId, menuItemId, quantity, price, subtotal, timestamps

## 🚀 Deployment

See main project README for Docker deployment instructions.

## 📄 License

MIT
