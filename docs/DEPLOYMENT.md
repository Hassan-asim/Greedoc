# Deployment Guide

This guide covers deploying Greedoc to production environments.

## Prerequisites

- Node.js 18+ installed
- MongoDB database
- OpenAI API key
- Domain name (optional)
- SSL certificate (recommended)

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://your-mongodb-connection-string

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
CLIENT_URL=https://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
```

### Frontend Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=https://your-api-domain.com/api
VITE_ENV=production
VITE_APP_NAME=Greedoc
VITE_APP_VERSION=1.0.0
```

## Database Setup

### MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your server IP addresses
5. Get the connection string and update `MONGODB_URI`

### Local MongoDB

1. Install MongoDB
2. Start MongoDB service
3. Create database: `greedoc`
4. Update `MONGODB_URI` to point to your local instance

## Deployment Options

### Option 1: Traditional VPS/Cloud Server

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 2. Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd greedoc

# Install dependencies
cd server
npm install --production
cd ../client
npm install
npm run build
```

#### 3. Configure PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'greedoc-server',
      script: 'server/server.js',
      cwd: '/path/to/greedoc',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      instances: 'max',
      exec_mode: 'cluster'
    }
  ]
};
```

Start the application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Configure Nginx

Create `/etc/nginx/sites-available/greedoc`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/greedoc/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/greedoc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile for Backend

Create `server/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### 2. Create Dockerfile for Frontend

Create `client/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Create docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: greedoc-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./server
    container_name: greedoc-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/greedoc?authSource=admin
      JWT_SECRET: your-jwt-secret
      OPENAI_API_KEY: your-openai-key
    ports:
      - "5000:5000"
    depends_on:
      - mongodb

  frontend:
    build: ./client
    container_name: greedoc-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

Deploy with Docker:

```bash
docker-compose up -d
```

### Option 3: Cloud Platform Deployment

#### Heroku

1. Install Heroku CLI
2. Create Heroku apps for frontend and backend
3. Set environment variables
4. Deploy:

```bash
# Backend
cd server
heroku create greedoc-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set OPENAI_API_KEY=your-openai-key
git subtree push --prefix server heroku main

# Frontend
cd client
heroku create greedoc-app
heroku config:set VITE_API_URL=https://greedoc-api.herokuapp.com/api
npm run build
git subtree push --prefix client/dist heroku main
```

#### Vercel (Frontend)

1. Install Vercel CLI
2. Deploy frontend:

```bash
cd client
vercel --prod
```

#### Railway (Backend)

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

## SSL Certificate

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs

# Monitor processes
pm2 monit

# Restart application
pm2 restart greedoc-server
```

### Health Checks

Create health check endpoint monitoring:

```bash
# Add to crontab
*/5 * * * * curl -f http://localhost:5000/api/health-check || pm2 restart greedoc-server
```

## Backup Strategy

### Database Backup

```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="your-mongodb-uri" --out="/backups/mongodb_$DATE"
```

### Application Backup

```bash
# Backup application files
tar -czf greedoc_backup_$(date +%Y%m%d).tar.gz /path/to/greedoc
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **HTTPS**: Always use SSL in production
3. **Rate Limiting**: Configure appropriate rate limits
4. **CORS**: Set proper CORS origins
5. **Helmet**: Security headers are already configured
6. **Input Validation**: All inputs are validated
7. **Password Hashing**: Passwords are hashed with bcrypt

## Performance Optimization

1. **Database Indexing**: Ensure proper indexes on MongoDB
2. **Caching**: Implement Redis for session storage
3. **CDN**: Use CDN for static assets
4. **Compression**: Enable gzip compression
5. **Monitoring**: Set up application monitoring

## Troubleshooting

### Common Issues

1. **Port Already in Use**: Change port or kill existing process
2. **Database Connection**: Check MongoDB URI and network access
3. **Environment Variables**: Verify all required variables are set
4. **Build Errors**: Check Node.js version and dependencies

### Logs

```bash
# PM2 logs
pm2 logs greedoc-server

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```
