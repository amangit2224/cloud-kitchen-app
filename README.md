# Cloud Kitchen Web Application

A cost-optimized cloud kitchen web application built with MERN stack and deployed on AWS EC2.

## 🎯 Project Overview

This is a 3-month internship project for **Skylena** that demonstrates:
- Full-stack development with MERN stack
- Cost-optimized cloud architecture ($0 AWS cost)
- Docker containerization
- Self-hosted monitoring (Prometheus + Grafana)
- CI/CD with GitHub Actions

## 🏗️ Architecture

**Single EC2 Instance (t2.micro) - All Services Containerized:**

```
┌─────────────────────────────────────────────────────┐
│                  EC2 Instance (t2.micro)            │
│                                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │  Frontend  │  │  Backend   │  │   MySQL    │  │
│  │   Nginx    │  │  Node.js   │  │  Database  │  │
│  │  Port 80   │  │  Port 5000 │  │ Port 3306  │  │
│  └────────────┘  └────────────┘  └────────────┘  │
│                                                     │
│  ┌────────────┐  ┌────────────┐                   │
│  │Prometheus  │  │  Grafana   │                   │
│  │ Port 9090  │  │  Port 3000 │                   │
│  └────────────┘  └────────────┘                   │
│                                                     │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
                 ┌───────────────┐
                 │   AWS S3      │
                 │  (Images)     │
                 └───────────────┘
```

## 📚 Tech Stack

### Frontend
- React 18.x
- React Router
- Tailwind CSS
- Axios
- Context API

### Backend
- Node.js 18 LTS
- Express.js
- Sequelize (MySQL ORM)
- JWT Authentication
- Bcrypt

### Database
- MySQL 8.0 (Containerized)

### Monitoring
- Prometheus (Metrics)
- Grafana (Visualization)
- Node Exporter (System metrics)
- cAdvisor (Container metrics)

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Nginx (Reverse proxy)
- AWS S3 (Image storage)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0
- Docker & Docker Compose
- Git

### Local Development Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd cloud-kitchen-app
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup** (Coming soon in Week 3)
```bash
cd frontend
npm install
npm start
```

4. **Database Setup**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE cloud_kitchen_db;
```

## 📁 Project Structure

```
cloud-kitchen-app/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Auth & error handling
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Helper functions
│   │   └── server.js     # Entry point
│   └── package.json
├── frontend/             # React application (Coming Week 3)
├── docker/               # Docker configuration (Coming Week 5)
│   ├── docker-compose.yml
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── prometheus/
└── docs/                 # Documentation
```

## 🗓️ Development Timeline

| Phase | Weeks | Status | Description |
|-------|-------|--------|-------------|
| **Phase 1** | 1-2 | ✅ In Progress | Backend API Development |
| **Phase 2** | 3-4 | ⏳ Pending | Frontend Development |
| **Phase 3** | 5-6 | ⏳ Pending | AWS Integration & Docker |
| **Phase 4** | 7-8 | ⏳ Pending | Monitoring & Deployment |
| **Phase 5** | 9-10 | ⏳ Pending | CI/CD & Polish |
| **Buffer** | 11-12 | ⏳ Pending | Testing & Documentation |

## ✅ Current Progress: Week 1

### Completed
- ✅ Project structure created
- ✅ Backend package.json configured
- ✅ Database configuration with Sequelize
- ✅ User, MenuItem, Order, OrderItem models
- ✅ JWT authentication utilities
- ✅ Auth, Menu, Order controllers
- ✅ API routes configured
- ✅ Error handling middleware
- ✅ Express server setup

### Next Steps (Week 1 Remaining)
- 🔄 Test local backend setup
- 🔄 Create seed data for testing
- 🔄 Test all API endpoints
- 🔄 Write API documentation

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation
- SQL injection protection (Sequelize ORM)
- CORS configuration
- Helmet.js security headers

## 💰 Cost Optimization

**Total AWS Cost: $0.00**

| Service | Usage | Cost |
|---------|-------|------|
| EC2 t2.micro | 750 hrs/month | $0 (Free Tier) |
| S3 Storage | <5GB images | $0 (Free Tier) |
| RDS | **NOT USED** | $0 |
| CloudWatch | **NOT USED** | $0 |

**Savings:**
- Database on EC2 instead of RDS: ~$15-20/month
- Self-hosted monitoring: ~$3-5/month
- **Total Savings: ~$18-25/month**

## 📖 Documentation

- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md) - Coming Week 3
- [Docker Setup Guide](./docker/README.md) - Coming Week 5
- [Deployment Guide](./docs/DEPLOYMENT.md) - Coming Week 7

## 🤝 Contributing

This is an internship learning project. Follow these steps:

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit for review

## 📝 License

MIT License - Skylena Internship Project

## 👥 Team

- **Intern:** [Your Name]
- **Company:** Skylena
- **Duration:** 3 months (Feb 2026 - Apr 2026)

---

**Status:** Week 1 - Backend Foundation ✅
