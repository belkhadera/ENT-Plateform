const axios = require('axios');
const jwt = require('jsonwebtoken');

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'est-realm';
const KEYCLOAK_ENABLED = process.env.KEYCLOAK_ENABLED === 'true'; // Désactivable

// Middleware pour vérifier le token
exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token manquant' 
      });
    }

    // OPTION 1: D'abord essayer JWT local (plus fiable)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token JWT local valide pour:', decoded.id);
      
      req.user = {
        id: decoded.id,
        role: decoded.role,
        ...decoded
      };
      
      return next();
    } catch (jwtError) {
      console.log('⚠️ Token JWT local invalide, tentative Keycloak...');
      
      // OPTION 2: Si JWT local échoue et Keycloak est activé, essayer Keycloak
      if (KEYCLOAK_ENABLED) {
        try {
          const response = await axios.get(
            `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 5000
            }
          );

          req.user = {
            id: response.data.sub,
            email: response.data.email,
            username: response.data.preferred_username,
            firstName: response.data.given_name,
            lastName: response.data.family_name,
            role: response.data.realm_access?.roles?.includes('TEACHER') ? 'TEACHER' : 'STUDENT',
            roles: response.data.realm_access?.roles || []
          };

          console.log('✅ Token Keycloak valide pour:', req.user.email);
          return next();
        } catch (keycloakError) {
          console.error('❌ Keycloak verification failed:', keycloakError.message);
        }
      }
    }

    // Si les deux échouent
    return res.status(401).json({ 
      success: false, 
      message: 'Token invalide' 
    });

  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur authentification' 
    });
  }
};

// Middleware pour vérifier les rôles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentification requise' 
      });
    }

    const userRole = req.user.role || req.user.roles?.[0];
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Accès interdit. Rôle requis: ${roles.join(' ou ')}` 
      });
    }

    next();
  };
};

// Middleware spécifique pour teacher
exports.checkTeacher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentification requise' 
    });
  }

  const userRole = req.user.role || req.user.roles?.[0];
  
  if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Accès enseignant requis' 
    });
  }

  next();
};