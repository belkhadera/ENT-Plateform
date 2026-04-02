const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const redis = require('../config/redis');
const axios = require('axios');
const qs = require('querystring');

// Configuration Keycloak avec valeurs par défaut
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'est-realm';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'est-auth-client';
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || 'your-auth-client-secret';

// Flag pour savoir si Keycloak est disponible
let keycloakAvailable = false;
// Vérifier la disponibilité de Keycloak au démarrage
const checkKeycloakAvailability = async () => {
  try {
    console.log('🔍 Vérification de la disponibilité de Keycloak...');
    const response = await axios.get(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`, {
      timeout: 5000
    });
    if (response.status === 200) {
      console.log('✅ Keycloak est disponible');
      keycloakAvailable = true;
    } else {
      console.log('⚠️ Keycloak répond mais le realm n\'existe pas');
      keycloakAvailable = false;
    }
  } catch (error) {
    console.log('⚠️ Keycloak n\'est pas disponible, utilisation du mode dégradé');
    console.log('   Détail:', error.message);
    keycloakAvailable = false;
  }
};

// Appeler la vérification au démarrage
checkKeycloakAvailability();

// @desc    Register a new user (avec Keycloak)
// @route   POST /api/auth/register
// @access  Public// Fonctions utilitaires Keycloak avec gestion d'erreur
// Fonctions utilitaires Keycloak avec gestion d'erreur
async function getKeycloakToken(username, password) {
  if (!keycloakAvailable) {
    throw new Error('Keycloak not available');
  }
  
  try {
    const response = await axios.post(
      `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
      qs.stringify({
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
        username: username,
        password: password,
        grant_type: 'password'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 5000
      }
    );
    return response.data;
  } catch (error) {
    console.error('Keycloak token error:', error.response?.data || error.message);
    throw error;
  }
}
async function createKeycloakUser(userData) {
  if (!keycloakAvailable) {
    throw new Error('Keycloak not available');
  }

  try {
    // Obtenir token admin
    const adminToken = await getAdminToken();
    
    // Créer l'utilisateur
    const keycloakUser = {
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      enabled: true,
      emailVerified: true,
      credentials: [{
        type: 'password',
        value: userData.password,
        temporary: false
      }]
    };

    await axios.post(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`,
      keycloakUser,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    return true;
  } catch (error) {
    console.error('Keycloak create user error:', error.response?.data || error.message);
    throw error;
  }
}

exports.register = async (req, res) => {
  try {
    console.log('📝 Tentative d\'inscription:', req.body);
    
    const { username, email, password, firstName, lastName, role } = req.body;

    // Vérification si l'utilisateur existe
    console.log('🔍 Vérification existence utilisateur...');
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    
    if (userExists) {
      console.log('❌ Utilisateur existe déjà:', userExists.email);
      return res.status(400).json({ 
        success: false, 
        message: 'Un utilisateur existe déjà avec cet email ou nom d\'utilisateur' 
      });
    }

    // Création utilisateur
    console.log('💾 Création dans MongoDB...');
    console.log('📦 Données à insérer:', {
      username,
      email,
      password: '[HIDDEN]',
      firstName,
      lastName,
      role
    });

    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'STUDENT'
    });

    console.log('✅ Utilisateur créé avec succès! ID:', user._id);
    console.log('👤 Utilisateur complet:', user.toObject());

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ ERREUR DÉTAILLÉE:');
    console.error('  Nom:', error.name);
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    
    if (error.name === 'ValidationError') {
      console.error('  Erreurs validation:');
      Object.keys(error.errors).forEach(field => {
        console.error(`    ${field}: ${error.errors[field].message}`);
      });
    }
    
    if (error.code === 11000) {
      console.error('  Duplicate key error:', error.keyValue);
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email ou nom d\'utilisateur est déjà utilisé',
        field: Object.keys(error.keyValue)[0]
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};
// @desc    Login user (avec Keycloak)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('🔑 Tentative de connexion:', req.body.login);
    
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez fournir un identifiant et un mot de passe' 
      });
    }

    let keycloakToken = null;
    let keycloakUserInfo = null;

    // Essayer d'abord avec Keycloak si disponible
    if (keycloakAvailable) {
      try {
        console.log('🔐 Tentative d\'authentification Keycloak...');
        const tokenResponse = await getKeycloakToken(login, password);
        keycloakToken = tokenResponse.access_token;
        
        // Décoder le token pour obtenir les infos
        const tokenParts = keycloakToken.split('.');
        const tokenPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        keycloakUserInfo = tokenPayload;
        
        console.log('✅ Authentification Keycloak réussie');
      } catch (keycloakError) {
        console.log('⚠️ Authentification Keycloak échouée, fallback sur MongoDB');
        keycloakAvailable = false; // Temporairement désactiver pour ce appel
      }
    }

    // Chercher l'utilisateur dans MongoDB
    const user = await User.findOne({
      $or: [{ email: login }, { username: login }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants invalides' 
      });
    }

    // Vérifier le mot de passe MongoDB
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch && !keycloakToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants invalides' 
      });
    }

    // Mettre à jour dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Générer notre token JWT local
    const localToken = generateToken(user._id, user.role);

    // Stocker dans Redis
    try {
      await redis.set(`token:${user._id}`, keycloakToken || localToken, 'EX', 86400);
    } catch (redisError) {
      console.warn('Redis error:', redisError.message);
    }

    // Répondre avec le token approprié
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          keycloakId: user.keycloakId
        },
        token: keycloakToken || localToken,
        keycloakEnabled: !!keycloakToken,
        keycloakUserInfo: keycloakUserInfo
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la connexion',
      error: error.message 
    });
  }
};
// @desc    Get current user profile (avec Keycloak)
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Optionnel : obtenir des infos supplémentaires de Keycloak
    let keycloakProfile = null;
    if (user.keycloakId) {
      try {
        const adminToken = await getAdminToken();
        const keycloakUser = await axios.get(
          `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${user.keycloakId}`,
          {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          }
        );
        keycloakProfile = keycloakUser.data;
      } catch (error) {
        console.warn('Could not fetch Keycloak profile:', error.message);
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          lastLogin: user.lastLogin,
          keycloakId: user.keycloakId,
          keycloakProfile
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Refresh token (avec Keycloak)
// @route   POST /api/auth/refresh
// @access  Private
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    try {
      // Rafraîchir le token avec Keycloak
      const response = await axios.post(
        `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
        qs.stringify({
          client_id: KEYCLOAK_CLIENT_ID,
          client_secret: KEYCLOAK_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // Mettre à jour Redis
      const user = await User.findById(req.user.id);
      if (user) {
        await redis.setex(`token:${user._id}`, 86400, response.data.access_token);
        await redis.setex(`refresh_token:${user._id}`, 86400 * 7, response.data.refresh_token);
      }

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresIn: response.data.expires_in
        }
      });
    } catch (keycloakError) {
      console.error('Keycloak refresh error:', keycloakError.response?.data || keycloakError.message);
      
      // Fallback à MongoDB
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      const token = generateToken(user._id, user.role);
      await redis.setex(`token:${user._id}`, 86400, token);

      res.json({
        success: true,
        message: 'Token refreshed successfully (MongoDB fallback)',
        data: { token }
      });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Logout user (avec Keycloak)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Nettoyer Redis
    await redis.del(`token:${req.user.id}`);
    await redis.del(`refresh_token:${req.user.id}`);

    // Déconnecter de Keycloak si on a un refresh token
    if (refreshToken) {
      try {
        await axios.post(
          `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`,
          qs.stringify({
            client_id: KEYCLOAK_CLIENT_ID,
            client_secret: KEYCLOAK_CLIENT_SECRET,
            refresh_token: refreshToken
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
      } catch (keycloakError) {
        console.warn('Keycloak logout warning:', keycloakError.message);
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// ==================== Fonctions utilitaires Keycloak ====================

async function getAdminToken() {
  try {
    const response = await axios.post(
      `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
      qs.stringify({
        client_id: 'admin-cli',
        username: 'admin',
        password: 'admin',
        grant_type: 'password'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 5000
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Admin token error:', error.response?.data || error.message);
    throw error;
  }
}

async function getKeycloakToken(username, password) {
  try {
    const response = await axios.post(
      `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
      qs.stringify({
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
        username: username,
        password: password,
        grant_type: 'password'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting user token:', error.response?.data || error.message);
    throw error;
  }
}

async function getKeycloakUserId(username, adminToken) {
  try {
    const response = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?username=${username}`,
      {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }
    );
    return response.data[0]?.id;
  } catch (error) {
    console.error('Error getting user ID:', error.response?.data || error.message);
    throw error;
  }
}

async function getKeycloakUserInfo(accessToken) {
  try {
    const response = await axios.get(
      `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting user info:', error.response?.data || error.message);
    throw error;
  }
}

async function assignRealmRole(userId, roleName, adminToken) {
  try {
    // Obtenir l'ID du rôle
    const rolesResponse = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/roles`,
      {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }
    );
    
    const role = rolesResponse.data.find(r => r.name === roleName);
    
    if (!role) {
      console.warn(`Role ${roleName} not found in Keycloak`);
      return;
    }

    // Assigner le rôle à l'utilisateur
    await axios.post(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`,
      [{
        id: role.id,
        name: role.name
      }],
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error assigning role:', error.response?.data || error.message);
    throw error;
  }
}
exports.checkKeycloakStatus = async (req, res) => {
  try {
    // Rafraîchir le statut
    await checkKeycloakAvailability();
    
    res.json({
      success: true,
      keycloakAvailable,
      realm: KEYCLOAK_REALM,
      url: KEYCLOAK_URL
    });
  } catch (error) {
    res.json({
      success: false,
      keycloakAvailable: false,
      error: error.message
    });
  }
};