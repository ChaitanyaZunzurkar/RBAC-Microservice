# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Build if using TypeScript 
RUN npm run build

# Expose the port your service runs on 
EXPOSE 3000

# Start the service
CMD ["node", "dist/index.js"]  
