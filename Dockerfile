FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy backend package files
COPY backend/package*.json ./backend/

# Install dependencies (from root and backend)
RUN npm install
RUN cd backend && npm install

# Copy everything else
COPY . .

EXPOSE 3000

# Start backend from the root
CMD ["npm", "start"]
