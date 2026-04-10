import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Key,
  Lock,
  RefreshCw,
  Search,
  Trash2,
  Unlock,
  UserCog,
  UserPlus,
  Users as UsersIcon,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import {
  createUser as createUserRequest,
  deleteUser as deleteUserRequest,
  getApiErrorMessage,
  listUsers as listUsersRequest,
  resetUserPassword as resetUserPasswordRequest,
  updateUser as updateUserRequest,
} from '../../services/api';
import { normalizeRoleFromBackend, toBackendRole } from '../../utils/roles';
import './Users.css';

const formatDate = (timestamp) => {
  if (!timestamp) {
    return 'N/A';
  }

  return new Date(timestamp).toLocaleDateString('fr-FR');
};

const getRoleLabel = (role) => {
  switch (role) {
    case 'enseignant':
      return 'Enseignant';
    case 'admin':
      return 'Admin';
    case 'etudiant':
    default:
      return 'Etudiant';
  }
};

const mapApiUser = (apiUser) => ({
  id: apiUser.user_id,
  userId: apiUser.user_id,
  username: apiUser.username,
  nom: apiUser.last_name || '',
  prenom: apiUser.first_name || '',
  email: apiUser.email || '',
  role: normalizeRoleFromBackend(apiUser.roles || []),
  status: apiUser.enabled ? 'actif' : 'inactif',
  dateInscription: formatDate(apiUser.created_timestamp),
});

const initialNewUserState = {
  nom: '',
  prenom: '',
  email: '',
  password: '',
  role: 'etudiant',
  confirmPassword: '',
};

const initialEditUserState = {
  userId: '',
  username: '',
  nom: '',
  prenom: '',
  email: '',
  role: 'etudiant',
  status: 'actif',
};

const initialResetPasswordState = {
  newPassword: '',
  confirmPassword: '',
};

const Users = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState({ total: 0, actifs: 0, inactifs: 0 });

  const [newUser, setNewUser] = useState(initialNewUserState);
  const [editUserData, setEditUserData] = useState(initialEditUserState);
  const [resetPasswordData, setResetPasswordData] = useState(initialResetPasswordState);

  const updateStats = (items) => {
    setStats({
      total: items.length,
      actifs: items.filter((item) => item.status === 'actif').length,
      inactifs: items.filter((item) => item.status === 'inactif').length,
    });
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsersRequest();
      const mappedUsers = data.map(mapApiUser);
      setUsers(mappedUsers);
      updateStats(mappedUsers);
    } catch (error) {
      window.alert(getApiErrorMessage(error, 'Impossible de charger les utilisateurs.'));
      setUsers([]);
      updateStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadUsers();
  }, [user, navigate]);

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const fullName = `${item.nom} ${item.prenom}`.trim().toLowerCase();
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        fullName.includes(query) || item.email.toLowerCase().includes(query) || item.username.toLowerCase().includes(query);
      const matchesRole = selectedRole === 'all' || item.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const usersPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedStatus]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const resetNewUserForm = () => {
    setNewUser(initialNewUserState);
    setShowPassword(false);
  };

  const handleAddUser = async (event) => {
    event.preventDefault();

    if (newUser.password !== newUser.confirmPassword) {
      window.alert('Les mots de passe ne correspondent pas.');
      return;
    }

    const username = newUser.email.split('@')[0].trim().toLowerCase();
    if (!username) {
      window.alert("Impossible de deduire un nom d'utilisateur a partir de l'email.");
      return;
    }

    try {
      await createUserRequest({
        username,
        email: newUser.email,
        password: newUser.password,
        first_name: newUser.prenom,
        last_name: newUser.nom,
        roles: [toBackendRole(newUser.role)],
      });

      setShowAddModal(false);
      resetNewUserForm();
      await loadUsers();
    } catch (error) {
      window.alert(getApiErrorMessage(error, "Creation de l'utilisateur impossible."));
    }
  };

  const openEditModal = (userItem) => {
    setSelectedUser(userItem);
    setEditUserData({
      userId: userItem.userId,
      username: userItem.username,
      nom: userItem.nom,
      prenom: userItem.prenom,
      email: userItem.email,
      role: userItem.role,
      status: userItem.status,
    });
    setShowEditModal(true);
  };

  const handleEditUser = async (event) => {
    event.preventDefault();

    try {
      await updateUserRequest(editUserData.userId, {
        username: editUserData.username,
        email: editUserData.email,
        first_name: editUserData.prenom,
        last_name: editUserData.nom,
        enabled: editUserData.status === 'actif',
        roles: [toBackendRole(editUserData.role)],
      });

      setShowEditModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      window.alert(getApiErrorMessage(error, 'Mise a jour impossible.'));
    }
  };

  const openResetPasswordModal = (userItem) => {
    setSelectedUser(userItem);
    setResetPasswordData(initialResetPasswordState);
    setShowResetPasswordModal(true);
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      window.alert('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      await resetUserPasswordRequest(selectedUser.userId, resetPasswordData.newPassword);
      setShowResetPasswordModal(false);
      setSelectedUser(null);
      window.alert('Mot de passe reinitialise avec succes.');
    } catch (error) {
      window.alert(getApiErrorMessage(error, 'Reinitialisation impossible.'));
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUserRequest(userId);
      setShowDeleteConfirm(null);
      await loadUsers();
    } catch (error) {
      window.alert(getApiErrorMessage(error, 'Suppression impossible.'));
    }
  };

  const handleToggleStatus = async (userItem) => {
    try {
      await updateUserRequest(userItem.userId, {
        username: userItem.username,
        email: userItem.email,
        first_name: userItem.prenom,
        last_name: userItem.nom,
        enabled: userItem.status !== 'actif',
        roles: [toBackendRole(userItem.role)],
      });

      await loadUsers();
    } catch (error) {
      window.alert(getApiErrorMessage(error, 'Changement de statut impossible.'));
    }
  };

  if (!user || user.role !== 'admin') {
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
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <button className="notif-btn" type="button" onClick={loadUsers}>
              <RefreshCw size={20} />
            </button>

            <div className="user-menu">
              <div className="user-avatar">{user.username?.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-role">Administrateur</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="content-wrapper">
          <div className="content-header">
            <div>
              <h1 className="page-title">Gestion des utilisateurs</h1>
              <p className="page-subtitle">
                Administrateur - Gerer les comptes Keycloak, approuver les nouvelles inscriptions et piloter les roles ENT
              </p>
            </div>
            <button className="add-user-btn" onClick={() => setShowAddModal(true)} type="button">
              <UserPlus size={18} />
              <span>Ajouter un utilisateur</span>
            </button>
          </div>

          <div className="users-stats">
            <div className="stat-card">
              <div className="stat-icon total">
                <UsersIcon size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total utilisateurs</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon actif">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.actifs}</span>
                <span className="stat-label">Actifs</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon inactif">
                <XCircle size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.inactifs}</span>
                <span className="stat-label">Inactifs</span>
              </div>
            </div>
          </div>

          <div className="users-filters">
            <div className="filter-tabs">
              <button className={`filter-tab ${selectedRole === 'all' ? 'active' : ''}`} onClick={() => setSelectedRole('all')} type="button">
                Tous
              </button>
              <button
                className={`filter-tab ${selectedRole === 'etudiant' ? 'active' : ''}`}
                onClick={() => setSelectedRole('etudiant')}
                type="button"
              >
                Etudiants
              </button>
              <button
                className={`filter-tab ${selectedRole === 'enseignant' ? 'active' : ''}`}
                onClick={() => setSelectedRole('enseignant')}
                type="button"
              >
                Enseignants
              </button>
              <button className={`filter-tab ${selectedRole === 'admin' ? 'active' : ''}`} onClick={() => setSelectedRole('admin')} type="button">
                Administrateurs
              </button>
            </div>

            <div className="filter-actions">
              <div className="status-filter">
                <label htmlFor="status-filter">Statut</label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="actif">Actifs</option>
                  <option value="inactif">Inactifs</option>
                </select>
              </div>

              <button className="filter-action-btn" onClick={loadUsers} type="button">
                <RefreshCw size={16} />
                Actualiser
              </button>
            </div>
          </div>

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
                    <th>Email</th>
                    <th>Nom d'utilisateur</th>
                    <th>Role</th>
                    <th>Statut</th>
                    <th>Date d'inscription</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((userItem) => (
                    <tr key={userItem.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-sm">
                            {(userItem.prenom.charAt(0) || 'U').toUpperCase()}
                            {(userItem.nom.charAt(0) || 'N').toUpperCase()}
                          </div>
                          <div className="user-info-sm">
                            <span className="user-name-sm">
                              {[userItem.prenom, userItem.nom].filter(Boolean).join(' ') || userItem.username}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="user-email">{userItem.email}</span>
                      </td>
                      <td>
                        <span className="date-cell">{userItem.username}</span>
                      </td>
                      <td>
                        <span className={`role-badge ${userItem.role}`}>{getRoleLabel(userItem.role)}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${userItem.status}`}>
                          {userItem.status === 'actif' ? (
                            <>
                              <CheckCircle size={12} /> Actif
                            </>
                          ) : (
                            <>
                              <XCircle size={12} /> Inactif
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <span className="date-cell">{userItem.dateInscription}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit" onClick={() => openEditModal(userItem)} title="Modifier" type="button">
                            <UserCog size={16} />
                          </button>
                          <button
                            className="action-btn reset-password"
                            onClick={() => openResetPasswordModal(userItem)}
                            title="Reinitialiser le mot de passe"
                            type="button"
                          >
                            <Key size={16} />
                          </button>
                          <button
                            className="action-btn toggle"
                            onClick={() => handleToggleStatus(userItem)}
                            title={userItem.status === 'actif' ? 'Desactiver' : 'Activer et approuver'}
                            type="button"
                          >
                            {userItem.status === 'actif' ? <Lock size={16} /> : <Unlock size={16} />}
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => setShowDeleteConfirm(userItem.id)}
                            title="Supprimer"
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {showDeleteConfirm === userItem.id && (
                          <div className="delete-confirm">
                            <p>Confirmer la suppression ?</p>
                            <div className="confirm-actions">
                              <button className="confirm-yes" onClick={() => handleDeleteUser(userItem.userId)} type="button">
                                Oui
                              </button>
                              <button className="confirm-no" onClick={() => setShowDeleteConfirm(null)} type="button">
                                Non
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length > 0 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((previous) => Math.max(previous - 1, 1))}
                    disabled={currentPage === 1}
                    type="button"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(index + 1)}
                      type="button"
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((previous) => Math.min(previous + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    type="button"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Ajouter un utilisateur</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)} type="button">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Prenom *</label>
                  <input
                    type="text"
                    value={newUser.prenom}
                    onChange={(event) => setNewUser({ ...newUser, prenom: event.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={newUser.nom}
                    onChange={(event) => setNewUser({ ...newUser, nom: event.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mot de passe *</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newUser.password}
                      onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
                      required
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword((previous) => !previous)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirmer mot de passe *</label>
                  <input
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(event) => setNewUser({ ...newUser, confirmPassword: event.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value })} required>
                  <option value="etudiant">Etudiant</option>
                  <option value="enseignant">Enseignant</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  <UserPlus size={16} />
                  Creer l'utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Modifier l'utilisateur</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)} type="button">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Prenom</label>
                  <input
                    type="text"
                    value={editUserData.prenom}
                    onChange={(event) => setEditUserData({ ...editUserData, prenom: event.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    value={editUserData.nom}
                    onChange={(event) => setEditUserData({ ...editUserData, nom: event.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editUserData.email}
                  onChange={(event) => setEditUserData({ ...editUserData, email: event.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nom d'utilisateur</label>
                <input
                  type="text"
                  value={editUserData.username}
                  onChange={(event) => setEditUserData({ ...editUserData, username: event.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={editUserData.role}
                    onChange={(event) => setEditUserData({ ...editUserData, role: event.target.value })}
                    required
                  >
                    <option value="etudiant">Etudiant</option>
                    <option value="enseignant">Enseignant</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select
                    value={editUserData.status}
                    onChange={(event) => setEditUserData({ ...editUserData, status: event.target.value })}
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  <UserCog size={16} />
                  Mettre a jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetPasswordModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Reinitialiser mot de passe</h2>
              <button className="modal-close" onClick={() => setShowResetPasswordModal(false)} type="button">
                <XCircle size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p className="reset-info">
                Utilisateur :{' '}
                <strong>
                  {selectedUser.prenom} {selectedUser.nom}
                </strong>
                <br />
                Email : <strong>{selectedUser.email}</strong>
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="modal-form">
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={resetPasswordData.newPassword}
                  onChange={(event) => setResetPasswordData({ ...resetPasswordData, newPassword: event.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={resetPasswordData.confirmPassword}
                  onChange={(event) => setResetPasswordData({ ...resetPasswordData, confirmPassword: event.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowResetPasswordModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  <Key size={16} />
                  Reinitialiser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
