# Sara's Kitchen 🍛

A production-grade cloud kitchen food delivery web application built during a 12-week internship at Skylena. Supports three user roles — **Customer**, **Admin**, and **Rider** — with real-time order tracking, payment processing, and a complete kitchen management system.

---

## Tech Stack

**Frontend:** React 19 · React Router v7 · Socket.io Client · Chart.js · Tailwind CSS · Axios

**Backend:** Node.js · Express · MySQL · Sequelize ORM · Socket.io · JWT · Nodemailer · Razorpay · express-rate-limit

---

## Features by Role

### Customer
- Browse 50+ menu items with search, category filter, price range
- Add to cart with special instructions, guest intercept modal
- Checkout with saved addresses and default address auto-fill
- Apply promo / discount codes at checkout
- Pay via Razorpay (Card / UPI / Netbanking) or Cash on Delivery
- Real-time order tracking via Socket.io with live status progress bar
- Order history, reviews and ratings, saved favourites
- Manage profile, password, and saved addresses
- Live notification bell for order status changes

### Admin
- Live order pipeline dashboard (Pending → Confirmed → Preparing → Ready)
- Manage all orders with status advancement and rider assignment
- Full menu management (create, edit, delete items)
- Rider management with approve/reject workflow
- Analytics dashboard — revenue line chart, orders by status doughnut, top-selling items bar chart
- Promo code management — percentage or flat discounts with expiry and usage limits
- Real-time new order alerts via notification bell

### Rider
- Registration with admin approval workflow
- Toggle online/offline availability
- View available orders and self-accept
- Mark picked up → out for delivery → delivered
- Earnings tracker (10% per delivery), delivery history

---

## Quick Start

### 1. Clone and install
```bash
cd backend  && npm install
cd frontend && npm install
```

### 2. Backend environment — create `backend/.env`
```env
PORT=5000
DB_HOST=localhost
DB_NAME=cloud_kitchen
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16char_app_password
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
```

### 3. Frontend environment — create `frontend/.env`
```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### 4. Database setup
```sql
CREATE DATABASE cloud_kitchen;
```
Run SQL files in `backend/migrations/` in order.

### 5. Seed and start
```bash
cd backend && npm run seed && npm run dev
cd frontend && npm start
```

---

## Demo Credentials

| Role     | Email                 | Password    |
|----------|-----------------------|-------------|
| Admin    | admin@saraskitchen.in | admin123    |
| Customer | customer@example.com  | password123 |
| Rider    | rider@example.com     | password123 |

---

## API Overview

| Endpoint                        | Auth     | Description                  |
|---------------------------------|----------|------------------------------|
| POST /auth/register             | Public   | Register user                |
| POST /auth/login                | Public   | Login, returns JWT           |
| GET  /menu                      | Public   | Browse menu items            |
| POST /orders                    | Customer | Place order                  |
| POST /promo/validate            | Customer | Apply promo code             |
| GET  /promo                     | Admin    | List all promo codes         |
| POST /promo                     | Admin    | Create promo code            |
| POST /payments/create-order     | Auth     | Create Razorpay order        |
| POST /payments/verify           | Auth     | Verify payment signature     |
| GET  /analytics/stats           | Admin    | KPI dashboard data           |
| GET  /analytics/revenue-by-day  | Admin    | 7-day revenue chart data     |
| GET  /analytics/top-items       | Admin    | Top selling menu items       |
| POST /riders/orders/:id/accept  | Rider    | Accept an available order    |

---

## Real-Time Events (Socket.io)

| Event                | Direction             | Description            |
|----------------------|-----------------------|------------------------|
| `newOrder`           | Server → Admin        | New order placed       |
| `orderStatusUpdated` | Server → Customer + Admin | Status changed     |
| `orderCancelled`     | Server → Customer + Admin | Order cancelled    |

---

## Security
- Passwords hashed with bcrypt (10 rounds)
- Auth routes: 20 requests / 15 min rate limit
- API general: 120 requests / min rate limit
- Razorpay verified server-side with HMAC-SHA256

---

*Built by Amanullah Hussain — Skylena Internship 2026*