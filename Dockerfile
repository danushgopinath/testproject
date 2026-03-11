FROM node:20.19.0-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build shared package
RUN npm run build --workspace=packages/shared

# Build API
RUN cd apps/api && npm run build

# Expose port
EXPOSE 4000

# Start the API
WORKDIR /app/apps/api
CMD ["npm", "start"]
