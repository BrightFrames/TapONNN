# VPS Deployment Configuration for tapx.bio

## Quick Fix for Image URLs

### On Your VPS Server

1. **Edit backend .env file on the VPS**:
```bash
ssh your-vps
cd /path/to/TapONNN/backend
nano .env  # or vi .env
```

2. **Add/Update this line**:
```bash
BASE_URL=https://tapx.bio
```

3. **Restart your backend Node.js process**:
```bash
# If using PM2:
pm2 restart backend

# If using systemd:
sudo systemctl restart tapx-backend

# If running manually:
# Stop the current process and restart
node server.js
```

### Verify the Fix

1. Upload a new image in your app
2. Check the returned URL - it should now be `https://tapx.bio/uploads/...`
3. Visit the URL directly to confirm the image loads

## Frontend Already Configured ✅

Your [frontend/.env.production](frontend/.env.production) is now set to:
```bash
VITE_API_URL=https://tapx.bio/api
```

Next time you build the frontend, it will use the production URL.

## Build and Deploy Frontend

```bash
cd frontend
npm run build
# Upload the 'dist' folder to your VPS web server
```

## Important Notes

- Images are stored in `/backend/uploads/` directory
- Make sure your Nginx/Apache is configured to serve static files from `/uploads`
- Consider setting up automatic backups of the uploads folder
- For better performance, consider using a CDN or cloud storage (Cloudinary, AWS S3) in the future

## Sample Nginx Configuration

```nginx
server {
    server_name tapx.bio;
    
    # Serve uploaded images
    location /uploads/ {
        alias /path/to/TapONNN/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Serve frontend
    location / {
        root /path/to/TapONNN/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```
