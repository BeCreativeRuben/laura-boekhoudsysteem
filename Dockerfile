# Laura Boekhoudsysteem - Docker Container
FROM node:18-alpine

# Werk directory instellen
WORKDIR /app

# Dependencies kopiëren en installeren
COPY package*.json ./
RUN npm install --production

# Applicatie bestanden kopiëren
COPY . .

# Database directory maken
RUN mkdir -p /app/data

# Poort exposen
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/verify-token || exit 1

# Service starten
CMD ["node", "server.js"]
