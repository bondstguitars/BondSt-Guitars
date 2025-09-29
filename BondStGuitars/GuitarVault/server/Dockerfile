# Step 1: Base image
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies including devDependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the app
RUN npm run build

# Step 2: Runtime image
FROM node:20-alpine
WORKDIR /app

# Copy only production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Set environment
ENV PORT=8080
EXPOSE 8080

# Start the app
CMD ["node", "dist/index.js"]
