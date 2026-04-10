import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  FolderOpen,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Upload,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    switch (user?.role) {
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

  if (!user) {
    return null;
  }

  return (
    <aside className={`sidebar-white ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-white-header">
        <div className="sidebar-white-logo-container">
          <img src="/logo.png" alt="EST Sale" className="sidebar-white-logo" />
          {!collapsed && <span className="sidebar-white-brand">EST Sale</span>}
        </div>
        <button
          className="sidebar-white-toggle"
          onClick={() => setCollapsed((current) => !current)}
          title={collapsed ? 'Developper' : 'Reduire'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="sidebar-white-user">
        <div className="sidebar-white-avatar">{user.username?.charAt(0).toUpperCase()}</div>
        {!collapsed && (
          <div className="sidebar-white-user-info">
            <span className="sidebar-white-user-name">{user.username}</span>
            <span className="sidebar-white-user-role">{getRoleIcon()}</span>
          </div>
        )}
      </div>

      <nav className="sidebar-white-nav">
        <div className="sidebar-white-section">
          {!collapsed && <p className="sidebar-white-section-title">Accueil</p>}
          <button
            className={`sidebar-white-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
            title={collapsed ? 'Tableau de bord' : ''}
          >
            <Home size={18} />
            {!collapsed && <span>Tableau de bord</span>}
          </button>
        </div>

        {user.role === 'etudiant' && (
          <div className="sidebar-white-section">
            {!collapsed && <p className="sidebar-white-section-title">Etudiant</p>}
            <button
              className={`sidebar-white-item ${location.pathname === '/courses' ? 'active' : ''}`}
              onClick={() => navigate('/courses')}
              title={collapsed ? 'Mes cours' : ''}
            >
              <BookOpen size={18} />
              {!collapsed && <span>Mes cours</span>}
            </button>
            <button
              className={`sidebar-white-item ${location.pathname === '/downloads' ? 'active' : ''}`}
              onClick={() => navigate('/downloads')}
              title={collapsed ? 'Telechargements' : ''}
            >
              <Download size={18} />
              {!collapsed && <span>Telechargements</span>}
            </button>
          </div>
        )}

        {user.role === 'enseignant' && (
          <div className="sidebar-white-section">
            {!collapsed && <p className="sidebar-white-section-title">Enseignant</p>}
            <button
              className={`sidebar-white-item ${location.pathname === '/upload' ? 'active' : ''}`}
              onClick={() => navigate('/upload')}
              title={collapsed ? 'Ajouter un cours' : ''}
            >
              <Upload size={18} />
              {!collapsed && <span>Ajouter un cours</span>}
            </button>
            <button
              className={`sidebar-white-item ${location.pathname === '/courses' ? 'active' : ''}`}
              onClick={() => navigate('/courses')}
              title={collapsed ? 'Gerer les cours' : ''}
            >
              <BookOpen size={18} />
              {!collapsed && <span>Gerer les cours</span>}
            </button>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="sidebar-white-section">
            {!collapsed && <p className="sidebar-white-section-title">Administration</p>}
            <button
              className={`sidebar-white-item ${location.pathname === '/admin/users' ? 'active' : ''}`}
              onClick={() => navigate('/admin/users')}
              title={collapsed ? 'Utilisateurs' : ''}
            >
              <Users size={18} />
              {!collapsed && <span>Utilisateurs</span>}
            </button>
            <button
              className={`sidebar-white-item ${location.pathname === '/admin/resources' ? 'active' : ''}`}
              onClick={() => navigate('/admin/resources')}
              title={collapsed ? 'Ressources' : ''}
            >
              <FolderOpen size={18} />
              {!collapsed && <span>Ressources</span>}
            </button>
            <button
              className={`sidebar-white-item ${location.pathname === '/courses' ? 'active' : ''}`}
              onClick={() => navigate('/courses')}
              title={collapsed ? 'Tous les cours' : ''}
            >
              <BookOpen size={18} />
              {!collapsed && <span>Tous les cours</span>}
            </button>
          </div>
        )}

        <div className="sidebar-white-section">
          {!collapsed && <p className="sidebar-white-section-title">General</p>}
          <button
            className={`sidebar-white-item ${location.pathname === '/calendar' ? 'active' : ''}`}
            onClick={() => navigate('/calendar')}
            title={collapsed ? 'Calendrier' : ''}
          >
            <Calendar size={18} />
            {!collapsed && <span>Calendrier</span>}
          </button>
          <button
            className={`sidebar-white-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
            title={collapsed ? 'Parametres' : ''}
          >
            <Settings size={18} />
            {!collapsed && <span>Parametres</span>}
          </button>
          <button
            className={`sidebar-white-item ${location.pathname === '/help' ? 'active' : ''}`}
            onClick={() => navigate('/help')}
            title={collapsed ? 'Aide' : ''}
          >
            <HelpCircle size={18} />
            {!collapsed && <span>Aide</span>}
          </button>
          {(user.role === 'enseignant' || user.role === 'etudiant') && (
            <button
              className={`sidebar-white-item ${location.pathname === '/chat' ? 'active' : ''}`}
              onClick={() => navigate('/chat')}
              title={collapsed ? 'Chat IA' : ''}
            >
              <MessageSquare size={18} />
              {!collapsed && <span>Chat IA</span>}
            </button>
          )}
        </div>
      </nav>

      <div className="sidebar-white-footer">
        <button className="sidebar-white-item logout" onClick={handleLogout} title={collapsed ? 'Deconnexion' : ''}>
          <LogOut size={18} />
          {!collapsed && <span>Deconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
