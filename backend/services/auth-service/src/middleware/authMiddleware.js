const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redis = require('../config/redis');

exports.protect = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware - Vérification token');
    
    let token;

    // Vérifier le header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('❌ Pas de token');
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé - Token manquant' 
      });
    }

    try {
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token décodé - User ID:', decoded.id);

      // Vérifier dans Redis (optionnel)
      try {
        const cachedToken = await redis.get(`token:${decoded.id}`);
        if (cachedToken && cachedToken !== token) {
          console.log('⚠️ Token différent de celui en cache');
        }
      } catch (redisError) {
        console.warn('Redis error:', redisError.message);
      }

      // Trouver l'utilisateur
      const user = await User.findById(decoded.id);
      
      if (!user) {
        console.log('❌ Utilisateur non trouvé en DB');
        return res.status(401).json({ 
          success: false, 
          message: 'Non autorisé - Utilisateur non trouvé' 
        });
      }

      console.log('✅ Utilisateur authentifié:', user.email);
      
      // Ajouter l'utilisateur à la requête
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      };
      
      next();
      
    } catch (jwtError) {
      console.log('❌ Erreur JWT:', jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Session expirée' 
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé - Token invalide' 
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

// Middleware pour les rôles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès interdit - Rôle insuffisant' 
      });
    }

    next();
  };
};