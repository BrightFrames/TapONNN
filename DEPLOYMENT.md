# Deployment Guide

## Production Environment Variables

### Backend (.env)
When deploying the backend to production, update these environment variables:

```bash
# Your production backend URL (IMPORTANT!)
# For tapx.bio VPS:
BASE_URL=https://tapx.bio

# Or if using subdomain:
# BASE_URL=https://api.tapx.bio

# MongoDB connection
MONGODB_URI=your_production_mongodb_uri

# Keep your JWT secret secure
JWT_SECRET=your_secure_jwt_secret

# Other configs...
```

### Frontend (.env)
When deploying the frontend to production:

```bash
# Point to your production backend API
# For tapx.bio VPS:
VITE_API_URL=https://tapx.bio/api

# Or if using subdomain:
# VITE_API_URL=https://api.tapx.bio/api
```

## Deployment Platforms

### VPS Deployment (tapx.bio) ⭐
**See [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) for detailed VPS-specific instructions.**

### Vercel (Frontend)
1. Add environment variable in Vercel dashboard:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.com/api`

### Render/Railway/Heroku (Backend)
1. Add environment variables in platform dashboard:
   - `BASE_URL`: Your backend's public URL (e.g., `https://your-app.render.com`)
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your secret key

### Testing Image URLs
After deployment, verify image uploads work by:
1. Upload a test image
2. Check the returned URL - it should use your production domain, not localhost
3. Verify the image is accessible publicly

## Image Storage Notes

Currently, images are stored in the `/uploads` directory on the backend server. For production at scale, consider:
- Using cloud storage (AWS S3, Cloudinary, etc.)
- Implementing a CDN for faster image delivery
- Setting up proper backup strategies

## Troubleshooting

### Images showing localhost URLs in production
- ✅ Ensure `BASE_URL` is set in backend environment variables
- ✅ Restart your backend server after updating environment variables
- ✅ Clear browser cache and test with a new upload

### CORS errors
- Check that frontend URL is in backend CORS configuration
- Update `backend/server.js` CORS settings if needed
