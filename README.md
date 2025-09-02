# 🏠 HomeEase Application

A full-stack home services platform built with React and Node.js that connects homeowners with trusted service providers.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
```bash
git clone https://github.com/Patevansh/HomeEase.git
cd HomeEase/homeease-app
```

2. **Backend Setup:**
```bash
cd backend
npm install
cp .env.example .env  # Update with your configuration
npm start
```

3. **Frontend Setup:**
```bash
cd ../frontend
npm install
npm start
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🏗️ Project Structure

```
homeease-app/
├── backend/                    # Express.js API Server
│   ├── config/                # Configuration files
│   │   └── passport.js        # OAuth strategies
│   ├── models/                # MongoDB schemas
│   │   ├── User.js           # User model
│   │   ├── Service.js        # Service model
│   │   ├── Booking.js        # Booking model
│   │   └── Review.js         # Review model
│   ├── routes/               # API endpoints
│   │   ├── auth.js          # Authentication routes
│   │   ├── users.js         # User management
│   │   ├── services.js      # Service operations
│   │   ├── bookings.js      # Booking management
│   │   ├── reviews.js       # Review system
│   │   ├── admin.js         # Admin operations
│   │   ├── provider.js      # Provider operations
│   │   └── analytics.js     # Analytics endpoints
│   ├── middleware/          # Custom middleware
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
│
├── frontend/               # React Application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── layout/   # Header, Footer, Navigation
│   │   │   ├── auth/     # Login, Register components
│   │   │   ├── booking/  # Booking related components
│   │   │   └── common/   # Shared UI components
│   │   ├── pages/        # Page components
│   │   │   ├── Home.js           # Landing page
│   │   │   ├── Login.js          # Login page
│   │   │   ├── Register.js       # Registration
│   │   │   ├── Services.js       # Service listing
│   │   │   ├── Checkout.js       # Booking checkout
│   │   │   ├── AdminDashboard.js # Admin panel
│   │   │   ├── ProviderDashboard.js
│   │   │   └── UserBookings.js
│   │   ├── contexts/     # React contexts
│   │   │   └── AuthContext.js
│   │   ├── utils/        # Utility functions
│   │   ├── App.js        # Main App component
│   │   └── index.js      # Entry point
│   └── package.json      # Frontend dependencies
│
└── README.md             # This file
```

## ✨ Features

### 🔐 Authentication System
- JWT-based authentication
- Google OAuth integration
- Facebook OAuth integration
- Role-based access (Customer, Provider, Admin)
- Auto admin account creation

### 📱 User Roles

#### 👤 Customers
- Browse and search services
- Book services with scheduling
- Track booking status
- Leave reviews and ratings
- Manage profile and booking history

#### 🔧 Service Providers
- Create and manage services
- Handle booking requests
- Track earnings and performance
- Manage availability
- View customer feedback

#### 👨‍💼 Admin
- Platform analytics dashboard
- User and provider management
- Service moderation
- Revenue tracking
- System configuration

### 📊 Analytics & Reporting
- Revenue tracking (completed bookings only)
- Provider performance metrics
- Popular services analysis
- User growth statistics
- Booking trends and insights

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + Passport.js (OAuth)
- **Security:** Helmet, bcrypt, rate limiting
- **Validation:** Express Validator
- **File Upload:** Multer
- **Email:** Nodemailer (configurable)
- **Payments:** Stripe integration

### Frontend
- **Framework:** React 18 with functional components
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **State Management:** React Context + React Query
- **Notifications:** React Hot Toast
- **Date Handling:** date-fns

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/homeease

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Auto Admin Creation
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
ADMIN_EMAIL=admin@homeease.com
ADMIN_PHONE=9999999999
ADMIN_PASSWORD=admin123

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Payment Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 🔑 Default Login Credentials

The system automatically creates an admin account:

**Admin Account:**
- Email: `admin@homeease.com`
- Password: `admin123`

**Test Customer Account:**
- Register as a customer through the frontend

**Test Provider Account:**
- Register as a provider and wait for admin approval

## 📡 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/google       # Google OAuth
GET  /api/auth/facebook     # Facebook OAuth
```

### Service Management
```
GET    /api/services        # Get all services
POST   /api/services        # Create service (provider)
PUT    /api/services/:id    # Update service
DELETE /api/services/:id    # Delete service
```

### Booking System
```
GET  /api/bookings          # Get user bookings
POST /api/bookings          # Create booking
PUT  /api/bookings/:id      # Update booking status
```

### Admin Operations
```
GET /api/admin/analytics    # Platform analytics
GET /api/admin/users        # All users
PUT /api/admin/users/:id    # Update user status
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm start
```

### Production Build
```bash
# Frontend production build
cd frontend && npm run build

# Backend production
cd backend && NODE_ENV=production npm start
```

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt (10 rounds)
- **Rate Limiting** to prevent API abuse
- **CORS Configuration** for secure cross-origin requests
- **Helmet.js** for security headers
- **Input Validation** and sanitization
- **OAuth Integration** for secure third-party login

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers (1024px+)
- Tablets (768px - 1023px)
- Mobile devices (320px - 767px)

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod  # Linux
   brew services start mongodb-community  # macOS
   ```

2. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000 and 5000
   npx kill-port 3000
   npx kill-port 5000
   ```

3. **OAuth Login Not Working**
   - Check OAuth credentials in `.env`
   - Verify redirect URLs in OAuth app settings
   - Ensure frontend URL is correctly configured

## 📈 Performance Features

- **Code Splitting** for faster load times
- **Image Optimization** with lazy loading
- **API Response Caching** where appropriate
- **Database Indexing** for faster queries
- **Pagination** for large data sets
- **Debounced Search** for better UX

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use ESLint configuration provided
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Open an issue in the repository
- Check existing documentation
- Review the troubleshooting section

---

**Built with ❤️ using React and Node.js**
