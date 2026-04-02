FROM node:18-alpine

WORKDIR /app

# Installer les dépendances système pour les fichiers
RUN apk add --no-cache tzdata

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8003

CMD ["npm", "run", "dev"]