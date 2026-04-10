import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Lock,
  Mail,
  Send,
  Shield,
  Sparkles,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage, registerUser, sendPublicChatMessage } from '../../services/api';
import '../Login/Login.css';

const initialFormState = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);

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
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    const payload = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    if (!payload.first_name || !payload.last_name || !payload.username || !payload.email || !payload.password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerUser(payload);
      setSuccessMessage(
        response.message || 'Votre demande a ete envoyee. Un administrateur doit activer votre compte avant connexion.'
      );
      setFormData(initialFormState);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Inscription impossible.'));
    } finally {
      setIsSubmitting(false);
    }
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
                  <h1 className="hero-title">Creez votre acces ENT</h1>
                  <h2 className="hero-subtitle">Une inscription simple, suivie d une validation par l administration</h2>
                  <div className="hero-arabic">
                    <p>Inscription en ligne</p>
                    <p>Les comptes etudiants restent inactifs jusqu a approbation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-column">
            <div className="form-card register-card">
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
                  <span>Inscription securisee</span>
                </div>
              </div>

              <div className="form-title-section">
                <h3>Demande d inscription</h3>
                <p>Votre compte sera active apres validation par un administrateur</p>
              </div>

              {error && (
                <div className="error-alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="success-alert">
                  <CheckCircle2 size={16} />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-grid two-columns">
                  <div className="form-group">
                    <label htmlFor="firstName">Prenom</label>
                    <div className="input-shell">
                      <span className="input-shell-icon">
                        <User size={18} />
                      </span>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Prenom"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Nom</label>
                    <div className="input-shell">
                      <span className="input-shell-icon">
                        <User size={18} />
                      </span>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Nom"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="username">Nom d utilisateur</label>
                  <div className="input-shell">
                    <span className="input-shell-icon">
                      <UserPlus size={18} />
                    </span>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="ex: ahmed.bennani"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <div className="input-shell">
                    <span className="input-shell-icon">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="ex: etudiant@est-sale.local"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-grid two-columns">
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
                        className="form-input"
                        placeholder="Minimum 6 caracteres"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmation</label>
                    <div className="input-shell">
                      <span className="input-shell-icon">
                        <Lock size={18} />
                      </span>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Repetez le mot de passe"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Envoyer la demande</span>
                    </>
                  )}
                </button>
              </form>

              <div className="auth-switch">
                <span>Vous avez deja un compte ?</span>
                <Link to="/login" className="auth-switch-link">
                  Revenir a la connexion
                </Link>
              </div>

              <div className="help-text">
                <Mail size={14} />
                <span>Apres validation par l administrateur, vous pourrez vous connecter avec votre nom d utilisateur.</span>
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

      {showAIChat && <RegisterAIChatModal onClose={() => setShowAIChat(false)} />}

      <footer className="login-footer">
        <div className="container footer-container">
          <p className="copyright">Copyright 2025 EST Sale - Tous droits reserves</p>
          <div className="footer-links">
            <Link to="/login">Connexion</Link>
            <a href="#" onClick={(event) => event.preventDefault()}>
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const RegisterAIChatModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        "Bonjour. Je peux vous aider sur l inscription, les informations demandees, l activation du compte et la premiere connexion.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState('');

  const quickQuestions = [
    { icon: <HelpCircle size={14} />, text: "Comment s'inscrire ?" },
    { icon: <Mail size={14} />, text: 'Quel email utiliser ?' },
    { icon: <Lock size={14} />, text: 'Pourquoi je ne peux pas me connecter ?' },
    { icon: <Calendar size={14} />, text: 'Combien de temps pour la validation ?' },
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
              <p>Aide rapide depuis la page d inscription</p>
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

export default Register;
