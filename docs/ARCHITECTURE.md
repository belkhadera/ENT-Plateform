# Architecture ENT EST Salé

## Vue d'ensemble

L'ENT EST Salé est construit sur une architecture microservices moderne, permettant:
- **Scalabilité** - Chaque service peut être mis à l'échelle indépendamment
- **Maintenabilité** - Services isolés, faciles à maintenir et à déployer
- **Résilience** - La défaillance d'un service n'affecte pas les autres
- **Flexibilité** - Technologies différentes selon les besoins

## Architecture Technique

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│                   Port 3000 / 80                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              API Gateway (Express.js)                    │
│                     Port 8000                            │
│  - Rate Limiting                                         │
│  - CORS                                                  │
│  - Request Routing                                       │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌────────────┐
│Auth Service  │ │Course    │ │File        │
│   :8001      │ │Service   │ │Service     │
└──────┬───────┘ │ :8003    │ │ :8004      │
       │         └────┬─────┘ └─────┬──────┘
       │              │              │
       │              ▼              ▼
       │         ┌────────────┐ ┌──────────┐
       │         │  MongoDB   │ │  MinIO   │
       │         │  :27017    │ │  :9000   │
       │         └────────────┘ └──────────┘
       │
       ▼
┌──────────────┐
│  Keycloak    │
│ (Optional)   │
└──────────────┘
\`\`\`

## Microservices

### 1. Auth Service (Port 8001)
**Responsabilité**: Authentification et autorisation
- Gestion des utilisateurs
- Génération et validation JWT
- Intégration Keycloak (optionnel)
- Gestion des rôles (STUDENT, TEACHER, ADMIN)

**Technologies**:
- Express.js
- MongoDB
- JWT
- Bcrypt

### 2. Course Service (Port 8003)
**Responsabilité**: Gestion des cours
- CRUD des cours
- Association enseignants/étudiants
- Gestion des métadonnées

**Technologies**:
- Express.js
- MongoDB

### 3. File Service (Port 8004)
**Responsabilité**: Stockage et récupération de fichiers
- Upload de fichiers vers MinIO
- Génération d'URLs présignées
- Gestion des métadonnées de fichiers

**Technologies**:
- Express.js
- MongoDB (métadonnées)
- MinIO (stockage)
- Multer

### 4. Messaging Service (Port 8005)
**Responsabilité**: Messagerie en temps réel
- Chat entre utilisateurs
- Notifications
- WebSocket pour temps réel

**Technologies**:
- Express.js
- Socket.io
- MongoDB

### 5. Calendar Service (Port 8006)
**Responsabilité**: Gestion du calendrier
- Emplois du temps
- Événements
- Rappels

### 6. Exam Service (Port 8007)
**Responsabilité**: Examens et devoirs
- Création d'examens
- Soumissions étudiants
- Notation

### 7. Chatbot Service (Port 8008)
**Responsabilité**: Assistant IA
- Intégration Ollama/Llama 3
- Réponses contextuelles
- Historique des conversations

### 8. Admin Service (Port 8009)
**Responsabilité**: Administration
- Gestion des utilisateurs
- Gestion des rôles
- Statistiques

### 9. API Gateway (Port 8000)
**Responsabilité**: Point d'entrée unique
- Routing vers les microservices
- Rate limiting
- CORS
- Load balancing

## Base de données

### MongoDB
Chaque service a sa propre base de données MongoDB:
- \`ent_auth\` - Utilisateurs
- \`ent_courses\` - Cours
- \`ent_files\` - Métadonnées fichiers
- \`ent_messages\` - Messages
- \`ent_calendar\` - Événements
- \`ent_exams\` - Examens

### MinIO
Stockage objet pour les fichiers:
- Documents de cours
- Soumissions d'examens
- Photos de profil
- Ressources pédagogiques

## Communication entre services

### Synchrone (HTTP/REST)
Les services communiquent via des appels API REST:
- Auth Service validé par tous les autres services
- Appels directs pour opérations CRUD

### Asynchrone (Future)
Pour améliorer la résilience:
- RabbitMQ ou Kafka pour événements
- Event-driven architecture

## Sécurité

1. **Authentification JWT**
   - Tokens signés avec secret
   - Expiration configurable

2. **Validation des tokens**
   - Middleware d'authentification
   - Vérification auprès du Auth Service

3. **HTTPS (Production)**
   - Certificats SSL/TLS
   - Nginx comme reverse proxy

4. **Rate Limiting**
   - Protection contre abus
   - Limite de requêtes par IP

## Déploiement

### Développement
\`\`\`bash
docker-compose up -d
\`\`\`

### Production (Kubernetes)
- Chaque service dans un pod
- Auto-scaling selon la charge
- Load balancing automatique
- Health checks

## Monitoring

### Logs
- Winston pour logging structuré
- Centralisation avec ELK Stack

### Métriques
- Prometheus pour collecte
- Grafana pour visualisation

### Tracing
- OpenTelemetry
- Jaeger pour distributed tracing
