# 🏠 HomeEase - Advanced Home Services Platform

A comprehensive home services platform built with React.js and Node.js, featuring intelligent location-based filtering, automated email notifications, real-time booking management, and a beautiful mobile-responsive design.

## ✨ Key Features

### 🎯 **Latest Enhancements**
- 📧 **Automated Email Notifications** - Beautiful HTML emails for all booking status changes
- 📍 **Location-Based Filtering** - Find providers by pincode with intelligent matching
- 📱 **Mobile-Optimized Provider Interface** - Fixed-height modals with smooth scrolling
- 🎨 **Beautiful Pincode Input Modal** - Animated modal with suggestions and statistics
- ⚡ **Real-time Status Updates** - Live booking status tracking with email notifications
- 🔄 **Enhanced Admin Panel** - Comprehensive provider details with business information

### 👤 **For Customers**
- 🔍 **Smart Service Discovery** - Browse services with location-based filtering
- 📍 **Pincode-Based Search** - Find providers in your area with beautiful input modal
- 📅 **Flexible Booking System** - Easy scheduling with calendar integration
- 📧 **Email Notifications** - Professional emails for every booking status change:
  - Booking confirmation emails
  - Status updates (pending → confirmed → in-progress → completed)
  - Service provider arrival notifications
- ⭐ **Review System** - Rate and review providers with enhanced modal interface
- 🛒 **Shopping Cart** - Multi-service booking with pricing breakdown
- 📱 **Mobile-Optimized** - Fully responsive design for all devices

### 🔧 **For Service Providers**
- 📊 **Advanced Dashboard** - Comprehensive analytics with earnings tracking
- 📱 **Mobile-Friendly Status Updates** - Fixed-height modals that work on any screen size
- 🔄 **Real-Time Booking Management** - Instant notifications and status updates
- 📈 **Performance Analytics** - Track completed services and earnings
- 📧 **Automated Customer Communication** - Emails sent automatically on status changes
- 📍 **Location Management** - Set service areas with pincode coverage
- 💰 **Revenue Tracking** - Real-time earnings calculation from completed bookings

### 👨‍💼 **For Administrators**
- 👥 **User Management** - Complete user and provider oversight
- ✅ **Provider Approval Workflow** - Detailed provider verification process
- 📊 **Platform Analytics** - Comprehensive insights and reporting
- 🎛️ **Service Management** - Full control over platform offerings
- 📧 **Email System Management** - Monitor and configure notification system
- 📍 **Location Analytics** - View provider distribution by pincode
- 🔍 **Enhanced Provider Details** - Complete business information view including:
  - Business and personal information
  - GST and PAN numbers
  - Bank account details
  - Business and personal addresses
  - Service history and ratings

## � **Email Notification System**

### **Automated Email Types**
1. **Booking Confirmation** - "Booking Received - We'll Confirm Soon!"
2. **Status Updates**:
   - "Booking Confirmed - We're Coming!"
   - "Service Started - We're On Our Way!"
   - "Service Completed - Thank You!"
   - "Booking Cancelled"
3. **Real-Time Service Updates**:
   - "Service Provider On The Way!"
   - "Service In Progress"
   - "Service Completed Successfully!"

### **Email Features**
- 🎨 **Beautiful HTML Templates** with HomeEase branding
- 📱 **Mobile-Responsive Design** that works on all email clients
- 📋 **Detailed Booking Information** with service breakdown
- � **Status-Specific Messaging** with appropriate colors and icons
- 🔗 **Call-to-Action Links** for tracking and rating services
- 📞 **Support Information** included in every email

## 📍 **Location-Based Features**

### **Intelligent Pincode Matching**
- 🎯 **Smart Provider Filtering** - Find providers in your exact area
- 📊 **Location Statistics** - View provider count and services by pincode
- �️ **Nearby Service Indicators** - Visual badges for local providers
- 💡 **Popular Pincode Suggestions** - Quick access to common areas

### **Beautiful Pincode Input**
- 🎨 **Animated Modal Interface** with smooth transitions
- ✨ **Real-Time Validation** - Instant feedback on pincode entry
- 📊 **Location Statistics Display** - Show available providers and services
- 💭 **Smart Suggestions** - Popular pincodes in a beautiful grid layout

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
```bash
git clone https://github.com/Vatsal1805/HomeEase.git
cd HomeEase
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
- Backend API: http://localhost:5001

## 🏗️ **Project Structure**

```
HomeEase/
├── backend/                         # Node.js Express API Server
│   ├── config/                     # Configuration files
│   │   └── passport.js            # OAuth strategies (Google, Facebook)
│   ├── middleware/                 # Custom middleware
│   │   └── auth.js                # JWT authentication middleware
│   ├── models/                     # MongoDB Mongoose schemas
│   │   ├── User.js                # User model with provider details
│   │   ├── Service.js             # Service model with provider info
│   │   ├── Booking.js             # Booking model with status tracking
│   │   └── Review.js              # Review and rating model
│   ├── routes/                     # API endpoint handlers
│   │   ├── auth.js                # Authentication & OAuth routes
│   │   ├── users.js               # User profile management
│   │   ├── services.js            # Service CRUD + location filtering
│   │   ├── bookings.js            # Booking management + email triggers
│   │   ├── reviews.js             # Review system
│   │   ├── admin.js               # Admin operations + provider details
│   │   ├── provider.js            # Provider dashboard & earnings
│   │   ├── analytics.js           # Platform analytics & insights
│   │   └── health.js              # System health checks
│   ├── services/                   # Business logic services
│   │   └── emailService.js        # Email notification system
│   ├── scripts/                    # Utility scripts
│   │   └── create-admin.js        # Admin account creation
│   ├── server.js                   # Main application entry point
│   ├── .env.example               # Environment variables template
│   └── package.json               # Dependencies and scripts
│
├── frontend/                       # React Application
│   ├── public/                    # Static assets
│   │   ├── index.html            # HTML template
│   │   └── favicon.svg           # App icon
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── layout/          # Navigation & layout
│   │   │   │   ├── Header.js    # Main navigation with auth
│   │   │   │   └── Footer.js    # Site footer
│   │   │   ├── auth/           # Authentication components
│   │   │   │   └── AuthModal.js # Login/register modal
│   │   │   ├── cart/           # Shopping cart functionality
│   │   │   │   └── CartSidebar.js
│   │   │   ├── ServiceStatusModal.js  # Provider status update (mobile-optimized)
│   │   │   ├── ReviewModal.js         # Review submission (height-fixed)
│   │   │   ├── AnalyticsModal.js      # Admin analytics display
│   │   │   └── PincodeModal.js        # Beautiful pincode input
│   │   ├── pages/              # Main page components
│   │   │   ├── Home.js         # Landing page
│   │   │   ├── Services.js     # Service listing with location filtering
│   │   │   ├── Checkout.js     # Booking checkout process
│   │   │   ├── Profile.js      # User profile with address management
│   │   │   ├── AdminDashboard.js    # Admin overview
│   │   │   ├── AdminUsers.js        # User management
│   │   │   ├── AdminServices.js     # Service management
│   │   │   ├── AdminReviews.js      # Review moderation
│   │   │   ├── PendingProviders.js  # Provider approval queue
│   │   │   ├── ProviderDashboard.js # Provider analytics & earnings
│   │   │   ├── ProviderBookings.js  # Provider booking management
│   │   │   ├── ManageServices.js    # Provider service management
│   │   │   ├── UserBookings.js      # Customer booking history
│   │   │   ├── ReviewsPage.js       # Public reviews display
│   │   │   ├── Login.js            # Login page
│   │   │   ├── Register.js         # Registration page
│   │   │   ├── About.js            # About page
│   │   │   ├── Contact.js          # Contact page
│   │   │   ├── NotFound.js         # 404 error page
│   │   │   └── AuthSuccess.js      # OAuth success handler
│   │   ├── contexts/           # React Context providers
│   │   │   ├── AuthContext.js  # Authentication state + axios config
│   │   │   └── CartContext.js  # Shopping cart state
│   │   ├── utils/             # Utility functions
│   │   │   ├── authUtils.js   # Authentication helpers
│   │   │   └── errorHandler.js # Error handling utilities
│   │   ├── App.js             # Main application component
│   │   ├── index.js           # React DOM entry point
│   │   └── index.css          # Global styles with Tailwind
│   ├── .env                   # Environment variables (API URL)
│   ├── package.json           # Dependencies and scripts
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── postcss.config.js      # PostCSS configuration
│
├── .gitignore                 # Git ignore rules
└── README.md                  # This comprehensive guide
```

## 🛠️ **Technology Stack**

### **Backend Technologies**
- **Runtime:** Node.js 18+ with Express.js framework
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens + Passport.js for OAuth
- **Email Service:** Nodemailer with Ethereal Email (development) / Gmail (production)
- **Security:** Helmet.js, bcrypt hashing, rate limiting, CORS
- **Validation:** Express Validator with custom middleware
- **File Upload:** Multer for image handling
- **Environment:** dotenv for configuration management

### **Frontend Technologies**
- **Framework:** React 18 with functional components and hooks
- **Routing:** React Router DOM v6 with protected routes
- **Styling:** Tailwind CSS with custom configurations
- **Animations:** Framer Motion for smooth transitions
- **HTTP Client:** Axios with interceptors and base URL configuration
- **State Management:** React Context API with useReducer
- **Forms:** Controlled components with validation
- **Notifications:** React Hot Toast for user feedback
- **Icons:** Font Awesome for consistent iconography

### **Development Tools**
- **Package Management:** npm with package-lock.json
- **Code Quality:** ESLint with React and Node.js configurations
- **API Testing:** Built-in health checks and validation
- **Version Control:** Git with comprehensive .gitignore

## 🚀 **Quick Start Guide**

### **Prerequisites**
- Node.js 18 or higher ([Download](https://nodejs.org/))
- MongoDB 6.0 or higher ([Install Guide](https://docs.mongodb.com/manual/installation/))
- npm (comes with Node.js)
- Git for cloning the repository

### **Step-by-Step Installation**

#### **1. Clone Repository**
```bash
git clone https://github.com/Vatsal1805/HomeEase.git
cd HomeEase
```

#### **2. Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configurations
# (See Environment Variables section below)
# Note: OAuth configuration is OPTIONAL for basic functionality

# Start the backend server
npm start
```
The backend will start on `http://localhost:5000`

#### **3. Frontend Setup**
```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file (optional)
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# Start the frontend server
npm start
```
The frontend will start on `http://localhost:3000`

#### **4. Access the Application**
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### **Default Admin Account**
The system automatically creates an admin account on first startup using your `.env` file configuration:
- **Email:** As specified in your `ADMIN_EMAIL` environment variable
- **Password:** As specified in your `ADMIN_PASSWORD` environment variable

⚠️ **CRITICAL:** Configure secure credentials in your `.env` file before starting the application!

## ✨ Features

### 🔐 Authentication System
- JWT-based authentication (required)
- Email/password registration and login
- Google OAuth integration (optional)
- Facebook OAuth integration (optional)
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

## ⚙️ **Environment Variables Configuration**

### **Backend Environment Variables**
Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/your_database_name

# JWT Authentication
JWT_SECRET=your_very_long_random_secret_key_minimum_32_characters
JWT_EXPIRE=7d

# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Auto Admin Account (CHANGE THESE IMMEDIATELY!)
ADMIN_FIRST_NAME=Your_Admin_First_Name
ADMIN_LAST_NAME=Your_Admin_Last_Name
ADMIN_EMAIL=your_admin_email@yourdomain.com
ADMIN_PHONE=+1234567890
ADMIN_PASSWORD=your_very_secure_admin_password

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_ethereal_username
EMAIL_PASS=your_ethereal_password
# For production, use Gmail:
# EMAIL_HOST=smtp.gmail.com
# EMAIL_USER=your_business_email@gmail.com
# EMAIL_PASS=your_gmail_app_specific_password

# OAuth Configuration (OPTIONAL - Remove if not using social login)
# Get credentials from respective developer consoles
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Payment Integration (OPTIONAL - Remove if not using payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_publishable_key
```

### **Frontend Environment Variables**
Create a `.env` file in the `frontend/` directory:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000

# Optional: Analytics Integration
REACT_APP_GA_TRACKING_ID=your_google_analytics_tracking_id

# Optional: Environment identifier
REACT_APP_ENV=development

# Optional: Application Branding
REACT_APP_SITE_NAME=Your_Platform_Name
```

⚠️ **SECURITY WARNING:** 
- **Never commit `.env` files to version control**
- **Change ALL default credentials immediately**  
- **Use strong passwords (12+ characters, mixed case, numbers, symbols)**
- **Generate random JWT secrets (32+ characters)**
- **Use environment-specific configuration for production**

## 🔑 **Default Login Credentials**

### ⚠️ **IMPORTANT SECURITY NOTICE:**
The system creates an admin account on first startup using your `.env` configuration:
- **Email:** As configured in `ADMIN_EMAIL` (you must set this)
- **Password:** As configured in `ADMIN_PASSWORD` (you must set this)

### **Security Requirements:**
- **IMMEDIATELY change default credentials** after first login
- **Use strong passwords** (12+ characters, mixed case, numbers, symbols)  
- **Never use simple passwords** like `admin123` or `password`
- **Enable two-factor authentication** if available

### **For Development Testing:**
- **Customer Account:** Register through the frontend interface
- **Provider Account:** Register as provider and wait for admin approval
- **Test carefully** with non-production data only

## 📡 **API Documentation**

### **Authentication Endpoints**
```http
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # User login
POST   /api/auth/logout            # User logout
PUT    /api/auth/profile           # Update user profile
POST   /api/auth/change-password   # Change user password

# OAuth Endpoints (OPTIONAL - Only if OAuth is configured)
GET    /api/auth/google            # Google OAuth initiate
GET    /api/auth/facebook          # Facebook OAuth initiate
GET    /api/auth/google/callback   # Google OAuth callback
GET    /api/auth/facebook/callback # Facebook OAuth callback
POST   /api/auth/change-password   # Change user password
```

### **Service Management Endpoints**
```http
GET    /api/services               # Get all services with filters
POST   /api/services               # Create new service (Provider)
GET    /api/services/:id           # Get service by ID
PUT    /api/services/:id           # Update service (Provider/Admin)
DELETE /api/services/:id           # Delete service (Provider/Admin)
GET    /api/services/provider/:id  # Get services by provider
POST   /api/services/:id/status    # Update service status
```

### **Booking Management Endpoints**
```http
GET    /api/bookings               # Get user's bookings
POST   /api/bookings               # Create new booking
GET    /api/bookings/:id           # Get booking details
PUT    /api/bookings/:id/status    # Update booking status (Provider)
DELETE /api/bookings/:id           # Cancel booking (Customer)
GET    /api/bookings/provider      # Get provider's bookings
POST   /api/bookings/:id/complete  # Mark booking as completed
```

### **Review System Endpoints**
```http
GET    /api/reviews                # Get all reviews with pagination
POST   /api/reviews                # Create new review (Customer)
GET    /api/reviews/service/:id    # Get reviews for specific service
GET    /api/reviews/provider/:id   # Get reviews for specific provider
PUT    /api/reviews/:id            # Update review (Customer)
DELETE /api/reviews/:id            # Delete review (Customer/Admin)
```

### **Admin Management Endpoints**
```http
GET    /api/admin/dashboard        # Admin dashboard with statistics
GET    /api/admin/users            # Get all users with pagination
PUT    /api/admin/users/:id/status # Update user status
GET    /api/admin/providers        # Get all providers
PUT    /api/admin/providers/:id/approve # Approve provider
GET    /api/admin/services         # Get all services for moderation
GET    /api/admin/analytics        # Platform analytics and reports
```

### **API Response Format**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

## 🚀 **Development & Deployment**

### **Development Mode**
```bash
# Backend with auto-restart
cd backend
npm run dev

# Frontend with hot reload
cd frontend
npm start
```

### **Production Build**
```bash
# Build frontend for production
cd frontend
npm run build

# Start backend in production mode
cd backend
NODE_ENV=production npm start
```

### **Docker Deployment (Optional)**
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run individually
docker build -t homeease-backend ./backend
docker build -t homeease-frontend ./frontend
```

## 🔒 **Security Features**

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt (10 rounds)
- **Rate Limiting** to prevent API abuse (100 requests per 15 minutes)
- **CORS Configuration** for secure cross-origin requests
- **Helmet.js** for security headers
- **Input Validation** and sanitization with Express Validator
- **OAuth Integration** for secure third-party login
- **Role-based Access Control** (Customer, Provider, Admin)
- **Secure Email Templates** with HTML sanitization

## 🛡️ **Security Best Practices**

### **Environment Security:**
- Never commit `.env` files to version control
- Use different credentials for development/staging/production
- Regularly rotate JWT secrets and API keys
- Use environment-specific MongoDB databases

### **Password Security:**
- Minimum 12 characters for admin passwords
- Use combination of uppercase, lowercase, numbers, symbols
- Never use common passwords like `admin123`, `password123`
- Consider implementing password complexity requirements

### **Production Deployment:**
- Use HTTPS/SSL certificates (Let's Encrypt recommended)
- Set up firewall rules to restrict database access
- Enable MongoDB authentication and use dedicated user accounts
- Use secure, non-default ports if possible
- Implement backup and disaster recovery procedures

### **API Security:**
- Implement rate limiting for all public endpoints
- Use CORS to restrict allowed origins in production
- Validate and sanitize all user inputs
- Log security events and monitor for suspicious activity
- Keep dependencies updated and scan for vulnerabilities

### **Data Protection:**
- Hash passwords with bcrypt (minimum 10 rounds)
- Never log sensitive information (passwords, tokens)
- Implement data encryption for sensitive fields
- Follow GDPR/data privacy regulations if applicable

## 📱 **Mobile Responsiveness**

The application is fully responsive across all devices:
- **Desktop:** 1024px+ (Full feature set)
- **Tablet:** 768px-1023px (Optimized layout)
- **Mobile:** 320px-767px (Touch-optimized interface)

Key mobile features:
- Touch-friendly buttons and navigation
- Optimized modal heights and scrolling
- Mobile-first provider status updates
- Responsive service cards and booking forms

## 🐛 **Troubleshooting**

### **Common Issues**

1. **MongoDB Connection Error**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod    # Linux
   brew services start mongodb-community  # macOS
   net start MongoDB             # Windows
   ```

2. **Port Already in Use**
   ```bash
   # Kill processes on specific ports
   npx kill-port 3000
   npx kill-port 5000
   ```

3. **Nodemailer/Email Issues**
   ```bash
   # Check Ethereal credentials in logs
   # For Gmail: Enable App Passwords in Google Account
   ```

4. **OAuth Login Problems**
   - Verify OAuth credentials in `.env`
   - Check redirect URLs in provider settings
   - Ensure frontend URL matches OAuth configuration

## � **Performance Optimizations**

- **Database Indexing** for faster queries
- **API Response Caching** where appropriate  
- **Pagination** for large data sets (10 items per page)
- **Debounced Search** (300ms delay)
- **Image Optimization** with lazy loading
- **Code Splitting** in React for faster initial loads
- **Gzip Compression** for API responses

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow ESLint configuration
- Use meaningful commit messages
- Add comments for complex logic  
- Test new features thoroughly
- Update documentation for new features

## 📄 **License**

This project is licensed under the MIT License. See `LICENSE` file for details.

## 📞 **Support & Contact**

- **Issues:** [GitHub Issues](https://github.com/Vatsal1805/HomeEase/issues)
- **Documentation:** This README file
- **Email:** Create your own support email address
- **Wiki:** Check project wiki for detailed documentation

---

**HomeEase Platform - Connecting Home Service Providers with Customers 🏠✨**

*Built with ❤️ using React.js, Node.js, MongoDB, and modern web technologies*
