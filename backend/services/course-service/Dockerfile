FROM node:18-alpine

USER root

WORKDIR /app

COPY package*.json ./
RUN npm install && \
    chmod -R 777 /app/node_modules/.bin

COPY . .

RUN chmod -R 777 /app/node_modules/.bin

EXPOSE 8002

CMD ["npm", "run", "dev"]