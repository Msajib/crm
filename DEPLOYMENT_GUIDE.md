# CRM SaaS Platform Deployment Guide

This guide outlines the steps required to deploy the CRM SaaS Platform microservice architecture to a live production server.

## 1. Prerequisites

Before deploying to a production server, ensure the following are installed:
- **Node.js**: v20 or v22 (LTS)
- **NPM** or **Yarn**: For package management
- **PM2**: `npm install -g pm2` (for process management)
- **PostgreSQL**: v14+ (or access to a managed PostgreSQL instance like AWS RDS/Neon)
- **Redis**: v6+ (or access to a managed Redis instance like AWS ElastiCache)
- **Nginx**: For reverse proxying and SSL termination
- **Git**: For version control and codebase fetching

## 2. Infrastructure Setup

### Environment Variables
1. Clone your repository to the production server: `git clone <your-repo-url> /var/www/crm`
2. Navigate to the root directory: `cd /var/www/crm`
3. Copy the example environment file: `cp .env.example .env` (if applicable)
4. Update the `.env` file with production values:
   - Database URLs (`DATABASE_URL` pointing to production Postgres)
   - Redis URLs (`REDIS_URL`)
   - Secret Keys (`JWT_SECRET`, API keys for ElevenLabs, Twilio, OpenAI)
   - Application URLs (e.g., `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1`)

### Database Migration
Run the Prisma migrations against the production database to create all necessary schemas:
```bash
npx prisma generate
npx prisma migrate deploy
```

## 3. Building the Application

Ensure you are in the project root directory, then install all dependencies and build all packages/services.
```bash
# Install dependencies
npm install

# Build all microservices and the Next.js admin panel
npm run build
```
*Note: The `npm run build` utilizes Turborepo to efficiently build all workspaces (`apps/*`, `packages/*`).*

## 4. Running Microservices with PM2

To ensure the microservices remain running, automatically restart on failure, and start on system boot, we use PM2.

Create an `ecosystem.config.js` file in the root of the project with the following structure (or use this if it already exists):

```javascript
module.exports = {
  apps: [
    { name: 'api-gateway', script: 'apps/api-gateway/dist/main.js', env: { NODE_ENV: 'production', PORT: 3000 } },
    { name: 'auth-service', script: 'apps/auth-service/dist/main.js', env: { NODE_ENV: 'production', PORT: 3001 } },
    { name: 'tenant-service', script: 'apps/tenant-service/dist/main.js', env: { NODE_ENV: 'production', PORT: 3002 } },
    { name: 'crm-service', script: 'apps/crm-service/dist/main.js', env: { NODE_ENV: 'production', PORT: 3003 } },
    { name: 'communication-service', script: 'apps/communication-service/dist/main.js', env: { NODE_ENV: 'production', PORT: 3004 } },
    { name: 'marketing-service', script: 'apps/marketing-service/dist/main.js', env: { NODE_ENV: 'production', PORT: 3005 } },
    { name: 'payment-service', script: 'apps/payment-service/dist/main.js', env: { NODE_ENV: 'production', PORT: 3006 } },
    { name: 'analytics-service', script: 'apps/analytics-service/dist/main.js', env: { NODE_ENV: 'production', PORT: 3007 } },
    { name: 'ai-service', script: 'apps/ai-service/dist/main.js', env: { NODE_ENV: 'production', PORT: 3008 } },
    { name: 'import-service', script: 'apps/import-service/dist/main.js', env: { NODE_ENV: 'production', PORT: 3009 } },
    { name: 'credential-service', script: 'apps/credential-service/dist/main.js', env: { NODE_ENV: 'production', PORT: 3010 } },
    { name: 'voice-service', script: 'apps/voice-service/dist/main.js', env: { NODE_ENV: 'production', PORT: 3011 } },
    // Next.js Frontend
    { name: 'admin-panel', script: 'npm', args: 'run start --workspace=@crm/admin-panel', env: { NODE_ENV: 'production', PORT: 3100 } }
  ]
};
```

Start the ecosystem:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
*(Note: If you don't have PM2 installed on your live server yet, install it first using `npm install -g pm2`)*

## 5. Nginx Configuration & Reverse Proxy

You need to configure Nginx to route traffic to the Next.js frontend (e.g., `app.yourdomain.com`) and the API Gateway (e.g., `api.yourdomain.com`).

Create an Nginx server block (`/etc/nginx/sites-available/crm`):

```nginx
# Frontend Block
server {
    listen 80;
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://localhost:3100; # Next.js frontend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API Gateway Block
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000; # API Gateway
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. SSL Configuration (Certbot)

To secure your applications with HTTPS, use Let's Encrypt Certbot:
```bash
sudo apt-get install python3-certbot-nginx
sudo certbot --nginx -d app.yourdomain.com -d api.yourdomain.com
```

## 7. Operational Checklist

1. **Verify Services**: Check PM2 logs using `pm2 logs` to ensure all services connect to the DB and Redis successfully.
2. **Dashboard Testing**: Visit `https://app.yourdomain.com` and ensure the API Gateway resolves internal traffic without CORS issues.
3. **Cron Jobs**: Ensure services handling automated processes (like the Tenant Service expiry checks or Marketing Service campaigns) are actively running without `ECONNREFUSED` errors.
4. **Environment Checks**: Ensure the `api-gateway` and `analytics-service` have `.env` configurations that match the deployed structure, resolving localhost to the correct internal server ports.

If you encounter `ECONNREFUSED` internally within the server, verify the PM2 script explicitly binds the services to `0.0.0.0` or `127.0.0.1` as appropriate.
