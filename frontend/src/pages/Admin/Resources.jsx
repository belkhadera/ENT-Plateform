// src/pages/Admin/Resources.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen,
  FileText,
  Download,
  Trash2,
  Edit2,
  Eye,
  Search,
  Bell,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  Clock,
  File,
  FolderOpen,
  AlertCircle,
  XCircle,
  CheckCircle,
  Filter,
  Grid,
  List,
  MoreVertical
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import './Resources.css';

const Resources = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [resourcesPerPage] = useState(9);
  const [stats, setStats] = useState({
    total: 0,
    pdf: 0,
    video: 0,
    autres: 0
  });

  // Vérification de l'authentification et du rôle admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadResources();
  }, [user, navigate]);

  const loadResources = () => {
    setLoading(true);
    // Simulation de chargement des ressources (à remplacer par appel API)
    setTimeout(() => {
      const mockResources = [
        {
          id: 1,
          titre: 'Introduction à React',
          description: 'Cours complet sur React.js, composants, hooks et bonnes pratiques',
          enseignant: 'Pr. Benali Mohammed',
          enseignantId: 1,
          dateAjout: '2024-03-15',
          dateModification: '2024-03-20',
          fichier: 'cours-react.pdf',
          taille: '2.5 MB',
          type: 'PDF',
          minioUrl: 'https://minio.est.um5.ac.ma/cours/react.pdf',
          auteur: 'Mohammed Benali',
          statut: 'publié',
          vues: 245,
          telechargements: 78,
          tags: ['React', 'JavaScript', 'Front-end'],
          image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 2,
          titre: 'Architecture des Réseaux',
          description: 'Cours sur les protocoles réseau, TCP/IP, routage et sécurité',
          enseignant: 'Pr. Alaoui Fatima',
          enseignantId: 2,
          dateAjout: '2024-03-10',
          dateModification: '2024-03-18',
          fichier: 'cours-reseaux.pdf',
          taille: '3.2 MB',
          type: 'PDF',
          minioUrl: 'https://minio.est.um5.ac.ma/cours/reseaux.pdf',
          auteur: 'Fatima Alaoui',
          statut: 'publié',
          vues: 189,
          telechargements: 56,
          tags: ['Réseaux', 'TCP/IP', 'Cisco'],
          image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 3,
          titre: 'Bases de Données Avancées',
          description: 'SQL avancé, optimisation des requêtes, NoSQL et MongoDB',
          enseignant: 'Pr. Idrissi Ahmed',
          enseignantId: 3,
          dateAjout: '2024-03-12',
          dateModification: '2024-03-19',
          fichier: 'cours-bd.pdf',
          taille: '4.1 MB',
          type: 'PDF',
          minioUrl: 'https://minio.est.um5.ac.ma/cours/bd.pdf',
          auteur: 'Ahmed Idrissi',
          statut: 'publié',
          vues: 312,
          telechargements: 134,
          tags: ['SQL', 'NoSQL', 'MongoDB'],
          image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 4,
          titre: 'Intelligence Artificielle',
          description: 'Introduction au machine learning et deep learning avec Python',
          enseignant: 'Pr. Benjelloun Sara',
          enseignantId: 4,
          dateAjout: '2024-03-18',
          dateModification: '2024-03-21',
          fichier: 'cours-ia.pdf',
          taille: '5.3 MB',
          type: 'PDF',
          minioUrl: 'https://minio.est.um5.ac.ma/cours/ia.pdf',
          auteur: 'Sara Benjelloun',
          statut: 'publié',
          vues: 178,
          telechargements: 67,
          tags: ['IA', 'Machine Learning', 'Python'],
          image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 5,
          titre: 'Sécurité des Systèmes',
          description: 'Cryptographie, sécurité réseau et tests d\'intrusion',
          enseignant: 'Pr. El Amrani Hassan',
          enseignantId: 5,
          dateAjout: '2024-03-05',
          dateModification: '2024-03-15',
          fichier: 'cours-securite.pdf',
          taille: '3.8 MB',
          type: 'PDF',
          minioUrl: 'https://minio.est.um5.ac.ma/cours/securite.pdf',
          auteur: 'Hassan El Amrani',
          statut: 'publié',
          vues: 156,
          telechargements: 45,
          tags: ['Sécurité', 'Cryptographie', 'Pentest'],
          image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 6,
          titre: 'Gestion de Projets IT',
          description: 'Méthodologies agiles, Scrum et gestion d\'équipes',
          enseignant: 'Pr. Tazi Mohamed',
          enseignantId: 6,
          dateAjout: '2024-03-01',
          dateModification: '2024-03-10',
          fichier: 'cours-gestion.pdf',
          taille: '2.1 MB',
          type: 'PDF',
          minioUrl: 'https://minio.est.um5.ac.ma/cours/gestion.pdf',
          auteur: 'Mohamed Tazi',
          statut: 'archivé',
          vues: 98,
          telechargements: 23,
          tags: ['Agile', 'Scrum', 'Management'],
          image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        }
      ];

      setResources(mockResources);
      
      // Calculer les statistiques
      const pdfCount = mockResources.filter(r => r.type === 'PDF').length;
      
      setStats({
        total: mockResources.length,
        pdf: pdfCount,
        video: 0,
        autres: mockResources.length - pdfCount
      });
      
      setLoading(false);
    }, 1000);
  };

  const handleViewResource = (resource) => {
    setSelectedResource(resource);
    setShowDetailsModal(true);
  };

  const handleDeleteResource = (resourceId) => {
    const resourceToDelete = resources.find(r => r.id === resourceId);
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le cours "${resourceToDelete.titre}" ?\n\nCette action supprimera définitivement :\n• Les métadonnées dans Cassandra\n• Le fichier dans MinIO`)) {
      // Simulation de suppression (à remplacer par appel API)
      const updatedResources = resources.filter(r => r.id !== resourceId);
      setResources(updatedResources);
      
      // Mettre à jour les stats
      const pdfCount = updatedResources.filter(r => r.type === 'PDF').length;
      
      setStats({
        total: updatedResources.length,
        pdf: pdfCount,
        video: 0,
        autres: updatedResources.length - pdfCount
      });
      
      setShowDeleteConfirm(null);
    }
  };

  const handleEditResource = (resourceId) => {
    // Rediriger vers la page d'édition du cours
    navigate(`/admin/resources/edit/${resourceId}`);
  };

  const handleDownloadResource = (resource) => {
    // Simulation de téléchargement
    window.open(resource.minioUrl, '_blank');
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.enseignant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'recent' && new Date(resource.dateAjout) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                         (selectedFilter === 'populaire' && resource.vues > 200) ||
                         (selectedFilter === 'archive' && resource.statut === 'archivé');
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastResource = currentPage * resourcesPerPage;
  const indexOfFirstResource = indexOfLastResource - resourcesPerPage;
  const currentResources = filteredResources.slice(indexOfFirstResource, indexOfLastResource);
  const totalPages = Math.ceil(filteredResources.length / resourcesPerPage);

  // Si pas d'utilisateur ou pas admin, ne rien afficher
  if (!user || user.role !== 'admin') {
    return null;
  }

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
                placeholder="Rechercher une ressource..." 
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
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.username || 'admin@test.com'}</span>
                <span className="user-role">Administrateur</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          {/* Header Section */}
          <div className="content-header">
            <div>
              <h1 className="page-title">Gestion des ressources</h1>
              <p className="page-subtitle">
                👨‍💼 Administrateur • Gérez les cours et fichiers pédagogiques
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="resources-stats">
            <div className="stat-card">
              <div className="stat-icon total">
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total ressources</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon pdf">
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.pdf}</span>
                <span className="stat-label">Documents PDF</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon size">
                <FolderOpen size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">24.5</span>
                <span className="stat-label">Taille totale (MB)</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="resources-filters">
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('all')}
              >
                Tous
              </button>
              <button 
                className={`filter-tab ${selectedFilter === 'recent' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('recent')}
              >
                Récents
              </button>
              <button 
                className={`filter-tab ${selectedFilter === 'populaire' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('populaire')}
              >
                Populaires
              </button>
              <button 
                className={`filter-tab ${selectedFilter === 'archive' ? 'active' : ''}`}
                onClick={() => setSelectedFilter('archive')}
              >
                Archivés
              </button>
            </div>

            <div className="filter-actions">
              <button className="view-toggle" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
              </button>
              <button className="filter-action-btn" onClick={loadResources}>
                <RefreshCw size={16} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Resources Grid/List */}
          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Chargement des ressources...</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="resources-grid">
                  {currentResources.map((resource) => (
                    <div key={resource.id} className="resource-card">
                      <div className="resource-image">
                        <img src={resource.image} alt={resource.titre} />
                        <div className="resource-type">{resource.type}</div>
                      </div>
                      
                      <div className="resource-content">
                        <h3 className="resource-title">{resource.titre}</h3>
                        <p className="resource-description">{resource.description}</p>
                        
                        <div className="resource-meta">
                          <div className="meta-item">
                            <User size={14} />
                            <span>{resource.enseignant}</span>
                          </div>
                          <div className="meta-item">
                            <Calendar size={14} />
                            <span>{new Date(resource.dateAjout).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="meta-item">
                            <File size={14} />
                            <span>{resource.taille}</span>
                          </div>
                        </div>

                        <div className="resource-tags">
                          {resource.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>

                        <div className="resource-footer">
                          <div className="resource-stats">
                            <span title="Vues">👁️ {resource.vues}</span>
                            <span title="Téléchargements">📥 {resource.telechargements}</span>
                          </div>
                          
                          <div className="resource-actions">
                            <button 
                              className="action-btn view"
                              onClick={() => handleViewResource(resource)}
                              title="Voir détails"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="action-btn edit"
                              onClick={() => handleEditResource(resource.id)}
                              title="Modifier"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="action-btn delete"
                              onClick={() => setShowDeleteConfirm(resource.id)}
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {showDeleteConfirm === resource.id && (
                          <div className="delete-confirm">
                            <p>Supprimer définitivement ?</p>
                            <div className="confirm-actions">
                              <button 
                                className="confirm-yes"
                                onClick={() => handleDeleteResource(resource.id)}
                              >
                                Oui
                              </button>
                              <button 
                                className="confirm-no"
                                onClick={() => setShowDeleteConfirm(null)}
                              >
                                Non
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="resources-list">
                  <table className="resources-table">
                    <thead>
                      <tr>
                        <th>Titre</th>
                        <th>Enseignant</th>
                        <th>Date</th>
                        <th>Taille</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentResources.map((resource) => (
                        <tr key={resource.id}>
                          <td>
                            <div className="resource-cell">
                              <FileText size={16} color="#0f2b4b" />
                              <span>{resource.titre}</span>
                            </div>
                          </td>
                          <td>{resource.enseignant}</td>
                          <td>{new Date(resource.dateAjout).toLocaleDateString('fr-FR')}</td>
                          <td>{resource.taille}</td>
                          <td>
                            <span className={`status-badge ${resource.statut}`}>
                              {resource.statut === 'publié' ? '✅ Publié' : '📦 Archivé'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-btn view"
                                onClick={() => handleViewResource(resource)}
                                title="Voir détails"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className="action-btn edit"
                                onClick={() => handleEditResource(resource.id)}
                                title="Modifier"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                className="action-btn delete"
                                onClick={() => setShowDeleteConfirm(resource.id)}
                                title="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            
                            {showDeleteConfirm === resource.id && (
                              <div className="delete-confirm">
                                <p>Supprimer ?</p>
                                <div className="confirm-actions">
                                  <button 
                                    className="confirm-yes"
                                    onClick={() => handleDeleteResource(resource.id)}
                                  >
                                    Oui
                                  </button>
                                  <button 
                                    className="confirm-no"
                                    onClick={() => setShowDeleteConfirm(null)}
                                  >
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
                </div>
              )}

              {/* Pagination */}
              {filteredResources.length > 0 && (
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
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal de détails */}
      {showDetailsModal && selectedResource && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h2>Détails de la ressource</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <XCircle size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="resource-details">
                <div className="details-header">
                  <h3>{selectedResource.titre}</h3>
                  <span className={`status-badge ${selectedResource.statut}`}>
                    {selectedResource.statut === 'publié' ? '✅ Publié' : '📦 Archivé'}
                  </span>
                </div>

                <div className="details-section">
                  <h4>Description</h4>
                  <p>{selectedResource.description}</p>
                </div>

                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Auteur</span>
                    <span className="detail-value">{selectedResource.auteur}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Enseignant</span>
                    <span className="detail-value">{selectedResource.enseignant}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date d'ajout</span>
                    <span className="detail-value">
                      {new Date(selectedResource.dateAjout).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Dernière modification</span>
                    <span className="detail-value">
                      {new Date(selectedResource.dateModification).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type de fichier</span>
                    <span className="detail-value">{selectedResource.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Taille</span>
                    <span className="detail-value">{selectedResource.taille}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Vues</span>
                    <span className="detail-value">{selectedResource.vues}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Téléchargements</span>
                    <span className="detail-value">{selectedResource.telechargements}</span>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Tags</h4>
                  <div className="tags-list">
                    {selectedResource.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="details-section">
                  <h4>Fichier</h4>
                  <div className="file-info">
                    <FileText size={24} color="#0f2b4b" />
                    <div className="file-details">
                      <span className="file-name">{selectedResource.fichier}</span>
                      <span className="file-size">{selectedResource.taille}</span>
                    </div>
                    <button 
                      className="download-btn"
                      onClick={() => handleDownloadResource(selectedResource)}
                    >
                      <Download size={16} />
                      Télécharger
                    </button>
                  </div>
                  <p className="minio-url">
                    <strong>MinIO URL :</strong> {selectedResource.minioUrl}
                  </p>
                </div>

                <div className="details-section">
                  <h4>Actions</h4>
                  <div className="action-buttons-large">
                    <button 
                      className="action-btn-large edit"
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleEditResource(selectedResource.id);
                      }}
                    >
                      <Edit2 size={16} />
                      Modifier le cours
                    </button>
                    <button 
                      className="action-btn-large delete"
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowDeleteConfirm(selectedResource.id);
                      }}
                    >
                      <Trash2 size={16} />
                      Supprimer le cours
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;