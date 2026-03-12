FROM node:18-alpine

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

RUN npm install --production

# Copy source code
COPY . .

EXPOSE 5001

CMD ["npm", "start"]
