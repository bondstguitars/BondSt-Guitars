# Use official Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install --production

# Copy the rest of the server files
COPY . .

# Build TypeScript if needed (assuming you use tsc)
RUN npm run build

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/index.js"]
