```
     ✨ 📚 ✨
    📖  🪐  📖
   ✨ 📚 ✨ 🌌
```

<div align="center">

# 🌌 PageVault 📚

### *Your Secure Vault for Rare Books, Magazines & Antique Auctions*

> "Every rare book deserves a secure sanctuary. Every collector deserves PageVault." — PageVault Philosophy

[![Powered by Node.js](https://img.shields.io/badge/Powered%20by-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Built with React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-13AA52?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Real-time with Socket.io](https://img.shields.io/badge/Real--time-Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Secure with JWT](https://img.shields.io/badge/Security-JWT-000000?style=for-the-badge)](https://jwt.io/)
[![Images via Cloudinary](https://img.shields.io/badge/Images-Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

</div>

---

```
🌠 ✨ 📖 ✨ 🌠 ✨ 📚 ✨ 🌠 ✨ 📖 ✨ 🌠
```

## 🚀 Welcome Aboard

**PageVault** is a revolutionary full-stack online platform designed for seamless book and magazine transactions with cutting-edge **real-time antique auctions**. Whether you're a passionate book collector, a publisher ready to showcase your work, or an administrator managing a thriving marketplace—PageVault has you covered.

> 💫 **Unlock the vault of literary treasures. Bid with confidence. Collect with pride.**

---

## ✨ Key Features

<table align="center">
<tr>
<td>

### 📱 Multi-Role Dashboards
- **Buyer Dashboard** - Browse, search & purchase
- **Publisher Dashboard** - Manage inventory & analytics  
- **Admin Dashboard** - Platform oversight & control

</td>
<td>

### 🏆 Advanced Features
- **Smart Recommendations** - AI-driven book suggestions
- **Dynamic Pricing** - Real-time demand-based pricing
- **Real-time Bidding** - Live auctions via Socket.io

</td>
</tr>
<tr>
<td>

### 🔐 Security & Trust
- **JWT Authentication** - Secure cookie-based sessions
- **Role-Based Access** - Granular permission control
- **HTTPS Ready** - Enterprise-grade security

</td>
<td>

### 🌍 Global Ready
- **Multi-Language Support** - Scalable i18n architecture
- **Cloudinary CDN** - Fast image delivery worldwide
- **MongoDB Atlas** - Distributed database reliability

</td>
</tr>
<tr>
<td colspan="2">

### 📊 Smart Operations
✅ **Order Tracking** - Monitor deliveries in real-time | ✅ **Publisher Analytics** - Sales insights & trends  
✅ **Auction Notifications** - Instant bid alerts | ✅ **Payment Ready** - Secure gateway integration

</td>
</tr>
</table>

---

## 🌌 Live Auction Spotlight

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🔨 REAL-TIME ANTIQUE AUCTIONS                          ║
║                                                           ║
║  ⚡ Live bidding with instant socket updates             ║
║  📈 Dynamic price tracking                               ║
║  🏆 Rare & collectible items                             ║
║  ⏰ Time-sensitive excitement                            ║
║                                                           ║
║  Join the revolution. Bid. Win. Collect.                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🛠️ Tech Stack Arsenal

<div align="center">

| **Layer** | **Technologies** |
|-----------|-----------------|
| 🎨 **Frontend** | React.js, Vite, Responsive CSS, Babel |
| 🔌 **Backend** | Node.js, Express.js, REST API, Socket.io |
| 💾 **Database** | MongoDB Atlas, Aggregation Pipeline |
| 🔐 **Security** | JWT, HTTP-only Cookies, Role-Based Access |
| 📸 **Media** | Cloudinary, CDN Integration |
| 📡 **Real-time** | Socket.io WebSocket Communication |
| 🧪 **Testing** | Jest, React Testing Library |
| 🐳 **Deployment** | Docker, Netlify, Vercel, Render |

</div>

---

## 📦 Installation & Setup

### Prerequisites

Ensure you have the following installed on your system:

```bash
✓ Node.js v16+          (https://nodejs.org/)
✓ npm or yarn           (Comes with Node.js)
✓ MongoDB Atlas Account (https://www.mongodb.com/atlas)
✓ Cloudinary Account    (https://cloudinary.com/)
✓ Git                   (https://git-scm.com/)
```

### Step-by-Step Installation

#### **Step 1: Clone the Repository**

```bash
git clone https://github.com/pawan00207/PageVault.git
cd PageVault
```

#### **Step 2: Server Setup**

```bash
cd server
npm install
```

Create `.env` file in the `server` directory:

```env
# Database
MONGODB_URI=your_mongodb_atlas_uri

# JWT & Security
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRY=7d
COOKIE_EXPIRY=7

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Server
PORT=5000
NODE_ENV=development
```

Start the server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

Server will run on: **http://localhost:5000**

#### **Step 3: Client Setup**

```bash
cd ../client
npm install
```

Create `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

Client will run on: **http://localhost:5173**

---

## 🚀 Running the Application

### Development Mode

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

### Production Build

```bash
# Build frontend
cd client && npm run build

# Run server in production
cd server && NODE_ENV=production npm start
```

---

## 🧪 Testing

Run comprehensive test suites:

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# E2E tests (if configured)
npm run test:e2e
```

---

## 📚 API Documentation

For detailed API endpoints and Socket.io events, visit:

- **Swagger API Docs**: `http://localhost:5000/api-docs`
- **API Documentation**: [server/API_DOC.md](./server/API_DOC.md)
- **Swagger Guide**: [server/SWAGGER_GUIDE.md](./server/SWAGGER_GUIDE.md)

---

## 🏗️ Project Structure

```
PageVault/
├── 📁 client/                 # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable React Components
│   │   ├── pages/             # Page Components
│   │   ├── context/           # Context API State
│   │   ├── services/          # API Services
│   │   ├── hooks/             # Custom Hooks
│   │   └── utils/             # Utility Functions
│   └── vite.config.js
│
├── 📁 server/                 # Node.js Backend
│   ├── controllers/           # Request Handlers
│   ├── models/                # MongoDB Schemas
│   ├── routes/                # API Routes
│   ├── middleware/            # Custom Middleware
│   ├── services/              # Business Logic
│   ├── config/                # Configuration Files
│   ├── sockets/               # Socket.io Events
│   └── server.js
│
└── 📁 tests/                  # Test Suites
```

---

## 🌟 Features in Action

### 🎯 Buyer Experience
```
Browse → Search → Bid/Purchase → Track → Receive
   ✨      🔍        💳          📦      🎉
```

### 📊 Publisher Power
```
Create → Upload → Monitor → Earn → Grow
  ✍️      📸      📈      💰    🚀
```

### 👑 Admin Control
```
Dashboard → Monitor → Manage → Optimize → Secure
   📊        👁️       🎛️       ⚙️        🔒
```

---

## 🔄 WebSocket Events (Real-time)

```javascript
// Auction Events
'auction:bid'          → New bid placed
'auction:update'       → Auction state changed
'auction:endingSoon'   → Auction ending notification
'notification:alert'   → Real-time alerts
'order:status'         → Order status updates
```

---

## 🎨 Design Highlights

- ✅ **Responsive Design** - Mobile, Tablet, Desktop optimized
- ✅ **Dark Mode Ready** - Modern UI/UX
- ✅ **Accessibility** - WCAG compliant
- ✅ **Performance** - Optimized load times
- ✅ **SEO Friendly** - Meta tags & structured data

---

## 📝 Environment Variables Checklist

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Token signing key | `your_random_secret_string` |
| `CLOUDINARY_*` | Image hosting credentials | Obtained from Cloudinary dashboard |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment type | `development` or `production` |

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 🙏 Acknowledgments

```
🌌 ✨ 📚 ✨ 🌌
Special thanks to the open-source community
for building incredible tools and libraries
that power PageVault.
✨ 📚 ✨ 🌌 ✨
```

---

## 👤 Developer Profile

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  💼 FULL STACK DEVELOPER                              ║
║                                                        ║
║  ┌────────────────────────────────────────────────┐  ║
║  │  👨‍💻 Pawan Singh                                 │  ║
║  │                                                 │  ║
║  │  📍 Greater Noida, Uttar Pradesh, India       │  ║
║  │  💼 Role: Full Stack Developer                │  ║
║  │  🎯 Specialty: MERN Stack & Real-time Apps   │  ║
║  │                                                 │  ║
║  │  📧 Email:                                     │  ║
║  │     pawan9140582015@gmail.com                 │  ║
║  │                                                 │  ║
║  │  🔗 Connect With Me:                           │  ║
║  │  └─ GitHub: github.com/pawan00207            │  ║
║  │  └─ LinkedIn: linkedin.com/in/pawan-singh... │  ║
║  │  └─ Phone: +91-9170336663                    │  ║
║  │                                                 │  ║
║  │  🎓 Passionate about:                         │  ║
║  │     • Building scalable web applications      │  ║
║  │     • Real-time communication systems         │  ║
║  │     • User-centric design & performance      │  ║
║  │     • Open-source contributions              │  ║
║  │                                                 │  ║
║  └────────────────────────────────────────────────┘  ║
║                                                        ║
║  "Code is poetry. PageVault is my canvas."          ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

<div align="center">

### 🌠 Quick Links 🌠

[📖 Explore Documentation](./server/API_DOC.md) • [🐛 Report Issues](https://github.com/pawan00207/PageVault/issues) • [⭐ Star the Repository](https://github.com/pawan00207/PageVault)

---

```
   📚 ✨ 🌌 ✨ 📚
  Secure. Collect. Celebrate.
   ✨ 🌌 ✨ 📚 ✨
```

**Made with ❤️ by Pawan Singh** • © 2024 PageVault • All rights reserved.

</div>
