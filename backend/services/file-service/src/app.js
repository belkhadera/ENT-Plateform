require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { initBucket } = require('./config/minio');
const fileRoutes = require('./routes/fileRoutes');
const path = require('path');

const app = express();

// --- Initialisations ---
// On utilise une fonction asynchrone pour s'assurer que tout est prêt avant de lancer le serveur
const startService = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connecté (File Service)');
    
    await initBucket();
    console.log('✅ Minio Bucket initialisé');

    // --- Middlewares ---
    app.use(helmet());
    app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:8000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // ATTENTION : Pour l'upload de fichiers, express.json() peut parfois interférer.
    // On l'applique, mais Multer dans fileRoutes gérera le multipart/form-data.
    // Autorise l'accès public au dossier uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    app.use(express.json());

    // --- Routes ---
    app.use('/api/files', fileRoutes);

    app.get('/health', (req, res) => {
      res.json({ success: true, message: 'File Service running', storage: 'Minio Ready' });
    });

    const PORT = process.env.PORT || 8004;
    app.listen(PORT, () => {
      console.log(`🚀 File Service opérationnel sur le port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Échec du démarrage du File Service:', error.message);
    process.exit(1); // Arrête le service si la DB ou Minio échouent
  }
};

startService();

module.exports = app;