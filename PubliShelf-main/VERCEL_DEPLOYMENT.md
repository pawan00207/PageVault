# Vercel Deployment Configuration

## Environment Variables to Set in Vercel Dashboard

Go to **Vercel Dashboard** → **Settings** → **Environment Variables** and add:

### Required Variables

```
VITE_BACKEND_URL=https://your-backend-url.com
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Optional Demo Credentials

```
VITE_DEMO_BUYER_EMAIL=demo@buyer.com
VITE_DEMO_BUYER_PASSWORD=demo_password
VITE_DEMO_PUBLISHER_EMAIL=demo@publisher.com
VITE_DEMO_PUBLISHER_PASSWORD=demo_password
VITE_DEMO_MANAGER_EMAIL=demo@manager.com
VITE_DEMO_MANAGER_PASSWORD=demo_password
```

## Steps to Deploy on Vercel

1. **Connect GitHub Repository**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository `pawan00207/PageVault`

2. **Configure Build Settings**
   - Framework Preset: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Add all variables listed above
   - Apply to: `Production`, `Preview`, `Development`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## Troubleshooting 404 Error

If you still see 404 errors:

1. **Check Build Logs** - Look for build failures in Vercel dashboard
2. **Verify Environment Variables** - Make sure `VITE_BACKEND_URL` is set correctly
3. **Check dist folder** - Should be created with `index.html` inside
4. **Clear Cache** - In Vercel Settings → Git, click "Redeploy"

## API Routes

Make sure your backend is running and accessible at the URL set in `VITE_BACKEND_URL`.

Default (for local testing):
```
http://localhost:5000/api
```

Example production URL:
```
https://pagevault-server.onrender.com/api
```
