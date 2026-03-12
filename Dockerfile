FROM node:18

WORKDIR /app

# Copy root package files
COPY package*.json ./
RUN npm install

# Copy backend package files
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy everything else
COPY . .

EXPOSE 3000

# Start backend using the direct path
CMD ["node", "backend/src/server.js"]
