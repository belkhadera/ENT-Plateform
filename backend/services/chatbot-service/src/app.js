require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();

// Connexion à MongoDB
connectDB();

// Middleware
app.use(helmet());
// Configuration CORS pour le cours-service
const corsOptions = {
  origin: function (origin, callback) {
    // Origines autorisées
    const allowedOrigins = [
      'http://localhost:3000',
      'http://192.168.1.21:3000',
      'http://localhost:8000',
      'http://192.168.1.21:8000'
    ];
    
    // Autoriser les requêtes sans origin (appels internes)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Cours Service - Origine bloquée:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Routes - CORRECT
app.use('/api/chatbot', chatbotRoutes);

// Health check - CORRIGÉ (message correct)
app.get('/health', (req, res) => res.json({ 
  success: true, 
  message: 'Chatbot Service running',  // ← Changé de "Exam Service" à "Chatbot Service"
  timestamp: new Date().toISOString()
}));

// Route de test pour vérifier les routes disponibles
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Chatbot API is working',
    routes: [
      'POST /api/chatbot/message',
      'GET /api/chatbot/history/:id',
      'GET /api/chatbot/conversations',
      'DELETE /api/chatbot/conversations/:id',
      'GET /api/chatbot/suggestions'
    ]
  });
});

const PORT = process.env.PORT || 8008;  // Port 8008 pour le chatbot
app.listen(PORT, () => {
  console.log(`\n✅ Chatbot Service démarré sur le port ${PORT}`);
  console.log(`📡 Routes disponibles:`);
  console.log(`   - POST /api/chatbot/message`);
  console.log(`   - GET /api/chatbot/history/:id`);
  console.log(`   - GET /api/chatbot/conversations`);
  console.log(`   - DELETE /api/chatbot/conversations/:id`);
  console.log(`   - GET /api/chatbot/suggestions`);
  console.log(`   - GET /health`);
  console.log(`   - GET /api/test\n`);
});

module.exports = app;