#!/bin/bash
# CRM Infrastructure Deployment Script
# This script automates the production deployment process for the CRM SaaS

set -e

echo "🚀 Starting CRM deployment process..."

echo "📦 Pulling latest code..."
git pull origin main || echo "Not a git repository or no upstream branch. Skipping git pull."

echo "🗄️ Running database migrations..."
npx prisma migrate deploy

echo "🏗️ Building Docker containers..."
docker-compose build

echo "🚢 Starting services..."
docker-compose up -d

echo "✅ Deployment complete. Verifying service health..."
sleep 5
docker-compose ps

echo "🎉 CRM is now running in production mode."
