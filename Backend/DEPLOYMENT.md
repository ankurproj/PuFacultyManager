# Professor Publication System - Deployment

This project deploys best as:
- Backend API: Railway
- Frontend (React/CRA): Netlify

## Backend on Railway

1. Create New Project → Deploy from GitHub → select this repo
2. Project settings (Monorepo):
	- Root directory: `Backend`
	- Build command: `npm install`
	- Start command: `npm start`
3. Environment variables:
```
MONGO_URI=<your-mongodb-atlas-uri>
TOKEN=<your-jwt-secret>
PORT=5000
ALLOWED_ORIGINS=https://<your-frontend-domain>
```
4. Health check: `/` (returns "Server is running")
5. Copy the public URL (e.g., `https://your-api.up.railway.app`)

## Frontend on Netlify

1. New site from Git → select this repo
2. Build settings:
	- Base directory: `frontend`
	- Build command: `npm run build`
	- Publish directory: `build`
3. Environment variables:
```
REACT_APP_API_URL=https://your-api.up.railway.app
```
4. SPA routing: `_redirects` is already added at `frontend/public/_redirects`
5. Deploy and test the site URL

## Local Development
```powershell
cd "D:\PROJECT\PU FACULTY MANAGEMENT\Backend"; npm install; npm run dev
cd "D:\PROJECT\PU FACULTY MANAGEMENT\frontend"; npm install; npm start
```

## Notes
- CORS is now controlled via `ALLOWED_ORIGINS` (comma-separated)
- Never commit real `.env`. Use `Backend/.env.example` as a template.