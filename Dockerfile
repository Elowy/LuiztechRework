# ---- Luiz-Tech webshop ----
FROM node:20-alpine

WORKDIR /app

# Install production dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Persisted datastore lives here (mount a volume for durability)
ENV DATA_DIR=/app/data
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Datastore directory (declare as volume so data survives container rebuilds)
VOLUME ["/app/data"]

CMD ["node", "server/server.js"]
