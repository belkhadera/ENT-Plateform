const axios = require('axios');

// backend/services/file-service/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  try {
    console.log('\n🔐 FILE SERVICE AUTH');
    
    const authHeader = req.headers.authorization;
    console.log('Headers authorization:', authHeader);
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token manquant' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token manquant' 
      });
    }

    try {
      // Vérifier avec JWT_SECRET (identique à auth-service)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token valide pour user:', decoded.id);
      
      req.user = decoded;
      next();
      
    } catch (jwtError) {
      console.error('❌ Erreur JWT:', jwtError.message);
      
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