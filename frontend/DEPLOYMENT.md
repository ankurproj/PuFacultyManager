# Professor Publication System - Frontend Deployment (Netlify)

## Netlify Setup

### 1. Create New Site from Git
- Connect your GitHub repository
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `build`

### 2. Environment Variables
Set in Netlify Site settings → Build & deploy → Environment:

```
REACT_APP_API_URL=https://your-api.up.railway.app
```

### 3. SPA Routing
`_redirects` has been added at `frontend/public/_redirects` with:
```
/* /index.html 200
```

### 4. Post-Deployment
1. Confirm CORS on backend allows your Netlify domain
2. Trigger a rebuild if you update env vars
3. Verify API calls hit the Railway URL (Network tab)

## Local Development
```powershell
cd "D:\PROJECT\PU FACULTY MANAGEMENT\frontend"
npm install
npm start    # Development server on localhost:3000
npm run build # Production build
```

## Environment Files
- `.env` - Development (localhost:5000)
- `.env.production` - Production (set to Railway backend URL)