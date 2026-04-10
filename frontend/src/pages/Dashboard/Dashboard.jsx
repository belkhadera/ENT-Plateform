import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Grid,
  LogOut,
  PieChart,
  Search,
  Star,
  Upload,
  Users,
  Bookmark,
  MessageSquare,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'etudiant':
        return 'Etudiant';
      case 'enseignant':
        return 'Enseignant';
      case 'admin':
        return 'Administrateur';
      default:
        return 'Utilisateur';
    }
  };

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
              <input type="text" placeholder="Rechercher..." />
            </div>

            <button className="notif-btn">
              <Bell size={20} />
              <span className="notif-dot"></span>
            </button>

            <div className="user-menu">
              <div className="user-avatar">{user.username?.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-role">{getRoleLabel()}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="content-wrapper">
          <div className="content-header">
            <div>
              <h1 className="page-title">Tableau de bord</h1>
              <p className="page-subtitle">
                {getRoleLabel()} •{' '}
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
            <button className="logout-btn-header" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Deconnexion</span>
            </button>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-icon" style={{ background: '#e8f0fe', color: '#1967d2' }}>
                <BookOpen size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">6</span>
                <span className="stat-label">Cours actifs</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon" style={{ background: '#e6f4ea', color: '#137333' }}>
                <FileText size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">3</span>
                <span className="stat-label">Devoirs</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon" style={{ background: '#fef7e0', color: '#b45309' }}>
                <Clock size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">12</span>
                <span className="stat-label">Heures cette semaine</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                <Star size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">14.5</span>
                <span className="stat-label">Moyenne</span>
              </div>
            </div>
          </div>

          <div className="actions-section">
            <h2 className="section-title">Acces rapides</h2>

            <div className="cards-grid">
              {user.role === 'etudiant' && (
                <>
                  <div className="action-card" onClick={() => navigate('/courses')}>
                    <div className="card-icon" style={{ background: '#e8f0fe' }}>
                      <BookOpen size={24} color="#1967d2" />
                    </div>
                    <h3>Mes cours</h3>
                    <p>Acceder a tous vos cours et ressources</p>
                    <div className="card-footer">
                      <span>6 cours disponibles</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <div className="action-card" onClick={() => navigate('/downloads')}>
                    <div className="card-icon" style={{ background: '#e6f4ea' }}>
                      <Download size={24} color="#137333" />
                    </div>
                    <h3>Telechargements</h3>
                    <p>Documents et ressources pedagogiques</p>
                    <div className="card-footer">
                      <span>12 nouveaux</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <div className="action-card" onClick={() => navigate('/calendar')}>
                    <div className="card-icon" style={{ background: '#fef7e0' }}>
                      <Calendar size={24} color="#b45309" />
                    </div>
                    <h3>Calendrier</h3>
                    <p>Consultez vos cours, examens et deadlines</p>
                    <div className="card-footer">
                      <span>Planning hebdomadaire</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                  <div className="action-card" onClick={() => navigate('/chat')}>
                    <div className="card-icon" style={{ background: '#eef2ff' }}>
                      <MessageSquare size={24} color="#4f46e5" />
                    </div>
                    <h3>Assistant IA</h3>
                    <p>Posez vos questions sur la plateforme et vos cours</p>
                    <div className="card-footer">
                      <span>Chat intelligent</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </>
              )}

              {user.role === 'enseignant' && (
                <>
                  <div className="action-card" onClick={() => navigate('/upload')}>
                    <div className="card-icon" style={{ background: '#e8f0fe' }}>
                      <Upload size={24} color="#1967d2" />
                    </div>
                    <h3>Publier un cours</h3>
                    <p>Ajouter un nouveau cours pour vos etudiants</p>
                    <div className="card-footer">
                      <span>Nouveau</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <div className="action-card" onClick={() => navigate('/courses')}>
                    <div className="card-icon" style={{ background: '#e6f4ea' }}>
                      <BookOpen size={24} color="#137333" />
                    </div>
                    <h3>Gerer les cours</h3>
                    <p>Modifier vos cours existants</p>
                    <div className="card-footer">
                      <span>4 cours</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <div className="action-card" onClick={() => navigate('/calendar')}>
                    <div className="card-icon" style={{ background: '#fef7e0' }}>
                      <Calendar size={24} color="#b45309" />
                    </div>
                    <h3>Calendrier des cours</h3>
                    <p>Voir les seances, deadlines et examens</p>
                    <div className="card-footer">
                      <span>Vue planning</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                  <div className="action-card" onClick={() => navigate('/chat')}>
                    <div className="card-icon" style={{ background: '#eef2ff' }}>
                      <MessageSquare size={24} color="#4f46e5" />
                    </div>
                    <h3>Assistant IA</h3>
                    <p>Obtenez de l aide sur vos cours et le fonctionnement ENT</p>
                    <div className="card-footer">
                      <span>Chat intelligent</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <div className="action-card" onClick={() => navigate('/admin/users')}>
                    <div className="card-icon" style={{ background: '#e8f0fe' }}>
                      <Users size={24} color="#1967d2" />
                    </div>
                    <h3>Utilisateurs</h3>
                    <p>Gerer les comptes etudiants et enseignants</p>
                    <div className="card-footer">
                      <span>156 inscrits</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <div className="action-card" onClick={() => navigate('/courses')}>
                    <div className="card-icon" style={{ background: '#e6f4ea' }}>
                      <Grid size={24} color="#137333" />
                    </div>
                    <h3>Tous les cours</h3>
                    <p>Superviser l'ensemble des cours</p>
                    <div className="card-footer">
                      <span>24 cours</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <div className="action-card" onClick={() => navigate('/admin/stats')}>
                    <div className="card-icon" style={{ background: '#f3e8ff' }}>
                      <PieChart size={24} color="#7c3aed" />
                    </div>
                    <h3>Statistiques</h3>
                    <p>Analyser les donnees de la plateforme</p>
                    <div className="card-footer">
                      <span>Rapports</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="grid-card">
              <div className="grid-card-header">
                <h3>Emploi du temps</h3>
                <button className="view-all">Voir tout</button>
              </div>
              <div className="schedule-list">
                <div className="schedule-item">
                  <div className="schedule-time">09:00 - 11:00</div>
                  <div className="schedule-info">
                    <span className="schedule-course">Developpement Web</span>
                    <span className="schedule-location">Salle 203 • Pr. Benali</span>
                  </div>
                </div>
                <div className="schedule-item">
                  <div className="schedule-time">11:30 - 13:30</div>
                  <div className="schedule-info">
                    <span className="schedule-course">Base de donnees</span>
                    <span className="schedule-location">Salle 105 • Pr. Alaoui</span>
                  </div>
                </div>
                <div className="schedule-item">
                  <div className="schedule-time">14:00 - 16:00</div>
                  <div className="schedule-info">
                    <span className="schedule-course">Reseaux</span>
                    <span className="schedule-location">Labo 3 • Pr. Idrissi</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid-card">
              <div className="grid-card-header">
                <h3>Activite recente</h3>
                <button className="view-all">Voir tout</button>
              </div>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p className="activity-text">Nouveau cours disponible</p>
                    <p className="activity-time">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-dot" style={{ background: '#f97316' }}></div>
                  <div className="activity-content">
                    <p className="activity-text">Devoir a rendre: Projet React</p>
                    <p className="activity-time">Dans 3 jours</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-dot" style={{ background: '#22c55e' }}></div>
                  <div className="activity-content">
                    <p className="activity-text">Note publiee: Algorithmique</p>
                    <p className="activity-time">Il y a 1 jour</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid-card">
              <div className="grid-card-header">
                <h3>A venir</h3>
                <button className="view-all">Voir tout</button>
              </div>
              <div className="events-list">
                <div className="event-item">
                  <div className="event-date">
                    <span className="event-day">25</span>
                    <span className="event-month">MAR</span>
                  </div>
                  <div className="event-info">
                    <span className="event-title">Rendu projet Web</span>
                    <span className="event-desc">Dernier delai: 23:59</span>
                  </div>
                </div>
                <div className="event-item">
                  <div className="event-date">
                    <span className="event-day">28</span>
                    <span className="event-month">MAR</span>
                  </div>
                  <div className="event-info">
                    <span className="event-title">Examen Base de donnees</span>
                    <span className="event-desc">Salle 105 • 09:00</span>
                  </div>
                </div>
                <div className="event-item">
                  <div className="event-date">
                    <span className="event-day">30</span>
                    <span className="event-month">MAR</span>
                  </div>
                  <div className="event-info">
                    <span className="event-title">TP Reseaux</span>
                    <span className="event-desc">Labo 3 • 14:00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid-card">
              <div className="grid-card-header">
                <h3>Cours recents</h3>
                <button className="view-all">Voir tout</button>
              </div>
              <div className="favorites-list">
                <div className="favorite-item">
                  <Bookmark size={16} color="#1967d2" />
                  <span className="favorite-name">Developpement Web Avance</span>
                  <span className="favorite-progress">75%</span>
                </div>
                <div className="favorite-item">
                  <Bookmark size={16} color="#137333" />
                  <span className="favorite-name">Architecture des Reseaux</span>
                  <span className="favorite-progress">60%</span>
                </div>
                <div className="favorite-item">
                  <Bookmark size={16} color="#b45309" />
                  <span className="favorite-name">Intelligence Artificielle</span>
                  <span className="favorite-progress">45%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
