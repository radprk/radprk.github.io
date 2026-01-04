#!/bin/bash

# Setup script for development
# Creates symlinks so data files are accessible during dev

cd "$(dirname "$0")"

echo "Setting up development environment..."

# Create symlinks for data files
if [ ! -L "public/data/entries.json" ]; then
    ln -s ../../data/entries.json public/data/entries.json
    echo "✓ Linked entries.json"
fi

if [ ! -L "public/data/stats.json" ]; then
    ln -s ../../data/stats.json public/data/stats.json
    echo "✓ Linked stats.json"
fi

if [ ! -L "public/data/weeks.json" ]; then
    ln -s ../../data/weeks.json public/data/weeks.json
    echo "✓ Linked weeks.json"
fi

if [ ! -L "public/config/books.json" ]; then
    ln -s ../../config/books.json public/config/books.json
    echo "✓ Linked books.json"
fi

echo ""
echo "Development setup complete!"
echo "Run 'npm run dev' to start the development server"

