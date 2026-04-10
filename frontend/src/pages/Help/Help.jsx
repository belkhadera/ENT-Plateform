import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  Search,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import './Help.css';

const Help = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [faqs, setFaqs] = useState([]);
  const [guides, setGuides] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFaqs([
      {
        id: 1,
        question: 'Comment acceder a mes cours ?',
        answer:
          'Pour acceder a vos cours, cliquez sur "Mes cours" dans la sidebar. Vous y trouverez la liste des cours et des ressources disponibles.',
        category: 'cours',
        helpful: 45,
      },
      {
        id: 2,
        question: 'Comment telecharger un fichier de cours ?',
        answer:
          'Dans la page "Mes cours", cliquez sur le bouton "Telecharger" a cote du document souhaite. Le telechargement demarrera ensuite.',
        category: 'cours',
        helpful: 32,
      },
      {
        id: 3,
        question: 'Comment soumettre un devoir ?',
        answer:
          'Rendez-vous dans la page du cours concerne et suivez les instructions de depot si cette fonctionnalite est activee dans votre espace.',
        category: 'cours',
        helpful: 21,
      },
      {
        id: 4,
        question: 'Comment modifier mon mot de passe ?',
        answer:
          'Allez dans "Parametres" puis dans la section dediee au compte pour mettre a jour votre mot de passe.',
        category: 'compte',
        helpful: 56,
      },
      {
        id: 5,
        question: 'Comment voir mon emploi du temps ?',
        answer:
          'La page "Calendrier" affiche vos cours, examens, deadlines et autres evenements de la plateforme.',
        category: 'calendrier',
        helpful: 34,
      },
      {
        id: 6,
        question: 'Que faire si un fichier ne se telecharge pas ?',
        answer:
          'Verifiez votre connexion, rechargez la page puis reessayez. Si le probleme persiste, contactez le support technique.',
        category: 'technique',
        helpful: 15,
      },
    ]);

    setGuides([
      {
        id: 1,
        title: 'Guide de demarrage rapide',
        description: 'Apprenez les bases de la plateforme en quelques minutes',
        icon: 'Guide',
        color: '#1967d2',
        readTime: 5,
        level: 'Debutant',
      },
      {
        id: 2,
        title: 'Gerer vos cours et ressources',
        description: 'Organisez et retrouvez facilement les documents pedagogiques',
        icon: 'Cours',
        color: '#137333',
        readTime: 6,
        level: 'Debutant',
      },
      {
        id: 3,
        title: 'Guide de l enseignant',
        description: 'Publier et administrer les contenus destines aux etudiants',
        icon: 'Enseignant',
        color: '#b45309',
        readTime: 12,
        level: 'Enseignant',
      },
    ]);

    setSupportTickets([
      {
        id: 1,
        title: 'Probleme de connexion',
        status: 'resolu',
        date: '2024-03-20',
        priority: 'haute',
      },
      {
        id: 2,
        title: 'Fichier corrompu',
        status: 'en_cours',
        date: '2024-03-21',
        priority: 'moyenne',
      },
    ]);
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const filteredFaqs = faqs.filter((faq) => {
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch =
      faq.question.toLowerCase().includes(normalizedSearch) || faq.answer.toLowerCase().includes(normalizedSearch);
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const roleLabel =
    user.role === 'etudiant' ? 'Etudiant' : user.role === 'enseignant' ? 'Enseignant' : 'Administrateur';

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
              <input
                type="text"
                placeholder="Rechercher dans l'aide..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <button className="notif-btn">
              <Bell size={20} />
              <span className="notif-dot"></span>
            </button>

            <div className="user-menu">
              <div className="user-avatar">{user.username?.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-role">{roleLabel}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="content-wrapper">
          <div className="content-header">
            <div>
              <h1 className="page-title">Centre d'aide</h1>
              <p className="page-subtitle">Trouvez des reponses a vos questions sur la plateforme</p>
            </div>
          </div>

          <div className="help-actions">
            <button className="help-action-btn" onClick={() => setShowTicketModal(true)}>
              <MessageSquare size={24} />
              <div>
                <h3>Contacter le support</h3>
                <p>Notre equipe vous repond sous 24h</p>
              </div>
              <ChevronRight size={20} />
            </button>

            <a href="mailto:support@est.um5.ac.ma" className="help-action-btn">
              <Mail size={24} />
              <div>
                <h3>Envoyer un email</h3>
                <p>support@est.um5.ac.ma</p>
              </div>
              <ExternalLink size={20} />
            </a>

            <a href="tel:+212537772222" className="help-action-btn">
              <Phone size={24} />
              <div>
                <h3>Appeler le support</h3>
                <p>+212 5 37 77 22 22</p>
              </div>
              <ExternalLink size={20} />
            </a>
          </div>

          <div className="guides-section">
            <h2 className="section-title">Guides et tutoriels</h2>
            <div className="guides-grid">
              {guides.map((guide) => (
                <div key={guide.id} className="guide-card">
                  <div className="guide-icon" style={{ background: guide.color }}>
                    <span>{guide.icon}</span>
                  </div>
                  <h3 className="guide-title">{guide.title}</h3>
                  <p className="guide-description">{guide.description}</p>
                  <div className="guide-meta">
                    <span className="guide-read-time">{guide.readTime} min</span>
                    <span className="guide-level">{guide.level}</span>
                  </div>
                  <button className="guide-btn">
                    Lire le guide
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="faq-section">
            <h2 className="section-title">Questions frequentes</h2>

            <div className="faq-categories">
              <button className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedCategory('all')}>
                Toutes
              </button>
              <button className={`category-btn ${selectedCategory === 'cours' ? 'active' : ''}`} onClick={() => setSelectedCategory('cours')}>
                Cours
              </button>
              <button className={`category-btn ${selectedCategory === 'compte' ? 'active' : ''}`} onClick={() => setSelectedCategory('compte')}>
                Compte
              </button>
              <button
                className={`category-btn ${selectedCategory === 'calendrier' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('calendrier')}
              >
                Calendrier
              </button>
              <button
                className={`category-btn ${selectedCategory === 'technique' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('technique')}
              >
                Technique
              </button>
            </div>

            <div className="faq-list">
              {filteredFaqs.map((faq) => (
                <details key={faq.id} className="faq-item">
                  <summary className="faq-question">
                    <span>{faq.question}</span>
                    <ChevronRight size={20} className="faq-arrow" />
                  </summary>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                    <div className="faq-helpful">
                      <span>Cette reponse vous a-t-elle ete utile ?</span>
                      <div className="helpful-buttons">
                        <button className="helpful-btn">
                          <ThumbsUp size={14} />
                          {faq.helpful}
                        </button>
                        <button className="helpful-btn">
                          <ThumbsDown size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          {user.role === 'admin' && (
            <div className="tickets-section">
              <h2 className="section-title">Tickets de support recents</h2>
              <div className="tickets-list">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="ticket-item">
                    <div className="ticket-info">
                      <h4>{ticket.title}</h4>
                      <p>Cree le {new Date(ticket.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="ticket-status">
                      <span className={`status-badge ${ticket.status}`}>
                        {ticket.status === 'resolu' ? 'Resolu' : 'En cours'}
                      </span>
                      <span className={`priority-badge ${ticket.priority}`}>
                        {ticket.priority === 'haute' ? 'Haute' : 'Moyenne'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showTicketModal && (
            <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
              <div className="modal-content" onClick={(event) => event.stopPropagation()}>
                <div className="modal-header">
                  <h2>Support technique</h2>
                  <button className="modal-close" onClick={() => setShowTicketModal(false)}>
                    X
                  </button>
                </div>
                <div className="modal-body">
                  <p>Utilisez l'email ou le telephone affiches sur cette page pour ouvrir un ticket de support.</p>
                  <div className="help-actions">
                    <a href="mailto:support@est.um5.ac.ma" className="help-action-btn">
                      <Mail size={24} />
                      <div>
                        <h3>Email</h3>
                        <p>support@est.um5.ac.ma</p>
                      </div>
                    </a>
                    <button className="help-action-btn" onClick={() => navigate('/calendar')}>
                      <Calendar size={24} />
                      <div>
                        <h3>Voir votre planning</h3>
                        <p>Verifier rapidement vos prochaines dates importantes</p>
                      </div>
                    </button>
                    <button className="help-action-btn" onClick={() => navigate('/dashboard')}>
                      <HelpCircle size={24} />
                      <div>
                        <h3>Retour au tableau de bord</h3>
                        <p>Revenir aux acces rapides de la plateforme</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Help;
