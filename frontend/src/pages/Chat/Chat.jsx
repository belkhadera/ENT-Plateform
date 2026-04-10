import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  Bot,
  Clock,
  Copy,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { getApiErrorMessage, sendChatMessage } from '../../services/api';
import './Chat.css';

const suggestions = [
  'Comment utiliser la plateforme ENT ?',
  'Comment un enseignant publie un cours ?',
  'Comment telecharger un document ?',
  'Explique le role de Cassandra dans ce projet.',
  'Donne un resume simple de React.',
];

const getRoleLabel = (role) => {
  switch (role) {
    case 'enseignant':
      return 'Enseignant';
    case 'admin':
      return 'Administrateur';
    case 'etudiant':
    default:
      return 'Etudiant';
  }
};

const buildWelcomeMessage = (username) => ({
  id: 'welcome',
  role: 'assistant',
  content:
    `Bonjour ${username || 'utilisateur'}.\n\n` +
    "Je suis l assistant IA du ENT EST Sale, connecte au chat-service. " +
    "Je peux vous aider sur l utilisation de la plateforme, les cours publies, " +
    'et des questions academiques ou techniques.',
  timestamp: new Date().toISOString(),
});

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [modelName, setModelName] = useState('Ollama');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setMessages([buildWelcomeMessage(user.username)]);
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const getConversationHistory = (conversation) =>
    conversation
      .filter((message) => message.id !== 'welcome')
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

  const appendAssistantReply = (reply, model) => {
    setModelName(model || 'Ollama');
    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const askAssistant = async (messageText, history) => {
    const response = await sendChatMessage({
      message: messageText,
      history,
    });
    appendAssistantReply(response.reply, response.model);
  };

  const handleSendMessage = async (overrideMessage) => {
    const text = (overrideMessage ?? inputMessage).trim();
    if (!text || isLoading) {
      return;
    }

    const userMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      await askAssistant(text, getConversationHistory(nextMessages.slice(0, -1)));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Le service d IA n est pas disponible."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      setError('Copie impossible depuis ce navigateur.');
    }
  };

  const handleRegenerate = async () => {
    let lastUserIndex = -1;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === 'user') {
        lastUserIndex = index;
        break;
      }
    }

    if (lastUserIndex < 0 || isLoading) {
      return;
    }

    const lastUserMessage = messages[lastUserIndex];
    setIsLoading(true);
    setError('');

    try {
      const history = getConversationHistory(messages.slice(0, lastUserIndex));
      await askAssistant(lastUserMessage.content, history);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Le service d IA n est pas disponible."));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content-with-sidebar">
        <nav className="top-nav">
          <div className="nav-left">
            <div className="logo">
              <img src="/logo.png" alt="EST" />
              <span>EST Sale</span>
            </div>
          </div>

          <div className="nav-right">
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Rechercher dans les conversations..." />
            </div>

            <button className="notif-btn">
              <Bell size={20} />
              <span className="notif-dot"></span>
            </button>

            <div className="user-menu">
              <div className="user-avatar">{user.username?.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-role">{getRoleLabel(user.role)}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="content-wrapper">
          <div className="content-header">
            <div>
              <h1 className="page-title">Chat IA</h1>
              <p className="page-subtitle">
                {getRoleLabel(user.role)} - Assistant base sur {modelName}
              </p>
            </div>
          </div>

          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.role === 'assistant' ? 'assistant' : 'user'}`}>
                  <div className="message-avatar">
                    {message.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">{message.role === 'assistant' ? 'Assistant IA' : user.username}</span>
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                    </div>
                    <div className="message-text">
                      {message.content.split('\n').map((line, index, array) => (
                        <React.Fragment key={`${message.id}-${index}`}>
                          {line}
                          {index < array.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>

                    {message.role === 'assistant' && message.id !== 'welcome' && (
                      <div className="message-actions">
                        <button className="action-btn" title="Copier" onClick={() => handleCopyMessage(message.content)}>
                          <Copy size={14} />
                        </button>
                        <button className="action-btn" title="Regenerer" onClick={handleRegenerate}>
                          <RefreshCw size={14} />
                        </button>
                        <button className="action-btn" title="Utile">
                          <ThumbsUp size={14} />
                        </button>
                        <button className="action-btn" title="Pas utile">
                          <ThumbsDown size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message assistant">
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">Assistant IA</span>
                    </div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="chat-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {messages.length === 1 && (
              <div className="suggestions-section">
                <h3 className="suggestions-title">
                  <Sparkles size={16} />
                  Suggestions de questions
                </h3>
                <div className="suggestions-grid">
                  {suggestions.map((suggestion) => (
                    <button key={suggestion} className="suggestion-chip" onClick={() => handleSuggestionClick(suggestion)}>
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="chat-input-area">
              <textarea
                value={inputMessage}
                onChange={(event) => setInputMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question sur la plateforme ou un sujet academique..."
                className="chat-input"
                rows="1"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                className={`send-btn ${!inputMessage.trim() || isLoading ? 'disabled' : ''}`}
                disabled={!inputMessage.trim() || isLoading}
              >
                <Send size={18} />
              </button>
            </div>

            <div className="chat-info-bar">
              <div className="info-left">
                <Bot size={14} />
                <span>Microservice Ollama dedie au ENT</span>
              </div>
              <div className="info-right">
                <span className="info-badge">
                  <MessageCircle size={14} />
                  {Math.max(messages.length - 1, 0)} messages
                </span>
                <span className="info-badge">
                  <Clock size={14} />
                  Historique conserve dans la session
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
