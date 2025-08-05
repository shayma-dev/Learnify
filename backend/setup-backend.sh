#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Please create a .env file in the backend directory with your configuration."
    exit 1
fi

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Run database migrations
echo "Running database migrations..."
npm run migrate up

# Start the backend server with nodemon
echo "Starting the backend server..."
nodemon server.js