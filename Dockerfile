FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package.json ./

# Install dependencies (use npm for reliability in slim containers)
RUN npm install

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 8080

# Run Vite with host flag for Docker visibility
CMD ["npm", "run", "dev"]
