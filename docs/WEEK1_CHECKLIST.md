# WEEK 1 DEVELOPMENT CHECKLIST
# Backend Foundation & Database Setup

## ✅ Day 1-2: Completed
- [x] Project structure created
- [x] Backend package.json with all dependencies
- [x] Environment configuration (.env.example)
- [x] Database configuration (Sequelize)
- [x] User model with password hashing
- [x] MenuItem model
- [x] Order model
- [x] OrderItem model
- [x] Model associations
- [x] JWT utilities
- [x] Authentication middleware
- [x] Error handling middleware
- [x] Auth controller (register, login, getCurrentUser)
- [x] Menu controller (CRUD operations)
- [x] Order controller (create, get, update status)
- [x] Auth routes
- [x] Menu routes
- [x] Order routes
- [x] Main Express server setup
- [x] README documentation

## 🔄 Day 3-4: Next Steps - Backend Testing

### Setup Local Environment
- [ ] Install Node.js 18+ (if not installed)
- [ ] Install MySQL 8.0 (if not installed)
- [ ] Install npm dependencies: `cd backend && npm install`
- [ ] Create `.env` file from `.env.example`
- [ ] Update database credentials in `.env`
- [ ] Create MySQL database: `CREATE DATABASE cloud_kitchen_db;`

### Test Backend Server
- [ ] Start backend server: `npm run dev`
- [ ] Verify server starts on port 5000
- [ ] Check database connection success message
- [ ] Verify tables created automatically (users, menu_items, orders, order_items)
- [ ] Test health check: `GET http://localhost:5000/api/v1/health`

### Test Authentication Endpoints
- [ ] **Register User (Customer)**
  - POST `/api/v1/auth/register`
  - Body: `{ "name": "John Doe", "email": "john@example.com", "password": "password123", "phone": "1234567890" }`
  - Verify: 201 status, user created, JWT token returned
  - Verify: Password is hashed in database

- [ ] **Register Admin**
  - POST `/api/v1/auth/register`
  - Body: `{ "name": "Admin User", "email": "admin@example.com", "password": "admin123", "role": "admin" }`
  - Verify: Admin role assigned

- [ ] **Login User**
  - POST `/api/v1/auth/login`
  - Body: `{ "email": "john@example.com", "password": "password123" }`
  - Verify: 200 status, JWT token returned
  - Save token for next tests

- [ ] **Get Current User**
  - GET `/api/v1/auth/me`
  - Header: `Authorization: Bearer <token>`
  - Verify: User data returned without password

- [ ] **Test Invalid Login**
  - Wrong password
  - Non-existent email
  - Missing fields

### Test Menu Item Endpoints
- [ ] **Create Menu Item (Admin)**
  - POST `/api/v1/menu`
  - Header: `Authorization: Bearer <admin_token>`
  - Body: `{ "name": "Margherita Pizza", "description": "Classic pizza", "price": 12.99, "category": "Main Course", "preparationTime": 20 }`
  - Verify: 201 status, menu item created

- [ ] **Get All Menu Items (Public)**
  - GET `/api/v1/menu`
  - Verify: 200 status, array of menu items

- [ ] **Get Menu Item by ID**
  - GET `/api/v1/menu/:id`
  - Verify: 200 status, single menu item

- [ ] **Update Menu Item (Admin)**
  - PUT `/api/v1/menu/:id`
  - Update price, availability, etc.
  - Verify: 200 status, updated data

- [ ] **Delete Menu Item (Admin)**
  - DELETE `/api/v1/menu/:id`
  - Verify: 200 status, item deleted

- [ ] **Test Access Control**
  - Try creating menu without token → 401 Unauthorized
  - Try creating menu with customer token → 403 Forbidden

### Test Order Endpoints
- [ ] **Create Order (Customer)**
  - POST `/api/v1/orders`
  - Header: `Authorization: Bearer <customer_token>`
  - Body: 
  ```json
  {
    "items": [
      { "menuItemId": 1, "quantity": 2 },
      { "menuItemId": 2, "quantity": 1 }
    ],
    "phoneNumber": "1234567890",
    "deliveryAddress": "123 Main St",
    "notes": "Extra cheese"
  }
  ```
  - Verify: 201 status, order created with correct total

- [ ] **Get All Orders (Customer sees only their orders)**
  - GET `/api/v1/orders`
  - Header: `Authorization: Bearer <customer_token>`
  - Verify: Only customer's orders returned

- [ ] **Get All Orders (Admin sees all orders)**
  - GET `/api/v1/orders`
  - Header: `Authorization: Bearer <admin_token>`
  - Verify: All orders returned

- [ ] **Get Order by ID**
  - GET `/api/v1/orders/:id`
  - Verify: Order details with items and menu data

- [ ] **Update Order Status (Admin)**
  - PUT `/api/v1/orders/:id/status`
  - Body: `{ "status": "confirmed" }`
  - Verify: Status updated successfully
  - Test all statuses: pending, confirmed, preparing, ready, delivered, cancelled

- [ ] **Test Order Validation**
  - Empty items array → 400 Bad Request
  - Invalid menu item ID → 404 Not Found
  - Missing phone number → 400 Bad Request

## 🔄 Day 5: Create Seed Data Script

### Create Data Seeder
- [ ] Create `backend/src/utils/seed.js` script
- [ ] Seed users (1 admin, 2 customers)
- [ ] Seed 10-15 menu items across categories
- [ ] Seed 3-5 sample orders
- [ ] Add npm script: `"seed": "node src/utils/seed.js"`
- [ ] Test seed script

## 🔄 Day 6-7: Documentation & Refinement

### API Documentation
- [ ] Create Postman collection for all endpoints
- [ ] Document request/response examples
- [ ] Export collection as JSON
- [ ] Add to docs folder

### Code Quality
- [ ] Review all error messages
- [ ] Add input validation where needed
- [ ] Test edge cases
- [ ] Check console logs and remove debug code
- [ ] Verify all environment variables

### Database Verification
- [ ] Check all tables created correctly
- [ ] Verify foreign key relationships
- [ ] Test cascading deletes (if any)
- [ ] Check indexes

## 📝 Testing Checklist Summary

### Must Test
- ✅ User registration (customer & admin)
- ✅ User login (valid & invalid)
- ✅ JWT token validation
- ✅ Menu CRUD (all operations)
- ✅ Order creation with multiple items
- ✅ Order status updates
- ✅ Access control (public vs authenticated vs admin)
- ✅ Database relationships (orders with items, users with orders)
- ✅ Error handling (validation, not found, unauthorized)

### Tools for Testing
- Postman (recommended)
- Thunder Client (VS Code extension)
- cURL commands
- REST Client (VS Code extension)

## 🎯 Week 1 Goals Met
By end of Week 1, you should have:
- ✅ Fully functional backend API
- ✅ Database schema implemented
- ✅ Authentication working
- ✅ All CRUD operations tested
- ✅ Proper error handling
- ✅ Documentation complete
- ✅ Ready for Week 2: Frontend development

## 📌 Notes
- Keep all test credentials in a separate `test-credentials.md` file (add to .gitignore)
- Document any bugs found during testing
- Track API response times
- Note any performance issues
- Keep a log of test results

---
**Status:** Backend Foundation Complete ✅
**Next Phase:** Frontend Development (Week 3-4)
