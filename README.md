# 🎓 ENT EST Salé - Espace Numérique de Travail

## 📋 Description

Plateforme d'Espace Numérique de Travail pour l'École Supérieure de Technologie de Salé, basée sur une architecture microservices avec :
- **Frontend**: React.js
- **Backend**: Node.js / Express.js
- **Base de données**: MongoDB
- **Stockage fichiers**: MinIO
- **Authentification**: OAuth2 / Keycloak / JWT
- **IA**: Ollama avec Llama 3
- **Orchestration**: Docker + Kubernetes

## 🏗️ Architecture

### Microservices Backend (Express.js)
1. **auth-service** - Authentification et gestion des tokens JWT
2. **user-service** - Gestion des utilisateurs et profils
3. **course-service** - Gestion des cours
4. **file-service** - Upload/download de fichiers (MinIO)
5. **messaging-service** - Messagerie et chat temps réel (WebSocket)
6. **calendar-service** - Calendrier et emploi du temps
7. **exam-service** - Gestion des examens et devoirs
8. **chatbot-service** - Assistant IA avec Ollama/Llama 3
9. **admin-service** - Administration des utilisateurs et rôles
10. **api-gateway** - Point d'entrée unique pour tous les services

### Frontend (React)
- Interface moderne et responsive
- Tableaux de bord pour Étudiants, Enseignants et Administrateurs
- Chat en temps réel avec WebSocket
- Intégration du chatbot IA

## 🚀 Installation

### Prérequis
- Node.js (v18+)
- MongoDB (v6+)
- Docker & Docker Compose
- MinIO
- Keycloak (optionnel)
- Ollama (pour l'IA)

### Installation locale (Développement)

1. **Cloner le projet**
```bash
git clone <repository-url>
cd ent-est-sale
```

2. **Installer les dépendances Backend**
```bash
cd backend/services/auth-service && npm install && cd ../../..
cd backend/services/user-service && npm install && cd ../../..
cd backend/services/course-service && npm install && cd ../../..
cd backend/services/file-service && npm install && cd ../../..
cd backend/services/messaging-service && npm install && cd ../../..
cd backend/services/calendar-service && npm install && cd ../../..
cd backend/services/exam-service && npm install && cd ../../..
cd backend/services/chatbot-service && npm install && cd ../../..
cd backend/services/admin-service && npm install && cd ../../..
cd backend/api-gateway && npm install && cd ../..
```

3. **Installer les dépendances Frontend**
```bash
cd frontend && npm install && cd ..
```

4. **Configurer les variables d'environnement**
Copier les fichiers `.env.example` vers `.env` dans chaque service et configurer:
- MongoDB URI
- JWT Secret
- MinIO credentials
- Ollama endpoint
- etc.

5. **Démarrer avec Docker Compose**
```bash
docker-compose up -d
```

### Installation avec Kubernetes

1. **Créer les secrets**
```bash
kubectl create secret generic ent-secrets \
  --from-literal=mongodb-uri=mongodb://... \
  --from-literal=jwt-secret=your-secret-key
```

2. **Déployer les services**
```bash
kubectl apply -f infrastructure/kubernetes/
```

## 📦 Services et Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Application React |
| API Gateway | 8000 | Point d'entrée API |
| Auth Service | 8001 | Authentification |
| User Service | 8002 | Gestion utilisateurs |
| Course Service | 8003 | Gestion des cours |
| File Service | 8004 | Upload/Download fichiers |
| Messaging Service | 8005 | Messagerie + WebSocket |
| Calendar Service | 8006 | Calendrier |
| Exam Service | 8007 | Examens et devoirs |
| Chatbot Service | 8008 | IA Assistant |
| Admin Service | 8009 | Administration |
| MongoDB | 27017 | Base de données |
| MinIO | 9000 | Stockage fichiers |
| MinIO Console | 9001 | Interface MinIO |

## 🔑 Authentification

Le système utilise JWT (JSON Web Tokens) pour l'authentification:
1. Login via `/api/auth/login`
2. Réception du token JWT
3. Inclusion du token dans les headers: `Authorization: Bearer <token>`

### Rôles disponibles:
- **STUDENT** - Étudiant
- **TEACHER** - Enseignant
- **ADMIN** - Administrateur

## 📚 API Endpoints

### Auth Service
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/refresh` - Rafraîchir le token
- `POST /api/auth/logout` - Déconnexion

### User Service
- `GET /api/users/profile` - Profil utilisateur
- `PUT /api/users/profile` - Modifier le profil
- `GET /api/users/:id` - Détails utilisateur

### Course Service
- `GET /api/courses` - Liste des cours
- `POST /api/courses` - Créer un cours (Teacher)
- `GET /api/courses/:id` - Détails d'un cours
- `PUT /api/courses/:id` - Modifier un cours (Teacher)
- `DELETE /api/courses/:id` - Supprimer un cours (Teacher)

### File Service
- `POST /api/files/upload` - Upload fichier
- `GET /api/files/:id` - Télécharger fichier
- `DELETE /api/files/:id` - Supprimer fichier

### Messaging Service
- `GET /api/messages` - Liste des messages
- `POST /api/messages` - Envoyer un message
- `WS /api/messages/ws` - WebSocket pour chat temps réel

### Calendar Service
- `GET /api/calendar/events` - Liste des événements
- `POST /api/calendar/events` - Créer un événement
- `PUT /api/calendar/events/:id` - Modifier un événement
- `DELETE /api/calendar/events/:id` - Supprimer un événement

### Exam Service
- `GET /api/exams` - Liste des examens
- `POST /api/exams` - Créer un examen (Teacher)
- `POST /api/exams/:id/submit` - Soumettre un devoir (Student)
- `GET /api/exams/:id/submissions` - Voir les soumissions (Teacher)
- `POST /api/exams/:id/grade` - Noter un devoir (Teacher)

### Chatbot Service
- `POST /api/chatbot/chat` - Conversation avec l'IA
- `GET /api/chatbot/history` - Historique des conversations

### Admin Service
- `GET /api/admin/users` - Liste tous les utilisateurs
- `POST /api/admin/users` - Créer un utilisateur
- `PUT /api/admin/users/:id/role` - Modifier le rôle
- `DELETE /api/admin/users/:id` - Supprimer un utilisateur

## 🤖 IA Chatbot (Ollama/Llama 3)

L'assistant IA peut répondre aux questions sur:
- Les cours disponibles
- L'emploi du temps
- Les examens à venir
- L'aide aux devoirs
- Questions générales sur l'université

Configuration dans `chatbot-service`:
```javascript
const OLLAMA_MODEL = 'llama3';
const OLLAMA_ENDPOINT = 'http://localhost:11434';
```

## 🗄️ Modèles de données MongoDB

### User
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: ['STUDENT', 'TEACHER', 'ADMIN'],
  createdAt: Date
}
```

### Course
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  teacherId: ObjectId,
  files: [{ fileId: String, fileName: String, fileUrl: String }],
  createdAt: Date
}
```

### Message
```javascript
{
  _id: ObjectId,
  from: ObjectId,
  to: ObjectId,
  content: String,
  read: Boolean,
  createdAt: Date
}
```

### Event (Calendar)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  participants: [ObjectId],
  createdBy: ObjectId
}
```

### Exam
```javascript
{
  _id: ObjectId,
  title: String,
  courseId: ObjectId,
  teacherId: ObjectId,
  dueDate: Date,
  totalPoints: Number,
  submissions: [{
    studentId: ObjectId,
    submittedAt: Date,
    files: [String],
    grade: Number,
    feedback: String
  }]
}
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Coverage
npm run test:coverage
```

## 📖 Documentation

- [Architecture complète](docs/ARCHITECTURE.md)
- [Guide de déploiement](docs/DEPLOYMENT.md)
- [Documentation API](docs/API.md)
- [Guide utilisateur](docs/USER_GUIDE.md)

## 🛠️ Technologies utilisées

### Backend
- Node.js
- Express.js
- MongoDB / Mongoose
- JWT / Passport.js
- Socket.io (WebSocket)
- MinIO Client
- Axios
- Ollama

### Frontend
- React 18
- React Router v6
- Axios
- Socket.io-client
- Tailwind CSS / Material-UI
- React Context API
- React Hooks

### DevOps
- Docker
- Docker Compose
- Kubernetes
- Nginx
- GitHub Actions (CI/CD)

## 👥 Contributeurs

Projet développé pour l'EST Salé

## 📄 Licence

MIT License

## 📞 Support

Pour toute question ou problème:
- Email: support@est-sale.ma
- Documentation: [docs/](docs/)
