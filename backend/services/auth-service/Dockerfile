FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
# Ne pas copier src ici si tu utilises les volumes, 
# mais Docker en a besoin pour le premier build
COPY . . 
EXPOSE 8001
CMD ["npm", "start"]