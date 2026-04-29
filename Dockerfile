# syntax=docker/dockerfile:1
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install --omit=dev

# Copy source
COPY src/ ./src/

# Data directory
RUN mkdir -p /data

# Non-root user
RUN addgroup -S botgroup && adduser -S botuser -G botgroup \
    && chown -R botuser:botgroup /app /data
USER botuser

ENV NODE_ENV=production
ENV DATA_FILE=/data/parties.json

CMD ["node", "src/index.js"]
