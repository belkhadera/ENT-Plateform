# 🚀 QuickStart Guide - ENT EST Salé

## Installation Rapide

### 1. Prérequis
- Node.js 18+
- Docker & Docker Compose
- Git

### 2. Installation en 3 commandes

\`\`\`bash
# Cloner et installer
git clone <your-repo>
cd ent-est-sale
chmod +x scripts/*.sh && ./scripts/setup.sh

# Démarrer avec Docker
docker-compose up -d

# Vérifier
curl http://localhost:8000/health
\`\`\`

### 3. Accéder à l'application
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

### 4. Test rapide

\`\`\`bash
# Créer un utilisateur
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "email": "student1@est.ma",
    "password": "password123",
    "firstName": "Ahmed",
    "lastName": "Benali",
    "role": "STUDENT"
  }'

# Se connecter
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "student1",
    "password": "password123"
  }'
\`\`\`

## Structure du Projet

\`\`\`
ent-est-sale/
├── backend/
│   ├── services/          # 9 microservices
│   │   ├── auth-service/
│   │   ├── course-service/
│   │   ├── file-service/
│   │   └── ...
│   └── api-gateway/       # Point d'entrée unique
├── frontend/              # Application React
├── infrastructure/        # Docker, Kubernetes
├── docs/                  # Documentation
└── scripts/               # Scripts utilitaires
\`\`\`

## Services Disponibles

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Interface React |
| API Gateway | 8000 | Routeur principal |
| Auth | 8001 | Authentification |
| User | 8002 | Gestion utilisateurs |
| Course | 8003 | Gestion cours |
| File | 8004 | Upload/Download |
| Messaging | 8005 | Chat temps réel |
| Calendar | 8006 | Calendrier |
| Exam | 8007 | Examens |
| Chatbot | 8008 | Assistant IA |
| Admin | 8009 | Administration |

## Développement

### Démarrer un service individuellement
\`\`\`bash
cd backend/services/auth-service
npm install
npm run dev
\`\`\`

### Frontend en développement
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

## Commandes Utiles

\`\`\`bash
# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart auth-service

# Arrêter tout
docker-compose down

# Nettoyer et reconstruire
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
\`\`\`

## Configuration IA (Ollama)

\`\`\`bash
# Installer Ollama
curl https://ollama.ai/install.sh | sh

# Télécharger Llama 3
ollama pull llama3

# Démarrer
ollama serve
\`\`\`

Puis configurez chatbot-service/.env:
\`\`\`
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=llama3
\`\`\`

## Prochaines Étapes

1. ✅ Lire la documentation complète dans `/docs`
2. ✅ Configurer les variables d'environnement
3. ✅ Tester les endpoints API (voir docs/API.md)
4. ✅ Personnaliser le frontend
5. ✅ Configurer Kubernetes pour la production

## Support

- 📖 Documentation: `/docs`
- 🐛 Issues: GitHub Issues
- 📧 Email: support@est-sale.ma

Bon développement! 🎓
