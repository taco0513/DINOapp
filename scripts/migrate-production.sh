#!/bin/bash

# Production Database Migration Script for DINO

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[INFO]${NC} Starting production database migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}[ERROR]${NC} DATABASE_URL is not set"
    echo -e "${YELLOW}[HINT]${NC} Set DATABASE_URL environment variable or use .env.production.local"
    exit 1
fi

# Backup current schema
echo -e "${BLUE}[INFO]${NC} Backing up current schema..."
npx prisma db pull --schema=./prisma/schema.backup.prisma || true

# Generate Prisma Client
echo -e "${BLUE}[INFO]${NC} Generating Prisma Client..."
npx prisma generate

# Run migrations
echo -e "${BLUE}[INFO]${NC} Running database migrations..."
npx prisma migrate deploy

# Verify database connection
echo -e "${BLUE}[INFO]${NC} Verifying database connection..."
npx prisma db execute --stdin <<EOF
SELECT 1 as test;
EOF

echo -e "${GREEN}[SUCCESS]${NC} Production database migration completed!"
echo -e "${YELLOW}[NOTE]${NC} Remember to verify your application is working correctly"