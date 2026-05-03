#!/bin/bash
# Nginx and Certbot Automation Script

set -e

DOMAIN="api.crm.local"
EMAIL="admin@crm.local"

echo "🔐 Setting up SSL for $DOMAIN..."

if [ ! -d "./infrastructure/nginx/certbot/conf" ]; then
  mkdir -p ./infrastructure/nginx/certbot/conf
  mkdir -p ./infrastructure/nginx/certbot/www
fi

echo "Starting Nginx to serve ACME challenge..."
# Assuming Nginx is part of the deployment or runs on host
# For a real server, you'd run:
# certbot certonly --webroot -w ./infrastructure/nginx/certbot/www -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email

echo "Certbot automated setup placeholder."
echo "Please update DOMAIN and EMAIL in this script for production use."
