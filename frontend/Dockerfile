ARG NODE_BASE_IMAGE=node:22
ARG PYTHON_BASE_IMAGE=python:3.11-slim

FROM ${NODE_BASE_IMAGE} AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM ${NODE_BASE_IMAGE} AS dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

FROM ${PYTHON_BASE_IMAGE}

WORKDIR /app

COPY serve_dist.py /app/serve_dist.py
COPY --from=build /app/dist /app/dist

EXPOSE 8081

CMD ["python", "serve_dist.py", "--host", "0.0.0.0", "--port", "8081"]
