#!/bin/sh

# Exit on error
set -e

echo "Starting DINO application..."

# Run database migrations
if [ -n "$DATABASE_URL" ]; then
    echo "Running database migrations..."
    npx prisma migrate deploy
    echo "Database migrations completed."
else
    echo "Warning: DATABASE_URL not set, skipping migrations."
fi

# Execute the main command
exec "$@"