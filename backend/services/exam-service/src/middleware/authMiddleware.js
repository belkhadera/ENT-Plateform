const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  try {
    console.log('\n🔐 EXAM SERVICE AUTH');
    
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader ? authHeader.substring(0, 50) + '...' : 'absent');
    
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
        message: 'Accès interdit'
      });
    }

    next();
  };
};