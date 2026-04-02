require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const path = require('path');

// Import correct de minio
const minio = require('./config/minio');
// Ou si vous utilisez la destructuration:
// const { initBucket } = require('./config/minio');

const fileRoutes = require('./routes/fileRoutes');

const app = express();

// --- Initialisations ---
const startService = async () => {
  try {
    // Connexion MongoDB
    await connectDB();
    console.log('✅ MongoDB connecté (File Service)');
    
    // Vérifier que initBucket existe
    if (typeof minio.initBucket === 'function') {
      await minio.initBucket();
      console.log('✅ Minio Bucket initialisé');
    } else {
      console.error('❌ initBucket n\'est pas une fonction');
      console.log('Contenu de minio:', Object.keys(minio));
    }

    // --- Middlewares ---
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
    // Middleware pour les fichiers statiques
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // --- Routes ---
    app.use('/api/files', fileRoutes);

    // Route health check
    app.get('/health', (req, res) => {
      res.json({ 
        success: true, 
        message: 'File Service running', 
        storage: 'Minio Ready',
        minio: minio.minioClient ? 'connected' : 'error'
      });
    });

    const PORT = process.env.PORT || 8004;
    app.listen(PORT, () => {
      console.log(`🚀 File Service opérationnel sur le port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Échec du démarrage du File Service:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Démarrer le service
startService();

module.exports = app;