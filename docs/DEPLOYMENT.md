# Guide de Déploiement ENT EST Salé

## Déploiement avec Docker Compose (Développement)

1. **Cloner le projet**
\`\`\`bash
git clone <repository-url>
cd ent-est-sale
\`\`\`

2. **Configurer les variables d'environnement**
Créer les fichiers .env dans chaque service à partir des .env.example

3. **Démarrer les services**
\`\`\`bash
docker-compose up -d
\`\`\`

4. **Vérifier les services**
\`\`\`bash
docker-compose ps
\`\`\`

5. **Accéder à l'application**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000
- MinIO Console: http://localhost:9001

## Déploiement avec Kubernetes (Production)

1. **Créer les secrets**
\`\`\`bash
kubectl create secret generic ent-secrets \\
  --from-literal=mongodb-uri=mongodb://user:pass@mongo-host:27017/ent \\
  --from-literal=jwt-secret=your-secret-key
\`\`\`

2. **Déployer les services**
\`\`\`bash
kubectl apply -f infrastructure/kubernetes/
\`\`\`

3. **Vérifier le déploiement**
\`\`\`bash
kubectl get pods
kubectl get services
\`\`\`

## Installation MinIO

\`\`\`bash
# Créer le bucket
mc alias set myminio http://localhost:9000 minioadmin minioadmin
mc mb myminio/ent-files
mc policy set download myminio/ent-files
\`\`\`

## Installation Ollama (IA)

\`\`\`bash
# Installer Ollama
curl https://ollama.ai/install.sh | sh

# Télécharger Llama 3
ollama pull llama3

# Démarrer le serveur
ollama serve
\`\`\`

## Tests

\`\`\`bash
# Tester l'auth service
curl -X POST http://localhost:8001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"login":"admin","password":"password"}'

# Tester le gateway
curl http://localhost:8000/health
\`\`\`
