# 🚀 QUICK START GUIDE - Backend Setup

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed: `node --version`
- ✅ MySQL 8.0 installed: `mysql --version`
- ✅ npm installed: `npm --version`

## Step-by-Step Setup (5 minutes)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```
This will install all required packages (~1 minute)

### 3. Setup Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit with your settings
nano .env  # or use your preferred editor
```

**Update these values in .env:**
```env
DB_NAME=cloud_kitchen_db
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_random_secret_key_here
```

### 4. Create MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# In MySQL shell:
CREATE DATABASE cloud_kitchen_db;
exit;
```

### 5. Seed Database with Test Data
```bash
npm run seed
```

You should see:
```
✅ Database synced
✅ 3 users created
✅ 15 menu items created
✅ 3 orders with items created
✅ Database seeding completed successfully!
```

**Test Credentials Created:**
- Admin: `admin@cloudkitchen.com` / `admin123`
- Customer 1: `john@example.com` / `customer123`
- Customer 2: `jane@example.com` / `customer123`

### 6. Start Development Server
```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════╗
║     Cloud Kitchen API Server Started          ║
╚════════════════════════════════════════════════╝

📡 Server running on: http://localhost:5000
🌍 Environment: development
🗄️  Database: Connected to MySQL
```

## 🧪 Quick API Test

### Test 1: Health Check
```bash
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-02-11T..."
}
```

### Test 2: Login as Customer
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"customer123"}'
```

Expected: JWT token in response

### Test 3: Get Menu Items
```bash
curl http://localhost:5000/api/v1/menu
```

Expected: List of 15 menu items

## 📝 Full API Testing

For comprehensive testing, use **Postman** or **Thunder Client**:

### Using Postman

1. **Import Collection** (create collection with these requests)

2. **Test Authentication:**
   - POST `http://localhost:5000/api/v1/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@cloudkitchen.com",
       "password": "admin123"
     }
     ```
   - Copy the token from response

3. **Test Protected Endpoints:**
   - Add header: `Authorization: Bearer YOUR_TOKEN_HERE`
   - GET `http://localhost:5000/api/v1/auth/me`

4. **Test Menu Operations (Admin):**
   - GET `http://localhost:5000/api/v1/menu` (public)
   - POST `http://localhost:5000/api/v1/menu` (admin only)
     ```json
     {
       "name": "Veggie Burger",
       "description": "Delicious vegetarian option",
       "price": 9.99,
       "category": "Main Course",
       "preparationTime": 15
     }
     ```

5. **Test Order Creation (Customer):**
   - Login as customer first
   - POST `http://localhost:5000/api/v1/orders`
     ```json
     {
       "items": [
         { "menuItemId": 1, "quantity": 2 },
         { "menuItemId": 5, "quantity": 1 }
       ],
       "phoneNumber": "1234567890",
       "deliveryAddress": "123 Test Street",
       "notes": "Test order"
     }
     ```

## 🐛 Troubleshooting

### Error: "Unable to connect to database"
- Check MySQL is running: `sudo service mysql status`
- Verify credentials in `.env` file
- Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Error: "Port 5000 already in use"
- Change port in `.env`: `PORT=5001`
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### Error: "Module not found"
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Database Not Seeding
- Drop and recreate: 
  ```sql
  DROP DATABASE cloud_kitchen_db;
  CREATE DATABASE cloud_kitchen_db;
  ```
- Run seed again: `npm run seed`

## ✅ Success Checklist

After setup, verify:
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Can login with test credentials
- [ ] Can fetch menu items
- [ ] Can create orders
- [ ] Admin can manage menu items
- [ ] JWT authentication works

## 📚 Next Steps

1. ✅ Complete all API endpoint testing (see WEEK1_CHECKLIST.md)
2. ✅ Test error handling and edge cases
3. ✅ Document any issues found
4. ✅ Review code for improvements
5. ⏭️  Move to Week 3: Frontend Development

## 🆘 Need Help?

- Check backend README.md for detailed API documentation
- Review WEEK1_CHECKLIST.md for comprehensive testing guide
- Verify all environment variables are set correctly
- Check MySQL logs: `/var/log/mysql/error.log`

---

**Estimated Setup Time:** 5-10 minutes
**Ready to Test?** ✅ Yes! Start with the Quick API Tests above
