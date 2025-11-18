# Professor Publication System - Backend

## Render Deployment Instructions

### 1. Create New Web Service
- Connect your GitHub repository
- Select "Backend" folder as root directory
- Environment: Node

### 2. Build & Start Commands
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3. Environment Variables
Set these in Render dashboard:

```
MONGO_URI=mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience?retryWrites=true&w=majority&appName=Cluster1
TOKEN=asldmfalwekawoeirjsadfnzxcvaoeihrfkasmwaerlkjs
PORT=5000
```

### 4. Health Check
The service will be available at: `https://your-service-name.onrender.com`

Test endpoint: `https://your-service-name.onrender.com/` should return "Server is running"

## Local Development
```bash
npm install
npm run dev  # Uses nodemon for development
npm start    # Production start
```