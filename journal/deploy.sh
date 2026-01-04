#!/bin/bash

# Build script for GitHub Pages deployment
# This builds the React app and prepares it for deployment

echo "Building React app..."
npm run build

echo "Build complete! Output in dist/ directory"
echo ""
echo "To deploy to GitHub Pages:"
echo "1. Copy dist/* contents to your journal/ directory in the repo root"
echo "2. Ensure data/ and config/ directories are accessible"
echo "3. Commit and push to GitHub"
echo ""
echo "Or use GitHub Actions to automate this process"

