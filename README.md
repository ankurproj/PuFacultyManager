# Professor Publication Management System

A comprehensive web application for managing faculty profiles, publications, research activities, and administrative tasks in academic institutions.

## 🚀 Live Demo
- **Frontend**: [Coming Soon - Deploy on Render]
- **Backend API**: [Coming Soon - Deploy on Render]

## 🏗️ Architecture

### Frontend (React.js)
- Modern React application with routing
- JWT-based authentication
- Responsive design with custom CSS
- Role-based access control (Faculty, HOD, Dean)

### Backend (Node.js/Express)
- RESTful API with Express.js
- MongoDB database with Mongoose ODM
- JWT authentication & bcrypt password hashing
- Comprehensive faculty data management

## 📋 Features

### For Faculty Members
- ✅ Complete profile management
- ✅ Publications tracking (journals, conferences, books)
- ✅ Research guidance records
- ✅ Patents and innovation management
- ✅ Fellowship and awards tracking
- ✅ Experience and training records
- ✅ Project and consultancy management

### For HODs/Administrators
- ✅ Faculty directory with search/filter
- ✅ View detailed faculty profiles
- ✅ Generate comprehensive reports
- ✅ Profile picture integration
- ✅ Export functionality

## 🛠️ Technology Stack

### Frontend
- React 19.1.1
- React Router DOM 7.9.1
- JWT Decode 4.0.0
- React Icons 5.5.0

### Backend
- Node.js with Express 5.1.0
- MongoDB with Mongoose 8.18.1
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled

## 🚀 Quick Deploy to Render

### Option 1: Using render.yaml (Recommended)
1. Fork this repository
2. Connect to Render
3. Render will automatically detect `render.yaml` and deploy both services
4. Update frontend environment variable with backend URL

### Option 2: Manual Deployment

#### Backend Deployment
1. Create new **Web Service** on Render
2. Connect GitHub repository
3. Set root directory: `Backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   TOKEN=your_jwt_secret_key
   ```

#### Frontend Deployment
1. Create new **Static Site** on Render
2. Connect GitHub repository
3. Set root directory: `frontend`
4. Build command: `npm install && npm run build`
5. Publish directory: `build`
6. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

## 💻 Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup
1. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/Professor_Publication.git
   cd Professor_Publication
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install

   # Create .env file with:
   MONGO_URI=your_mongodb_connection
   TOKEN=your_jwt_secret

   npm run dev  # Development with nodemon
   # or
   npm start    # Production
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start    # Runs on localhost:3000
   ```

## 🔧 Environment Configuration

### Backend (.env)
```properties
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
TOKEN=your_jwt_secret_key_here
PORT=5000
```

### Frontend (.env)
```properties
REACT_APP_API_URL=http://localhost:5000
```

### Frontend (.env.production)
```properties
REACT_APP_API_URL=https://your-backend-service.onrender.com
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /login` - User login
- `POST /signup` - User registration

### Profile Management
- `GET /api/professor/profile` - Get user profile
- `PUT /api/professor/profile` - Update profile
- `GET /api/professor/profile/:id` - Get specific professor (HOD only)

### Data Endpoints
- Publications, Patents, Fellowship, Experience
- Research Guidance, Projects, Training
- Conference participation, E-education
- MOUs and Collaborations

## 🔐 Security Features
- JWT token authentication
- Password hashing with bcryptjs
- Role-based access control
- CORS protection
- Input validation

## 🤝 Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License
This project is licensed under the ISC License.

## 👥 Authors
- **Developer**: [Your Name]
- **Institution**: Pondicherry University

## 🆘 Support
For support, email your-email@domain.com or create an issue in this repository.

---

**Ready for Production Deployment** ✅
- Environment configurations ready
- Database connections configured
- Build scripts optimized
- Deployment documentation complete