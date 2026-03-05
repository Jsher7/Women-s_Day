FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application
COPY src ./src

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8000

# Start application
CMD ["node", "src/index.js"]
