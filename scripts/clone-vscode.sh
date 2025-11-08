#!/bin/bash

echo "🔥 Cloning and setting up VS Code OSS for BonFire extension development..."

# Move to parent directory
cd ..

# Check if vscode-oss already exists
if [ -d "vscode-oss" ]; then
    echo "⚠️  vscode-oss directory already exists"
    read -p "Do you want to remove and re-clone? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf vscode-oss
    else
        echo "Skipping clone"
        exit 0
    fi
fi

# Clone VS Code repository
echo "📥 Cloning VS Code OSS repository..."
git clone https://github.com/microsoft/vscode.git vscode-oss

if [ $? -ne 0 ]; then
    echo "❌ Failed to clone VS Code repository"
    exit 1
fi

cd vscode-oss

# Checkout stable version
echo "🔖 Checking out version 1.85.0..."
git checkout 1.85.0

# Install dependencies
echo "📦 Installing VS Code dependencies (this may take ~10 minutes)..."
yarn install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create symlink to BonFire extension
echo "🔗 Creating symlink to BonFire extension..."
cd extensions
ln -s ../../bonfire/apps/vscode-extension bonfire

cd ../..

echo "✅ VS Code OSS setup complete!"
echo ""
echo "To run VS Code with BonFire extension:"
echo "  cd vscode-oss"
echo "  yarn watch"
echo "  # In a new terminal:"
echo "  ./scripts/code.sh"
echo ""
