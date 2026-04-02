require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const courseRoutes = require('./routes/courseRoutes');

const app = express();

// Connexion à MongoDB
connectDB();

// Middlewares
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

// Routes
app.use('/api/courses', courseRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Course Service running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 8002; // Note: 8002 pour correspondre au docker-compose
app.listen(PORT, () => {
  console.log(`\n✅ Course Service on port ${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/health\n`);
});

module.exports = app;