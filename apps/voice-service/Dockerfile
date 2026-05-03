FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./
COPY apps/voice-service/package.json ./apps/voice-service/
COPY apps/voice-service/tsconfig.json ./apps/voice-service/

RUN npm install

COPY apps/voice-service ./apps/voice-service

# Generate Prisma Client if it exists inside voice-service
# RUN npx prisma generate --schema=apps/voice-service/prisma/schema.prisma || true

RUN npm run build --workspace=apps/voice-service

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/apps/voice-service/node_modules ./apps/voice-service/node_modules
COPY --from=builder /usr/src/app/apps/voice-service/dist ./apps/voice-service/dist
COPY --from=builder /usr/src/app/apps/voice-service/package.json ./apps/voice-service/

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create uploads directory
RUN mkdir -p /usr/src/app/uploads && chown -R node:node /usr/src/app/uploads

EXPOSE 3011

CMD ["node", "apps/voice-service/dist/main.js"]
