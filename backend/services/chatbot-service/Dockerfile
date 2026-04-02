# backend/services/chatbot-service/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

EXPOSE 8010

CMD ["node", "src/app.js"]