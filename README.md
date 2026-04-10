# ENT EST Sale - Microservices (Projet LP BD 2025)

Ce depot contient une implementation ENT en architecture microservices avec les services suivants:

- `core-service`: authentification OAuth2/JWT avec Keycloak
- `upload-service`: ajout des cours et fichiers par les enseignants
- `download-service`: consultation et telechargement des cours
- `admin-service`: administration des utilisateurs et des roles
- `frontend`: interface React servie automatiquement

## Stack technique

- Backend: FastAPI
- Frontend: React + Vite
- Auth: Keycloak
- Base de donnees: Cassandra
- Stockage objet: MinIO
- Conteneurisation: Docker Compose
- Orchestration: manifests Kubernetes de base

## 1) Prerequis

- Docker + Docker Compose
- Optionnel: `kubectl` pour les manifests Kubernetes

### Images Docker attendues sur le serveur

Images d'infrastructure:

- `quay.io/keycloak/keycloak:latest`
- `minio/minio:latest`
- `cassandra:latest`
- `postgres:16`

Images de build/runtime pour les conteneurs applicatifs:

- `python:3.11-slim`
- `node:22`

### Notes serveur

- `postgres:16` est obligatoire pour Keycloak dans cette stack.
- `ubuntu` n'est pas necessaire comme image Docker pour ce projet.
- Le Python installe sur Ubuntu n'est pas necessaire si tu lances le projet avec Docker Compose.
- Si le serveur est hors ligne, les images ci-dessus doivent deja etre presentes.
- Les microservices backend sont fixes sur `python:3.11-slim` pour rester compatibles avec `cassandra-driver`.
- Pour un build frontend local sous Windows, utilise Node 22 LTS. Evite Node 23 ou `latest`.
- Le projet accepte maintenant des images de base personnalisables via les variables Compose de `.env.example`.

## 2) Lancer le projet

Depuis la racine du projet:

```bash
docker compose up --build
```

### 2.0) Serveur sans acces Docker Hub

Si le serveur ne peut pas resoudre `auth.docker.io`, il faut utiliser des images deja chargees localement.

Le projet lit automatiquement ces variables depuis un fichier `.env` a la racine:

- `POSTGRES_IMAGE`
- `KEYCLOAK_IMAGE`
- `CASSANDRA_IMAGE`
- `MINIO_IMAGE`
- `PYTHON_BASE_IMAGE`
- `NODE_BASE_IMAGE`

Exemple:

```bash
cp .env.example .env
```

Puis adapte seulement les valeurs si tu utilises des tags locaux, par exemple:

```env
PYTHON_BASE_IMAGE=local-python:3.11-slim
NODE_BASE_IMAGE=local-node:22
POSTGRES_IMAGE=local-postgres:16
```

Important:

- ne remplace pas `PYTHON_BASE_IMAGE` par `python:latest` sauf si tu as aussi rendu `cassandra-driver` compatible avec cette version de Python
- si tu veux reutiliser une image deja presente localement, retague-la d'abord sous un nom local pour eviter que Docker essaie de contacter le registry

Exemple de retag local:

```bash
docker tag python:3.11-slim local-python:3.11-slim
docker tag node:22 local-node:22
docker tag postgres:16 local-postgres:16
```

Services exposes:

- Core service: `http://localhost:8001`
- Upload service: `http://localhost:8002`
- Download service: `http://localhost:8003`
- Admin service: `http://localhost:8004`
- Frontend: `http://localhost:8081`
- Keycloak: `http://localhost:8080`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

## 2.1) Frontend automatique

Le frontend fait partie de `docker compose`.

Quand tu lances `docker compose up --build`:

- le frontend React est build automatiquement
- le build est servi via Python dans le conteneur `frontend`
- l'application est exposee sur `http://localhost:8081`
- les appels frontend sont routes via `/api/core`, `/api/upload`, `/api/download`, `/api/admin` et `/api/chat`
- cela evite les problemes de CORS et de resolution d'IP cote navigateur

## 2.2) Frontend hors Docker avec Python

Si tu veux lancer le frontend hors Docker sur une machine qui a deja un `dist` genere:

```bash
cd frontend
python3 serve_dist.py --host 0.0.0.0 --port 8081
```

Ce script:

- sert le dossier `dist`
- redirige les routes React (`/courses`, `/calendar`, etc.) vers `index.html`
- peut proxyfier les appels API si tu definis `CORE_SERVICE_PROXY_URL`, `UPLOAD_SERVICE_PROXY_URL`, `DOWNLOAD_SERVICE_PROXY_URL` et `ADMIN_SERVICE_PROXY_URL`

## 2.3) Developpement frontend avec Vite

`vite` proxy automatiquement:

- `/api/core` vers `http://localhost:8001`
- `/api/upload` vers `http://localhost:8002`
- `/api/download` vers `http://localhost:8003`
- `/api/admin` vers `http://localhost:8004`
- `/api/chat` vers `http://localhost:8005`

## 3) Comptes de demo

Le realm Keycloak importe automatiquement:

- `admin` / `admin123` avec le role `admin`
- `teacher` / `teacher123` avec le role `teacher`
- `student` / `student123` avec le role `student`

Compte bootstrap Keycloak (realm `master`):

- `kcadmin` / `kcadmin`

## 4) Flux principal

1. Recuperer un token via `core-service` (`/auth/token`).
2. Avec un token `teacher`, uploader un cours via `upload-service` (`/courses`).
3. Avec un token `student`, lister les cours via `download-service` (`/courses`) puis demander un lien signe (`/courses/{id}/download-url`).
4. Avec un token `admin`, creer et gerer les utilisateurs via `admin-service`.

## 5) Exemples API

### 5.1 Recuperer un token

```bash
curl -X POST http://localhost:8001/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"teacher123"}'
```

### 5.2 Upload d'un cours

```bash
curl -X POST http://localhost:8002/courses \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "title=Introduction FastAPI" \
  -F "description=Support de cours" \
  -F "level=S5" \
  -F "semester=Automne" \
  -F "subject=Developpement web" \
  -F "tags=fastapi, python, api" \
  -F "file=@./cours.pdf"
```

### 5.3 Liste des cours

```bash
curl http://localhost:8003/courses \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 5.4 Lien de telechargement signe

```bash
curl http://localhost:8003/courses/<COURSE_ID>/download-url \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 5.5 Creation utilisateur

```bash
curl -X POST http://localhost:8004/users \
  -H "Authorization: Bearer <ACCESS_TOKEN_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{
    "username":"new_student",
    "email":"new_student@example.com",
    "password":"Pass123!",
    "roles":["student"]
  }'
```

## 6) Kubernetes

Les manifests de base sont dans `infra/k8s`.

```bash
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/secret.example.yaml
kubectl apply -f infra/k8s/core-service.yaml
kubectl apply -f infra/k8s/upload-service.yaml
kubectl apply -f infra/k8s/download-service.yaml
kubectl apply -f infra/k8s/admin-service.yaml
```

## 7) Structure du depot

```text
.
|-- docker-compose.yml
|-- infra
|   |-- cassandra/init.cql
|   |-- keycloak/realm-export.json
|   `-- k8s/*.yaml
|-- frontend
`-- services
    |-- core-service
    |-- upload-service
    |-- download-service
    `-- admin-service
```

## 8) Remarques

- Les manifests Kubernetes sont simples et orientes demo.
- Pour la production, il faut ajouter TLS, gestion des secrets, observabilite et CI/CD.
- Si ton serveur est hors ligne, `docker compose up --build` ne peut pas telecharger les images manquantes. Il faut donc precharger ou retaguer localement `python:3.11-slim`, `node:22` et les images d'infrastructure utilisees.
- Le volume Postgres est monte sur `/var/lib/postgresql` pour rester compatible avec `postgres:16` et les images Postgres plus recentes.



