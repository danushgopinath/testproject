#!/bin/bash
set -e

echo "📦 Installing dependencies from monorepo root..."
cd ../..
npm install

echo "🔨 Building @expertify/shared package..."
cd packages/shared
npm run build
cd ../..

echo "🔨 Building API..."
cd apps/api
npm run build

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Build complete!"
