FROM node:20-alpine

# Install openssl (required for Prisma)
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy remaining source code and Prisma schema
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3001

# Command runs migrations first, seeds default data, then starts the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run db:seed && npm start"]
