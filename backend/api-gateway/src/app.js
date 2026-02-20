require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// --- Middlewares de Sécurité ---
app.use(helmet());
// Dans backend/api-gateway/app.js
app.use(cors({
  origin: '*', // Autorise toutes les origines
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Note: express.json() ne doit être utilisé que pour les routes locales (comme /health).
// Le proxy gère lui-même le flux de données vers les microservices.

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: "Trop de requêtes effectuées depuis cette IP, réessayez plus tard."
});
app.use('/api', limiter); // Applique le limiteur uniquement aux routes API

// --- Configuration du Proxy ---
// Utilisation d'une fonction pour éviter la répétition (DRY - Don't Repeat Yourself)
const setupProxy = (path, target) => {
  if (!target) {
    console.warn(`Attention: L'URL pour ${path} n'est pas définie dans le .env`);
    return;
  }
  
  app.use(path, createProxyMiddleware({
    target: target,
    changeOrigin: true,
    // On commente ou on supprime le pathRewrite pour garder l'URL complète
    // pathRewrite: { [`^${path}`]: '' }, 
    onError: (err, req, res) => {
      console.error(`Erreur Proxy pour ${path}:`, err.message);
      res.status(502).json({ success: false, message: "Service indisponible." });
    }
  }));
};

// Enregistrement des routes
setupProxy('/api/auth', process.env.AUTH_SERVICE_URL||"http://localhost:8001");
setupProxy('/api/users', process.env.USER_SERVICE_URL||"http://localhost:8002");
setupProxy('/api/courses', process.env.COURSE_SERVICE_URL||"http://localhost:8003");
setupProxy('/api/files', process.env.FILE_SERVICE_URL||"http://localhost:8004");
setupProxy('/api/messages', process.env.MESSAGING_SERVICE_URL||"http://localhost:8005");
setupProxy('/api/calendar', process.env.CALENDAR_SERVICE_URL||"http://localhost:8006");
setupProxy('/api/exams', process.env.EXAM_SERVICE_URL||"http://localhost:8007");
setupProxy('/api/chatbot', process.env.CHATBOT_SERVICE_URL||"http://localhost:8008");
setupProxy('/api/admin', process.env.ADMIN_SERVICE_URL||"http://localhost:8009");


// --- Routes Locales ---
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API Gateway running',
    timestamp: new Date().toISOString()
  });
});

// --- Démarrage ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ API Gateway en cours d'exécution sur le port ${PORT}`);
});