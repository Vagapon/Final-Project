# Deployment Guide - Render.com

## Prerequisites
- MongoDB Atlas account (or MongoDB instance)
- Render.com account
- Cloudinary account (for image uploads)
- Firebase project (for notifications)
- SePay account (for payment webhooks)

---

## Part 1: Deploy Backend (Node.js/Express)

### Step 1: Prepare Backend Repository
1. Ensure your `backend` folder is in a Git repository
2. Make sure `package.json` has a `start` script:
   ```json
   "scripts": {
     "start": "node ./src/server.js",
     "dev": "nodemon ./src/server.js"
   }
   ```

### Step 2: Create Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Configure the service:
   - **Name**: `your-project-backend` (or any name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose Free or Paid plan

### Step 3: Configure Environment Variables
In Render dashboard, go to **Environment** tab and add:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nMulti-line\nKey\n-----END PRIVATE KEY-----\n"

# SePay
SEPAY_VA=your-virtual-account
SEPAY_BANK=your-bank-code
SEPAY_API_KEY=your-sepay-api-key

# Server
PORT=10000
NODE_ENV=production
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`: Copy the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Replace `\n` with actual newlines in Render's environment variable editor
- `PORT` is automatically set by Render (usually 10000), but you can keep it for reference

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repo
   - Run `npm install`
   - Start the service with `npm start`
3. Wait for deployment to complete (usually 2-5 minutes)
4. Your backend URL will be: `https://your-project-backend.onrender.com`

### Step 5: Update CORS & Socket.IO Configuration
Update `backend/src/server.js` to use environment variable for frontend URL:

```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

Add to Render environment variables:
```env
FRONTEND_URL=https://your-frontend-url.onrender.com
```

---

## Part 2: Deploy Frontend (React/Vite)

### Option A: Deploy on Render (Static Site)

1. Go to Render Dashboard → **"New +"** → **"Static Site"**
2. Connect your Git repository
3. Configure:
   - **Name**: `your-project-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment**: `Node`

4. Add Environment Variables:
```env
VITE_API_BASE_URL=https://your-project-backend.onrender.com/api
VITE_SOCKET_URL=https://your-project-backend.onrender.com
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

5. Click **"Create Static Site"**
6. Your frontend URL: `https://your-project-frontend.onrender.com`

### Option B: Deploy on Netlify (Recommended for Vite)

1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

5. Add Environment Variables in **Site settings** → **Environment variables**:
   - Same variables as Option A (but with `VITE_` prefix)

6. Deploy! Your site will be at: `https://your-project-name.netlify.app`

### Option C: Deploy on Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your Git repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables (same as Option A)
5. Deploy!

---

## Part 3: Update Frontend Code for Production

### Update Socket.IO Connection
In `frontend/src/contexts/SocketContext.jsx`, use environment variable:

```javascript
const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
  auth: {
    token: token
  },
  transports: ['websocket', 'polling']
});
```

### Update API Base URL
Ensure `frontend/src/api/axiosClient.js` uses:
```javascript
baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
```

---

## Part 4: Configure SePay Webhook

1. In SePay dashboard, set webhook URL to:
   ```
   https://your-project-backend.onrender.com/api/payments/webhook/sepay
   ```
   Or:
   ```
   https://your-project-backend.onrender.com/payment/webhook/sepay
   ```

2. Test webhook using SePay's test tool or make a real payment

---

## Part 5: MongoDB Atlas Setup (if using)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (Free tier available)
3. Create database user
4. Whitelist IP addresses:
   - Add `0.0.0.0/0` to allow Render servers
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```
6. Add to Render environment variables as `MONGO_URI`

---

## Part 6: Post-Deployment Checklist

### Backend
- [ ] Backend service is running (check Render logs)
- [ ] MongoDB connection successful
- [ ] Environment variables loaded correctly
- [ ] CORS allows frontend domain
- [ ] Socket.IO endpoint accessible
- [ ] Payment webhook endpoint accessible

### Frontend
- [ ] Frontend builds successfully
- [ ] Environment variables set correctly
- [ ] API calls work (check browser console)
- [ ] Socket.IO connects (check Network tab)
- [ ] Images load from Cloudinary
- [ ] Authentication works

### Integration
- [ ] User can register/login
- [ ] User can create booking
- [ ] Payment QR generates correctly
- [ ] Webhook updates booking status
- [ ] Chat messages send/receive
- [ ] Event schedule generates
- [ ] Match results update ranking

---

## Part 7: Troubleshooting

### Backend Issues

**Problem**: Service crashes on startup
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `MONGO_URI` is correct
- Check `JWT_SECRET` is set

**Problem**: Socket.IO not connecting
- Verify `FRONTEND_URL` in backend env vars
- Check CORS configuration in `server.js`
- Ensure WebSocket is enabled (Render supports it)

**Problem**: Webhook not receiving requests
- Verify webhook URL is publicly accessible
- Check SePay dashboard webhook configuration
- Test with `curl` or Postman

### Frontend Issues

**Problem**: API calls fail
- Verify `VITE_API_BASE_URL` is correct
- Check CORS headers in browser console
- Ensure backend is running

**Problem**: Socket.IO not connecting
- Verify `VITE_SOCKET_URL` matches backend URL
- Check browser console for connection errors
- Ensure token is being sent in auth

**Problem**: Environment variables not working
- Vite requires `VITE_` prefix
- Rebuild after changing env vars
- Clear browser cache

---

## Part 8: Continuous Deployment

Render automatically deploys on every push to your main branch. To disable:
1. Go to service settings
2. Under **"Auto-Deploy"**, toggle off

To deploy manually:
1. Go to **"Manual Deploy"** tab
2. Select branch and click **"Deploy latest commit"**

---

## Part 9: Monitoring & Logs

### View Logs
- Render Dashboard → Your Service → **"Logs"** tab
- Real-time logs available
- Download logs for debugging

### Health Checks
- Render automatically pings your service
- If service fails, Render will restart it
- Check **"Events"** tab for deployment history

---

## Part 10: Custom Domain (Optional)

1. In Render service settings → **"Custom Domains"**
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

---

## Quick Reference: URLs After Deployment

- **Backend API**: `https://your-project-backend.onrender.com/api`
- **Backend Socket.IO**: `https://your-project-backend.onrender.com`
- **Frontend**: `https://your-project-frontend.onrender.com`
- **Payment Webhook**: `https://your-project-backend.onrender.com/api/payments/webhook/sepay`

---

## Notes

- **Free tier limitations**: Services on free tier spin down after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.
- **Database**: Use MongoDB Atlas free tier (512MB) or paid tier for production
- **File uploads**: Cloudinary free tier (25GB storage, 25GB bandwidth/month)
- **SSL**: Render provides free SSL certificates automatically

---

## Support

- [Render Documentation](https://render.com/docs)
- [Render Status](https://status.render.com)
- Check Render logs for detailed error messages

