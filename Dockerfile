FROM node:18

WORKDIR /app

# Copy root package files
COPY package*.json ./
# Install root dependencies (using install instead of ci to allow for platform adjustments)
RUN npm install

# Copy backend package files
COPY backend/package*.json ./backend/
# Install backend dependencies specifically
RUN cd backend && npm install

# Copy the rest of the application
COPY . .

EXPOSE 3000

# Start server
CMD ["node", "backend/src/server.js"]
