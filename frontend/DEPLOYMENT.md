# Professor Publication System - Frontend

## Render Deployment Instructions

### 1. Create New Static Site
- Connect your GitHub repository
- Select "frontend" folder as root directory
- Build Command: `npm run build`
- Publish Directory: `build`

### 2. Environment Variables
Set in Render dashboard:

```
REACT_APP_API_URL=https://your-backend-service-name.onrender.com
```

**Important**: Replace `your-backend-service-name` with your actual backend service name from Render.

### 3. Build Settings
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Node Version**: 18 (or latest LTS)

### 4. Post-Deployment
1. Update `REACT_APP_API_URL` with your backend service URL
2. Trigger a rebuild
3. Test all functionality

## Local Development
```bash
npm install
npm start    # Development server on localhost:3000
npm run build # Production build
```

## Environment Files
- `.env` - Development (localhost:5000)
- `.env.production` - Production (update with Render backend URL)