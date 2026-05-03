FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./
COPY apps/credential-service/package.json ./apps/credential-service/
COPY apps/credential-service/tsconfig.json ./apps/credential-service/

RUN npm install

COPY apps/credential-service ./apps/credential-service

# Generate Prisma Client if it exists inside credential-service
# RUN npx prisma generate --schema=apps/credential-service/prisma/schema.prisma || true

RUN npm run build --workspace=apps/credential-service

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/apps/credential-service/node_modules ./apps/credential-service/node_modules
COPY --from=builder /usr/src/app/apps/credential-service/dist ./apps/credential-service/dist
COPY --from=builder /usr/src/app/apps/credential-service/package.json ./apps/credential-service/

# Install curl for healthcheck
RUN apk add --no-cache curl

EXPOSE 3010

CMD ["node", "apps/credential-service/dist/main.js"]
