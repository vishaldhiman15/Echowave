#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Install root dependencies
npm install

# Navigate to the server directory
cd server

# Check for required environment variables
if [ -z "$MONGODB_URI" ] || [ -z "$JWT_SECRET" ]; then
  echo "Error: MONGODB_URI and JWT_SECRET environment variables must be set."
  exit 1
fi

# Start the server
npm start
