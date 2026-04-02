const Keycloak = require('keycloak-connect');
const session = require('express-session');

let keycloak;

module.exports = (app) => {
  // Configuration de la session
  const memoryStore = new session.MemoryStore();
  app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
  }));

  // Configuration Keycloak
  const keycloakConfig = {
    realm: process.env.KEYCLOAK_REALM,
    'bearer-only': true,
    'auth-server-url': process.env.KEYCLOAK_URL,
    'ssl-required': 'external',
    resource: process.env.KEYCLOAK_CLIENT_ID,
    credentials: {
      secret: process.env.KEYCLOAK_CLIENT_SECRET
    },
    'confidential-port': 0
  };

  keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
  app.use(keycloak.middleware());

  return keycloak;
};

// Middleware pour vérifier les rôles
module.exports.checkRoles = (roles) => {
  return (req, res, next) => {
    const token = req.kauth.grant.access_token;
    
    if (!token) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const hasRole = roles.some(role => token.hasRole(role));
    
    if (!hasRole) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    next();
  };
};