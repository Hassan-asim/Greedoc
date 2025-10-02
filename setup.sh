#!/bin/bash

echo "Setting up Greedoc - AI Health Companion"
echo "========================================"

echo ""
echo "Installing Node.js dependencies..."
echo ""

echo "Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Error installing backend dependencies"
    exit 1
fi

echo ""
echo "Installing frontend dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Error installing frontend dependencies"
    exit 1
fi

echo ""
echo "Creating environment files..."
cd ../server
if [ ! -f .env ]; then
    cp env.example .env
    echo "Created server/.env file"
fi

cd ../client
if [ ! -f .env ]; then
    cp env.example .env
    echo "Created client/.env file"
fi

echo ""
echo "========================================"
echo "Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure Firebase project"
echo "2. Update environment variables"
echo "3. Run the application"
echo ""
echo "For detailed instructions, see README.md"
echo "========================================"
