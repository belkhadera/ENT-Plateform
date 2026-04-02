FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8000

# Corriger le point d'entrée - utiliser src/app.js
CMD ["node", "src/app.js"]