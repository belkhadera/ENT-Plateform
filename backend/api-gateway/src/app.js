// backend/api-gateway/app.js - Version corrigée
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// CORS - Important pour les credentials
app.use(cors({
  origin: 'http://192.168.1.21:3000',
  credentials: true,
  exposedHeaders: ['Authorization'], // Expose les headers d'autorisation
}));

// Logger détaillé
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers reçus:', req.headers);
  next();
});

// Fonction pour copier les headers importants
const copyHeaders = (proxyReq, req) => {
  // Copier le header Authorization s'il existe
  if (req.headers.authorization) {
    proxyReq.setHeader('Authorization', req.headers.authorization);
    console.log('✅ Header Authorization copié:', req.headers.authorization.substring(0, 50) + '...');
  }
  
  // Copier les autres headers
  proxyReq.setHeader('Content-Type', req.headers['content-type'] || 'application/json');
};

// Proxy pour AUTH - SANS pathRewrite
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:8001',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    copyHeaders(proxyReq, req);
    console.log(`   → Redirigé vers: ${process.env.AUTH_SERVICE_URL}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`   ← Réponse: ${proxyRes.statusCode}`);
    
    // Log des headers de réponse
    if (proxyRes.headers['authorization']) {
      console.log('   ← Token dans réponse:', proxyRes.headers['authorization'].substring(0, 50) + '...');
    }
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err);
    res.status(502).json({ error: 'Service auth indisponible' });
  }
}));
// Proxy pour MESSAGING
app.use('/api/messages', createProxyMiddleware({
  target: process.env.MESSAGING_SERVICE_URL || 'http://messaging-service:8005',
  changeOrigin: true,
  proxyTimeout: 30000,
  timeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    copyHeaders(proxyReq, req);
    console.log(`   → Redirigé vers messaging: ${process.env.MESSAGING_SERVICE_URL}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`   ← Réponse messaging: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error messaging:', err);
    res.status(502).json({ error: 'Service messaging indisponible' });
  }
}));
// Proxy pour CHATBOT - CORRIGÉ !
app.use('/api/chatbot', createProxyMiddleware({
  target: process.env.CHATBOT_SERVICE_URL || 'http://chatbot-api:8010',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    copyHeaders(proxyReq, req);
    console.log(`   → Redirigé vers chatbot: ${process.env.CHATBOT_SERVICE_URL || 'http://chatbot-api:8010'}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`   ← Réponse chatbot: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error chatbot:', err);
    res.status(502).json({ error: 'Service chatbot indisponible' });
  }
}));
// Proxy pour COURSES
app.use('/api/courses', createProxyMiddleware({
  target: process.env.COURSE_SERVICE_URL || 'http://cours-service:8002',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    copyHeaders(proxyReq, req);
    console.log(`   → Redirigé vers: ${process.env.COURSE_SERVICE_URL}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`   ← Réponse: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err);
    res.status(502).json({ error: 'Service courses indisponible' });
  }
}));
// Proxy pour EXAM
app.use('/api/exams', createProxyMiddleware({
  target: process.env.EXAM_SERVICE_URL || 'http://exam-service:8007',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    copyHeaders(proxyReq, req);
    console.log(`   → Redirigé vers exam: ${process.env.EXAM_SERVICE_URL || 'http://exam-service:8007'}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`   ← Réponse exam: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error exam:', err);
    res.status(502).json({ error: 'Service exam indisponible' });
  }
}));
// Proxy pour FILES
app.use('/api/files', createProxyMiddleware({
  target: process.env.FILE_SERVICE_URL || 'http://file-service:8003',
  changeOrigin: true,
proxyTimeout: 60000, // 60 secondes
  timeout: 60000, 
  onProxyReq: (proxyReq, req, res) => {
    copyHeaders(proxyReq, req);
    console.log(`   → Redirigé vers: ${process.env.FILE_SERVICE_URL}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`   ← Réponse: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err);
    res.status(502).json({ error: 'Service files indisponible' });
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API Gateway OK',
    headers: req.headers
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`✅ API Gateway démarrée sur le port ${PORT}`);
  console.log('='.repeat(50) + '\n');
});