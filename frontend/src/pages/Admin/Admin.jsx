// src/pages/Admin/Admin.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users,
  UserPlus,
  UserCog,
  UserX,
  Search,
  Bell,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Shield,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Upload,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Settings,
  LogOut,
  GraduationCap,
  School,
  Award
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import './Admin.css';

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    etudiants: 0,
    enseignants: 0,
    admins: 0
  });

  // Formulaire d'ajout d'utilisateur
  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'etudiant',
    filiere: '',
    niveau: '',
    telephone: '',
    dateNaissance: '',
    adresse: ''
  });

  // Formulaire d'édition
  const [editUser, setEditUser] = useState({
    id: '',
    nom: '',
    prenom: '',
    email: '',
    role: '',
    filiere: '',
    niveau: '',
    telephone: '',
    dateNaissance: '',
    adresse: '',
    status: 'actif'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    // Vérifier si l'utilisateur est admin
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = () => {
    setLoading(true);
    // Simulation de chargement des utilisateurs (à remplacer par appel API)
    setTimeout(() => {
      const mockUsers = [
        {
          id: 1,
          nom: 'Benali',
          prenom: 'Mohammed',
          email: 'mohammed.benali@est.um5.ac.ma',
          role: 'enseignant',
          filiere: 'Informatique',
          niveau: 'Doctorat',
          telephone: '+212 6 12 34 56 78',
          dateNaissance: '1985-03-15',
          adresse: 'Rabat, Maroc',
          status: 'actif',
          dateInscription: '2020-09-01',
          derniereConnexion: '2024-03-20 14:30',
          cours: ['Développement Web', 'Algorithmique'],
          avatar: null
        },
        {
          id: 2,
          nom: 'Alaoui',
          prenom: 'Fatima',
          email: 'fatima.alaoui@est.um5.ac.ma',
          role: 'enseignant',
          filiere: 'Réseaux',
          niveau: 'Doctorat',
          telephone: '+212 6 23 45 67 89',
          dateNaissance: '1988-07-22',
          adresse: 'Salé, Maroc',
          status: 'actif',
          dateInscription: '2019-10-15',
          derniereConnexion: '2024-03-19 09:15',
          cours: ['Réseaux', 'Sécurité'],
          avatar: null
        },
        {
          id: 3,
          nom: 'Idrissi',
          prenom: 'Ahmed',
          email: 'ahmed.idrissi@est.um5.ac.ma',
          role: 'enseignant',
          filiere: 'Bases de données',
          niveau: 'Doctorat',
          telephone: '+212 6 34 56 78 90',
          dateNaissance: '1982-11-30',
          adresse: 'Rabat, Maroc',
          status: 'actif',
          dateInscription: '2018-08-20',
          derniereConnexion: '2024-03-20 10:45',
          cours: ['SQL', 'NoSQL'],
          avatar: null
        },
        {
          id: 4,
          nom: 'Benjelloun',
          prenom: 'Sara',
          email: 'sara.benjelloun@est.um5.ac.ma',
          role: 'enseignant',
          filiere: 'IA',
          niveau: 'Doctorat',
          telephone: '+212 6 45 67 89 01',
          dateNaissance: '1990-05-10',
          adresse: 'Casablanca, Maroc',
          status: 'actif',
          dateInscription: '2021-01-10',
          derniereConnexion: '2024-03-18 16:20',
          cours: ['IA', 'Machine Learning'],
          avatar: null
        },
        {
          id: 5,
          nom: 'El Amrani',
          prenom: 'Hassan',
          email: 'hassan.elamrani@est.um5.ac.ma',
          role: 'enseignant',
          filiere: 'Sécurité',
          niveau: 'Doctorat',
          telephone: '+212 6 56 78 90 12',
          dateNaissance: '1983-09-05',
          adresse: 'Témara, Maroc',
          status: 'actif',
          dateInscription: '2017-09-12',
          derniereConnexion: '2024-03-19 11:30',
          cours: ['Cryptographie', 'Pentest'],
          avatar: null
        },
        {
          id: 6,
          nom: 'Tazi',
          prenom: 'Mohamed',
          email: 'mohamed.tazi@est.um5.ac.ma',
          role: 'enseignant',
          filiere: 'Management',
          niveau: 'Doctorat',
          telephone: '+212 6 67 89 01 23',
          dateNaissance: '1979-12-18',
          adresse: 'Rabat, Maroc',
          status: 'actif',
          dateInscription: '2015-08-25',
          derniereConnexion: '2024-03-20 08:45',
          cours: ['Gestion de projet', 'Agile'],
          avatar: null
        },
        {
          id: 7,
          nom: 'Amrani',
          prenom: 'Khadija',
          email: 'khadija.amrani@etu.um5.ac.ma',
          role: 'etudiant',
          filiere: 'Informatique',
          niveau: 'S5',
          telephone: '+212 6 78 90 12 34',
          dateNaissance: '2002-04-20',
          adresse: 'Salé, Maroc',
          status: 'actif',
          dateInscription: '2022-09-01',
          derniereConnexion: '2024-03-20 09:30',
          moyenne: 14.5,
          cours: ['Développement Web', 'Réseaux', 'BD'],
          avatar: null
        },
        {
          id: 8,
          nom: 'Berrada',
          prenom: 'Youssef',
          email: 'youssef.berrada@etu.um5.ac.ma',
          role: 'etudiant',
          filiere: 'Réseaux',
          niveau: 'S5',
          telephone: '+212 6 89 01 23 45',
          dateNaissance: '2001-11-12',
          adresse: 'Rabat, Maroc',
          status: 'actif',
          dateInscription: '2022-09-01',
          derniereConnexion: '2024-03-19 14:20',
          moyenne: 13.8,
          cours: ['Réseaux', 'Sécurité', 'TCP/IP'],
          avatar: null
        },
        {
          id: 9,
          nom: 'Chraibi',
          prenom: 'Leila',
          email: 'leila.chraibi@etu.um5.ac.ma',
          role: 'etudiant',
          filiere: 'IA',
          niveau: 'S6',
          telephone: '+212 6 90 12 34 56',
          dateNaissance: '2000-08-03',
          adresse: 'Casablanca, Maroc',
          status: 'actif',
          dateInscription: '2021-09-01',
          derniereConnexion: '2024-03-20 11:15',
          moyenne: 16.2,
          cours: ['IA', 'Machine Learning', 'Python'],
          avatar: null
        },
        {
          id: 10,
          nom: 'El Fassi',
          prenom: 'Omar',
          email: 'omar.elfassi@admin.um5.ac.ma',
          role: 'admin',
          filiere: 'Administration',
          niveau: 'Master',
          telephone: '+212 6 01 23 45 67',
          dateNaissance: '1975-06-25',
          adresse: 'Rabat, Maroc',
          status: 'actif',
          dateInscription: '2010-03-15',
          derniereConnexion: '2024-03-20 08:00',
          avatar: null
        }
      ];

      setUsers(mockUsers);
      
      // Calculer les statistiques
      const stats = {
        total: mockUsers.length,
        etudiants: mockUsers.filter(u => u.role === 'etudiant').length,
        enseignants: mockUsers.filter(u => u.role === 'enseignant').length,
        admins: mockUsers.filter(u => u.role === 'admin').length
      };
      setStats(stats);
      
      setLoading(false);
    }, 1000);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    // Simulation d'ajout (à remplacer par appel API)
    const newUserWithId = {
      ...newUser,
      id: users.length + 1,
      dateInscription: new Date().toISOString().split('T')[0],
      derniereConnexion: 'Jamais',
      status: 'actif'
    };

    setUsers([...users, newUserWithId]);
    
    // Mettre à jour les stats
    setStats({
      ...stats,
      total: stats.total + 1,
      [newUser.role === 'etudiant' ? 'etudiants' : 
       newUser.role === 'enseignant' ? 'enseignants' : 'admins']: 
        stats[newUser.role === 'etudiant' ? 'etudiants' : 
              newUser.role === 'enseignant' ? 'enseignants' : 'admins'] + 1
    });

    setShowAddModal(false);
    resetNewUserForm();
  };

  const handleEditUser = (e) => {
    e.preventDefault();
    // Simulation de modification
    const updatedUsers = users.map(u => 
      u.id === editUser.id ? { ...u, ...editUser } : u
    );
    setUsers(updatedUsers);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      const userToDelete = users.find(u => u.id === userId);
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      
      // Mettre à jour les stats
      setStats({
        ...stats,
        total: stats.total - 1,
        [userToDelete.role === 'etudiant' ? 'etudiants' : 
         userToDelete.role === 'enseignant' ? 'enseignants' : 'admins']: 
          stats[userToDelete.role === 'etudiant' ? 'etudiants' : 
                userToDelete.role === 'enseignant' ? 'enseignants' : 'admins'] - 1
      });
    }
  };

  const handleToggleStatus = (userId) => {
    const updatedUsers = users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'actif' ? 'inactif' : 'actif' }
        : u
    );
    setUsers(updatedUsers);
  };

  const resetNewUserForm = () => {
    setNewUser({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      role: 'etudiant',
      filiere: '',
      niveau: '',
      telephone: '',
      dateNaissance: '',
      adresse: ''
    });
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.filiere?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const getRoleIcon = () => {
    switch(user?.role) {
      case 'etudiant': return '👨‍🎓';
      case 'enseignant': return '👨‍🏫';
      case 'admin': return '👨‍💼';
      default: return '👤';
    }
  };

  const getRoleLabel = () => {
    switch(user?.role) {
      case 'etudiant': return 'Étudiant';
      case 'enseignant': return 'Enseignant';
      case 'admin': return 'Administrateur';
      default: return 'Utilisateur';
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
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un utilisateur..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="notif-btn">
              <Bell size={20} />
              <span className="notif-dot"></span>
            </button>

            <div className="user-menu">
              <div className="user-avatar">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-role">{getRoleLabel()}</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          {/* Header Section */}
          <div className="content-header">
            <div>
              <h1 className="page-title">Administration</h1>
              <p className="page-subtitle">
                {getRoleIcon()} {getRoleLabel()} • Gestion des utilisateurs
              </p>
            </div>
            <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
              <UserPlus size={18} />
              <span>Nouvel utilisateur</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-icon total">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total utilisateurs</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon etudiant">
                <GraduationCap size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.etudiants}</span>
                <span className="stat-label">Étudiants</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon enseignant">
                <School size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.enseignants}</span>
                <span className="stat-label">Enseignants</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon admin">
                <Shield size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.admins}</span>
                <span className="stat-label">Administrateurs</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="admin-filters">
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${selectedRole === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedRole('all')}
              >
                Tous
              </button>
              <button 
                className={`filter-tab ${selectedRole === 'etudiant' ? 'active' : ''}`}
                onClick={() => setSelectedRole('etudiant')}
              >
                Étudiants
              </button>
              <button 
                className={`filter-tab ${selectedRole === 'enseignant' ? 'active' : ''}`}
                onClick={() => setSelectedRole('enseignant')}
              >
                Enseignants
              </button>
              <button 
                className={`filter-tab ${selectedRole === 'admin' ? 'active' : ''}`}
                onClick={() => setSelectedRole('admin')}
              >
                Administrateurs
              </button>
            </div>

            <div className="filter-actions">
              <button className="filter-action-btn">
                <Download size={16} />
                Exporter
              </button>
              <button className="filter-action-btn">
                <RefreshCw size={16} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Chargement des utilisateurs...</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Rôle</th>
                    <th>Contact</th>
                    <th>Filière</th>
                    <th>Statut</th>
                    <th>Dernière connexion</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-sm">
                            {user.prenom.charAt(0)}{user.nom.charAt(0)}
                          </div>
                          <div className="user-info-sm">
                            <span className="user-name-sm">
                              {user.prenom} {user.nom}
                            </span>
                            <span className="user-email-sm">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role === 'etudiant' && '👨‍🎓 Étudiant'}
                          {user.role === 'enseignant' && '👨‍🏫 Enseignant'}
                          {user.role === 'admin' && '👨‍💼 Admin'}
                        </span>
                      </td>
                      <td>
                        <div className="contact-info">
                          <span>{user.telephone}</span>
                        </div>
                      </td>
                      <td>
                        <div className="filiere-info">
                          <span className="filiere">{user.filiere}</span>
                          <span className="niveau">{user.niveau}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status === 'actif' ? (
                            <><CheckCircle size={12} /> Actif</>
                          ) : (
                            <><XCircle size={12} /> Inactif</>
                          )}
                        </span>
                      </td>
                      <td>
                        <span className="last-login">{user.derniereConnexion}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn edit"
                            onClick={() => openEditModal(user)}
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="action-btn toggle"
                            onClick={() => handleToggleStatus(user.id)}
                            title={user.status === 'actif' ? 'Désactiver' : 'Activer'}
                          >
                            {user.status === 'actif' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal d'ajout d'utilisateur */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Ajouter un utilisateur</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={newUser.prenom}
                    onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={newUser.nom}
                    onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mot de passe *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rôle *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    required
                  >
                    <option value="etudiant">Étudiant</option>
                    <option value="enseignant">Enseignant</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={newUser.telephone}
                    onChange={(e) => setNewUser({...newUser, telephone: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Filière</label>
                  <input
                    type="text"
                    value={newUser.filiere}
                    onChange={(e) => setNewUser({...newUser, filiere: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Niveau</label>
                  <input
                    type="text"
                    value={newUser.niveau}
                    onChange={(e) => setNewUser({...newUser, niveau: e.target.value})}
                    placeholder="S5, Doctorat, ..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date de naissance</label>
                  <input
                    type="date"
                    value={newUser.dateNaissance}
                    onChange={(e) => setNewUser({...newUser, dateNaissance: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Adresse</label>
                  <input
                    type="text"
                    value={newUser.adresse}
                    onChange={(e) => setNewUser({...newUser, adresse: e.target.value})}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  <UserPlus size={16} />
                  Créer l'utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Modifier l'utilisateur</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    value={editUser.prenom}
                    onChange={(e) => setEditUser({...editUser, prenom: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    value={editUser.nom}
                    onChange={(e) => setEditUser({...editUser, nom: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rôle</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                    required
                  >
                    <option value="etudiant">Étudiant</option>
                    <option value="enseignant">Enseignant</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={editUser.telephone}
                    onChange={(e) => setEditUser({...editUser, telephone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select
                    value={editUser.status}
                    onChange={(e) => setEditUser({...editUser, status: e.target.value})}
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Filière</label>
                  <input
                    type="text"
                    value={editUser.filiere}
                    onChange={(e) => setEditUser({...editUser, filiere: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Niveau</label>
                  <input
                    type="text"
                    value={editUser.niveau}
                    onChange={(e) => setEditUser({...editUser, niveau: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date de naissance</label>
                  <input
                    type="date"
                    value={editUser.dateNaissance}
                    onChange={(e) => setEditUser({...editUser, dateNaissance: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Adresse</label>
                  <input
                    type="text"
                    value={editUser.adresse}
                    onChange={(e) => setEditUser({...editUser, adresse: e.target.value})}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  <UserCog size={16} />
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;