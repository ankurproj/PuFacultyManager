# Railway Deployment Configuration

## Backend Service
- **Framework**: Node.js/Express
- **Port**: Dynamic (Railway assigns automatically)
- **Build**: `npm install`
- **Start**: `npm start`

## Environment Variables Required:
```
MONGO_URI=mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience?retryWrites=true&w=majority&appName=Cluster1
TOKEN=asldmfalwekawoeirjsadfnzxcvaoeihrfkasmwaerlkjs
```

## Deployment Steps:
1. Push code to GitHub
2. Connect Railway to GitHub
3. Select repository
4. Railway auto-deploys
5. Add environment variables
6. Get deployment URL

## Frontend Deployment:
- Deploy separately or in same project
- Update REACT_APP_API_URL with Railway backend URL