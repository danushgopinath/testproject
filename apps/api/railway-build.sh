#!/bin/bash
set -e

echo "🔨 Building @expertify/shared package..."
cd ../../packages/shared
npm install
npm run build
cd ../../apps/api

echo "🔨 Building API..."
npm install
npm run build
npx prisma generate

echo "✅ Build complete!"
