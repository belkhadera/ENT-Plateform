// backend/services/chatbot-service/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  try {
    console.log('\n🔐 CHATBOT AUTH MIDDLEWARE');
    
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Pas de token ou format incorrect');
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé - Token manquant' 
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token reçu:', token.substring(0, 30) + '...');

    try {
      // Vérifier le token avec le même secret que auth-service
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token valide pour user:', decoded.id);
      console.log('Rôle:', decoded.role);
      
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('❌ Erreur JWT:', jwtError.name, jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expiré' 
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide' 
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};