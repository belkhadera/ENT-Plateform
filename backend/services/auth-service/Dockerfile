FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances avec axios
RUN npm install && npm install axios

# Copier le reste de l'application
COPY . .

EXPOSE 8001

CMD ["npm", "run", "dev"]