// src/pages/Settings/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Lock,
  Mail,
  Phone,
  Camera,
  Save,
  Key,
  Eye,
  EyeOff,
  ChevronRight,
  Languages,
  Volume2,
  Monitor,
  Smartphone,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Profil utilisateur
  const [profile, setProfile] = useState({
    nom: 'El Fassi',
    prenom: 'Omar',
    email: 'omar.elfassi@admin.um5.ac.ma',
    telephone: '+212 6 01 23 45 67',
    dateNaissance: '1975-06-25',
    adresse: 'Rabat, Maroc',
    bio: 'Administrateur système passionné par les nouvelles technologies.',
    avatar: null
  });

  // Mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Préférences
  const [preferences, setPreferences] = useState({
    langue: 'fr',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      cours: true,
      messages: true,
      devoirs: true
    },
    affichage: {
      compact: false,
      sidebarReduite: false,
      animations: true
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulation de mise à jour
    setTimeout(() => {
      setSuccessMessage('Profil mis à jour avec succès');
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setLoading(true);
    
    // Simulation de mise à jour
    setTimeout(() => {
      setSuccessMessage('Mot de passe modifié avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };

  const handlePreferencesUpdate = () => {
    setLoading(true);
    
    // Simulation de mise à jour
    setTimeout(() => {
      setSuccessMessage('Préférences mises à jour');
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  const getRoleIcon = () => {
    switch(user?.role) {
      case 'etudiant': return '👨‍🎓';
      case 'enseignant': return '👨‍🏫';
      case 'admin': return '👨‍💼';
      default: return '👤';
    }
  };

  if (!user) return null;

  return (
    <div className="app">
      <Sidebar />
      
      <main className="main-content-with-sidebar">
        {/* Top Navigation */}
        <nav className="top-nav">
          <div className="nav-left">
            <div className="logo">
              <img src="/logo.png" alt="EST" />
              <span>EST Salé</span>
            </div>
          </div>

          <div className="nav-right">
            <div className="user-menu">
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.username}</span>
                <span className="user-role">
                  {getRoleIcon()} {user?.role === 'etudiant' ? 'Étudiant' : 
                   user?.role === 'enseignant' ? 'Enseignant' : 'Administrateur'}
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          {/* Header Section */}
          <div className="content-header">
            <div>
              <h1 className="page-title">Paramètres</h1>
              <p className="page-subtitle">
                {getRoleIcon()} Gérez vos préférences et informations personnelles
              </p>
            </div>
          </div>

          {/* Settings Container */}
          <div className="settings-container">
            {/* Sidebar des onglets */}
            <div className="settings-sidebar">
              <button
                className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} />
                <span>Profil</span>
              </button>
              
              <button
                className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <Lock size={18} />
                <span>Mot de passe</span>
              </button>
              
              <button
                className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={18} />
                <span>Notifications</span>
              </button>
              
              <button
                className={`settings-tab ${activeTab === 'apparence' ? 'active' : ''}`}
                onClick={() => setActiveTab('apparence')}
              >
                <Moon size={18} />
                <span>Apparence</span>
              </button>
              
              <button
                className={`settings-tab ${activeTab === 'langue' ? 'active' : ''}`}
                onClick={() => setActiveTab('langue')}
              >
                <Globe size={18} />
                <span>Langue</span>
              </button>
              
              <button
                className={`settings-tab ${activeTab === 'securite' ? 'active' : ''}`}
                onClick={() => setActiveTab('securite')}
              >
                <Shield size={18} />
                <span>Sécurité</span>
              </button>
            </div>

            {/* Contenu principal */}
            <div className="settings-content">
              {/* Messages */}
              {successMessage && (
                <div className="success-message">
                  <CheckCircle size={18} />
                  <span>{successMessage}</span>
                </div>
              )}
              
              {errorMessage && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Onglet Profil */}
              {activeTab === 'profile' && (
                <div className="settings-panel">
                  <h2 className="panel-title">Informations personnelles</h2>
                  
                  <form onSubmit={handleProfileUpdate} className="settings-form">
                    <div className="avatar-section">
                      <div className="avatar-preview">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt="Avatar" />
                        ) : (
                          <div className="avatar-placeholder">
                            {profile.prenom.charAt(0)}{profile.nom.charAt(0)}
                          </div>
                        )}
                      </div>
                      <button type="button" className="avatar-upload-btn">
                        <Camera size={16} />
                        Changer photo
                      </button>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Prénom</label>
                        <input
                          type="text"
                          value={profile.prenom}
                          onChange={(e) => setProfile({...profile, prenom: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Nom</label>
                        <input
                          type="text"
                          value={profile.nom}
                          onChange={(e) => setProfile({...profile, nom: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <div className="input-with-icon">
                        <Mail size={16} />
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Téléphone</label>
                      <div className="input-with-icon">
                        <Phone size={16} />
                        <input
                          type="tel"
                          value={profile.telephone}
                          onChange={(e) => setProfile({...profile, telephone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Date de naissance</label>
                        <input
                          type="date"
                          value={profile.dateNaissance}
                          onChange={(e) => setProfile({...profile, dateNaissance: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Adresse</label>
                        <input
                          type="text"
                          value={profile.adresse}
                          onChange={(e) => setProfile({...profile, adresse: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Bio</label>
                      <textarea
                        rows="3"
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      ></textarea>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="save-btn" disabled={loading}>
                        <Save size={16} />
                        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Onglet Mot de passe */}
              {activeTab === 'password' && (
                <div className="settings-panel">
                  <h2 className="panel-title">Changer le mot de passe</h2>
                  
                  <form onSubmit={handlePasswordUpdate} className="settings-form">
                    <div className="form-group">
                      <label>Mot de passe actuel</label>
                      <div className="password-input">
                        <Lock size={16} />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Nouveau mot de passe</label>
                      <div className="password-input">
                        <Lock size={16} />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Confirmer le mot de passe</label>
                      <div className="password-input">
                        <Lock size={16} />
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="password-requirements">
                      <p>Le mot de passe doit contenir :</p>
                      <ul>
                        <li className={passwordData.newPassword.length >= 8 ? 'valid' : ''}>
                          Au moins 8 caractères
                        </li>
                        <li className={/[A-Z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                          Une lettre majuscule
                        </li>
                        <li className={/[0-9]/.test(passwordData.newPassword) ? 'valid' : ''}>
                          Un chiffre
                        </li>
                        <li className={/[!@#$%^&*]/.test(passwordData.newPassword) ? 'valid' : ''}>
                          Un caractère spécial
                        </li>
                      </ul>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="save-btn" disabled={loading}>
                        <Key size={16} />
                        {loading ? 'Modification...' : 'Modifier le mot de passe'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Onglet Notifications */}
              {activeTab === 'notifications' && (
                <div className="settings-panel">
                  <h2 className="panel-title">Préférences de notifications</h2>
                  
                  <div className="settings-form">
                    <div className="toggle-group">
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <h3>Notifications par email</h3>
                          <p>Recevoir des notifications par email</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={preferences.notifications.email}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                email: e.target.checked
                              }
                            })}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-info">
                          <h3>Notifications push</h3>
                          <p>Recevoir des notifications sur votre navigateur</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={preferences.notifications.push}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                push: e.target.checked
                              }
                        })}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="separator"></div>

                    <h3 className="subsection-title">Notifications par type</h3>

                    <div className="toggle-group">
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <h3>Nouveaux cours</h3>
                          <p>Être notifié quand un nouveau cours est ajouté</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={preferences.notifications.cours}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                cours: e.target.checked
                              }
                            })}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-info">
                          <h3>Messages</h3>
                          <p>Être notifié des nouveaux messages</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={preferences.notifications.messages}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                messages: e.target.checked
                              }
                            })}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-info">
                          <h3>Devoirs</h3>
                          <p>Être notifié des échéances de devoirs</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={preferences.notifications.devoirs}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                devoirs: e.target.checked
                              }
                            })}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button className="save-btn" onClick={handlePreferencesUpdate}>
                        <Save size={16} />
                        Enregistrer les préférences
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Apparence */}
              {activeTab === 'apparence' && (
                <div className="settings-panel">
                  <h2 className="panel-title">Apparence</h2>
                  
                  <div className="settings-form">
                    <div className="theme-selector">
                      <h3>Thème</h3>
                      <div className="theme-options">
                        <button
                          className={`theme-option ${preferences.theme === 'light' ? 'active' : ''}`}
                          onClick={() => setPreferences({...preferences, theme: 'light'})}
                        >
                          <Sun size={24} />
                          <span>Clair</span>
                        </button>
                        <button
                          className={`theme-option ${preferences.theme === 'dark' ? 'active' : ''}`}
                          onClick={() => setPreferences({...preferences, theme: 'dark'})}
                        >
                          <Moon size={24} />
                          <span>Sombre</span>
                        </button>
                        <button
                          className={`theme-option ${preferences.theme === 'system' ? 'active' : ''}`}
                          onClick={() => setPreferences({...preferences, theme: 'system'})}
                        >
                          <Monitor size={24} />
                          <span>Système</span>
                        </button>
                      </div>
                    </div>

                    <div className="separator"></div>

                    <div className="toggle-group">
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <h3>Mode compact</h3>
                          <p>Afficher plus d'informations sur une même ligne</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={preferences.affichage.compact}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              affichage: {
                                ...preferences.affichage,
                                compact: e.target.checked
                              }
                            })}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-info">
                          <h3>Sidebar réduite par défaut</h3>
                          <p>La sidebar démarre en mode réduit</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={preferences.affichage.sidebarReduite}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              affichage: {
                                ...preferences.affichage,
                                sidebarReduite: e.target.checked
                              }
                            })}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-info">
                          <h3>Animations</h3>
                          <p>Activer les animations de l'interface</p>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={preferences.affichage.animations}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              affichage: {
                                ...preferences.affichage,
                                animations: e.target.checked
                              }
                            })}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button className="save-btn" onClick={handlePreferencesUpdate}>
                        <Save size={16} />
                        Appliquer les modifications
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Langue */}
              {activeTab === 'langue' && (
                <div className="settings-panel">
                  <h2 className="panel-title">Langue</h2>
                  
                  <div className="settings-form">
                    <div className="language-selector">
                      <button
                        className={`language-option ${preferences.langue === 'fr' ? 'active' : ''}`}
                        onClick={() => setPreferences({...preferences, langue: 'fr'})}
                      >
                        <span className="language-flag">🇫🇷</span>
                        <div className="language-info">
                          <h3>Français</h3>
                          <p>Langue par défaut</p>
                        </div>
                        {preferences.langue === 'fr' && <CheckCircle size={18} />}
                      </button>

                      <button
                        className={`language-option ${preferences.langue === 'en' ? 'active' : ''}`}
                        onClick={() => setPreferences({...preferences, langue: 'en'})}
                      >
                        <span className="language-flag">🇬🇧</span>
                        <div className="language-info">
                          <h3>English</h3>
                          <p>Default language</p>
                        </div>
                        {preferences.langue === 'en' && <CheckCircle size={18} />}
                      </button>

                      <button
                        className={`language-option ${preferences.langue === 'ar' ? 'active' : ''}`}
                        onClick={() => setPreferences({...preferences, langue: 'ar'})}
                      >
                        <span className="language-flag">🇲🇦</span>
                        <div className="language-info">
                          <h3>العربية</h3>
                          <p>اللغة الافتراضية</p>
                        </div>
                        {preferences.langue === 'ar' && <CheckCircle size={18} />}
                      </button>
                    </div>

                    <div className="form-actions">
                      <button className="save-btn" onClick={handlePreferencesUpdate}>
                        <Save size={16} />
                        Changer la langue
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Sécurité */}
              {activeTab === 'securite' && (
                <div className="settings-panel">
                  <h2 className="panel-title">Sécurité du compte</h2>
                  
                  <div className="settings-form">
                    <div className="security-item">
                      <div className="security-info">
                        <Shield size={20} />
                        <div>
                          <h3>Authentification à deux facteurs</h3>
                          <p>Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                        </div>
                      </div>
                      <button className="security-btn">Activer</button>
                    </div>

                    <div className="security-item">
                      <div className="security-info">
                        <Smartphone size={20} />
                        <div>
                          <h3>Appareils connectés</h3>
                          <p>Gérez les appareils qui ont accès à votre compte</p>
                        </div>
                      </div>
                      <button className="security-btn">Gérer</button>
                    </div>

                    <div className="security-item">
                      <div className="security-info">
                        <History size={20} />
                        <div>
                          <h3>Historique de connexion</h3>
                          <p>Consultez les dernières connexions à votre compte</p>
                        </div>
                      </div>
                      <button className="security-btn">Voir</button>
                    </div>

                    <div className="separator"></div>

                    <div className="danger-zone">
                      <h3>Zone de danger</h3>
                      <p>Ces actions sont irréversibles</p>
                      
                      <button className="danger-btn">
                        Supprimer mon compte
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;