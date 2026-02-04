#!/bin/bash

echo "Deploying to GitHub Pages..."

# Check if GitHub CLI is authenticated
if ! gh auth status &>/dev/null; then
    echo "GitHub CLI not authenticated. Running login..."
    gh auth login
else
    echo "GitHub CLI is already authenticated."
fi

# Deploy the app
echo "Running deployment..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "Your game is available at: https://paweljaworski.github.io/event-sourced-games/"
else
    echo "❌ Deployment failed!"
    exit 1
fi