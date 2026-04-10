import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  Bot,
  Calendar,
  ChevronRight,
  HelpCircle,
  Lock,
  LogIn,
  Mail,
  Send,
  Shield,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage, sendPublicChatMessage } from '../../services/api';
import './Login.css';

const testAccounts = [
  { role: 'Etudiant', username: 'student', password: 'student123', icon: 'Student' },
  { role: 'Enseignant', username: 'teacher', password: 'teacher123', icon: 'Teacher' },
  { role: 'Administrateur', username: 'admin', password: 'admin123', icon: 'Admin' },
];

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const username = formData.username.trim();
    const password = formData.password.trim();

    if (!username || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    const result = await login(username, password, rememberMe);
    if (result.success) {
      navigate('/dashboard', { replace: true });
      return;
    }

    setError(result.error || 'Nom d utilisateur ou mot de passe incorrect.');
  };

  const fillTestAccount = (username, password) => {
    setFormData({ username, password });
    setError('');
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="container header-container">
          <div className="header-left">
            <img
              src="/logo.png"
              alt="EST Sale"
              className="header-logo"
              onError={(event) => {
                event.target.onerror = null;
                event.target.src = 'https://via.placeholder.com/40x40?text=EST';
              }}
            />
            <span className="header-title">ENT - EST Sale</span>
          </div>
        </div>
      </header>

      <main className="login-main">
        <div className="container main-container">
          <div className="hero-column">
            <div className="hero-image-container">
              <img
                src="/images/est-campus.jpg"
                alt="Campus EST Sale"
                className="hero-image"
                onError={(event) => {
                  event.target.onerror = null;
                  event.target.src =
                    'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1486&q=80';
                }}
              />
              <div className="hero-overlay-light">
                <div className="hero-content">
                  <h1 className="hero-title">Universite Mohammed V de Rabat</h1>
                  <h2 className="hero-subtitle">Ecole Superieure de Technologie - Sale</h2>
                  <div className="hero-arabic">
                    <p>Plateforme ENT</p>
                    <p>Connexion aux cours, ressources et administration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-column">
            <div className="form-card">
              <div className="form-header">
                <img
                  src="/logo.png"
                  alt="EST Sale"
                  className="form-logo"
                  onError={(event) => {
                    event.target.onerror = null;
                    event.target.src = 'https://via.placeholder.com/80x80?text=EST';
                  }}
                />
                <div className="security-badge">
                  <Shield size={14} />
                  <span>Connexion securisee</span>
                </div>
              </div>

              <div className="form-title-section">
                <h3>Bienvenue</h3>
                <p>Connectez-vous avec votre nom d utilisateur Keycloak</p>
              </div>

              {error && (
                <div className="error-alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="username">Nom d utilisateur</label>
                  <div className="input-shell">
                    <span className="input-shell-icon">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="ex: student"
                      className="form-input"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Mot de passe</label>
                  <div className="input-shell">
                    <span className="input-shell-icon">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="********"
                      className="form-input"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    <span className="checkbox-custom"></span>
                    <span>Se souvenir de moi</span>
                  </label>

                  <a href="#" className="forgot-link" onClick={(event) => event.preventDefault()}>
                    Mot de passe oublie ?
                  </a>
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      <span>Se connecter</span>
                    </>
                  )}
                </button>
              </form>

              <div className="auth-switch">
                <span>Vous n avez pas encore de compte ?</span>
                <Link to="/register" className="auth-switch-link">
                  Demander une inscription
                </Link>
              </div>

              <div className="test-accounts-section">
                <button
                  className="test-toggle"
                  onClick={() => setShowTestAccounts((previous) => !previous)}
                  type="button"
                >
                  <span>Comptes de test</span>
                  <ChevronRight size={16} className={`toggle-icon ${showTestAccounts ? 'open' : ''}`} />
                </button>

                {showTestAccounts && (
                  <div className="test-accounts-grid">
                    {testAccounts.map((account) => (
                      <button
                        key={account.username}
                        className="test-account-card"
                        onClick={() => fillTestAccount(account.username, account.password)}
                        type="button"
                      >
                        <span className="account-role">
                          <span className="account-icon">{account.icon}</span>
                          {account.role}
                        </span>
                        <span className="account-credentials">
                          {account.username} / {account.password}
                        </span>
                        <span className="account-fill">Remplir</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="help-text">
                <Mail size={14} />
                <span>Les comptes nouvellement inscrits restent inactifs jusqu a validation par un administrateur.</span>
              </div>

              <div className="chat-ai-button-section">
                <button className="chat-ai-button" onClick={() => setShowAIChat(true)} type="button">
                  <Bot size={18} />
                  <span>Parler a l assistant IA</span>
                  <ChevronRight size={16} className="button-arrow" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAIChat && <AIChatModal onClose={() => setShowAIChat(false)} />}

      <footer className="login-footer">
        <div className="container footer-container">
          <p className="copyright">Copyright 2025 EST Sale - Tous droits reserves</p>
          <div className="footer-links">
            <a href="#" onClick={(event) => event.preventDefault()}>
              Mentions legales
            </a>
            <a href="#" onClick={(event) => event.preventDefault()}>
              Confidentialite
            </a>
            <a href="#" onClick={(event) => event.preventDefault()}>
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const AIChatModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        "Bonjour. Je peux vous aider sur la connexion, l inscription, la validation du compte et l utilisation generale de la plateforme.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState('');

  const quickQuestions = [
    { icon: <HelpCircle size={14} />, text: "Comment s'inscrire ?" },
    { icon: <Lock size={14} />, text: 'Pourquoi mon compte est inactif ?' },
    { icon: <BookOpen size={14} />, text: 'Comment acceder aux cours ?' },
    { icon: <Calendar size={14} />, text: "Ou voir l'emploi du temps ?" },
  ];

  const getConversationHistory = (conversation) =>
    conversation
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

  const pushConversation = async (question) => {
    const cleanedQuestion = question.trim();
    if (!cleanedQuestion || isTyping) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: cleanedQuestion,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsTyping(true);
    setChatError('');

    try {
      const response = await sendPublicChatMessage({
        message: cleanedQuestion,
        history: getConversationHistory(nextMessages).slice(-6),
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.reply || "Je n ai pas pu generer de reponse pour le moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      setChatError(getApiErrorMessage(error, "Assistant IA indisponible pour le moment."));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextMessage = inputMessage.trim();
    if (!nextMessage) {
      return;
    }
    setInputMessage('');
    await pushConversation(nextMessage);
  };

  return (
    <div className="ai-chat-modal-overlay" onClick={onClose}>
      <div className="ai-chat-modal" onClick={(event) => event.stopPropagation()}>
        <div className="ai-chat-header">
          <div className="ai-header-content">
            <div className="ai-header-icon">
              <Bot size={22} />
            </div>
            <div>
              <h3>Assistant IA</h3>
              <p>Aide rapide depuis la page de connexion</p>
            </div>
          </div>
          <button className="ai-close-button" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="ai-chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`ai-message ${message.role}`}>
              {message.role === 'assistant' && (
                <div className="ai-message-avatar">
                  <Bot size={14} />
                </div>
              )}
              <div className="ai-message-content">
                <p>{message.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="ai-message assistant">
              <div className="ai-message-avatar">
                <Bot size={14} />
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        <div className="ai-quick-questions">
          <p className="quick-questions-title">Questions rapides</p>
          <div className="quick-questions-grid">
            {quickQuestions.map((item) => (
              <button key={item.text} className="quick-question-btn" onClick={() => void pushConversation(item.text)} type="button">
                {item.icon}
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        </div>

        {chatError && (
          <div className="error-alert" style={{ margin: '0 1rem 1rem' }}>
            <AlertCircle size={16} />
            <span>{chatError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="ai-chat-input">
          <input
            type="text"
            placeholder="Posez votre question..."
            value={inputMessage}
            onChange={(event) => setInputMessage(event.target.value)}
          />
          <button type="submit" disabled={!inputMessage.trim()}>
            <Send size={16} />
          </button>
        </form>

        <div className="ai-chat-footer">
          <Sparkles size={12} />
          <span>Assistant connecte au chat-service</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
