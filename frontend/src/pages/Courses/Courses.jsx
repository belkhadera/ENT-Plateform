import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  BookOpen,
  CalendarDays,
  Download,
  FileText,
  GraduationCap,
  Grid,
  List,
  Loader,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import {
  deleteCourse as deleteCourseRequest,
  downloadCourseFile,
  fetchCourses as fetchCoursesRequest,
  getApiErrorMessage,
} from '../../services/api';
import './Courses.css';

const fallbackCourseImages = [
  'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
];

const formatFileSize = (bytes) => {
  if (!bytes) {
    return '0 B';
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
};

const getRoleMeta = (role) => {
  switch (role) {
    case 'enseignant':
      return {
        label: 'Enseignant',
        icon: <GraduationCap size={14} />,
      };
    case 'admin':
      return {
        label: 'Administrateur',
        icon: <ShieldCheck size={14} />,
      };
    case 'etudiant':
    default:
      return {
        label: 'Etudiant',
        icon: <BookOpen size={14} />,
      };
  }
};

const mapCourse = (course, index) => {
  const createdAt = course.created_at ? new Date(course.created_at) : null;
  const extension = course.original_filename?.split('.').pop()?.toUpperCase() || 'FILE';
  const level =
    course.level ||
    (typeof course.semester === 'string' && /^S[1-6]$/i.test(course.semester)
      ? course.semester.toUpperCase()
      : createdAt && createdAt.getMonth() < 6
        ? 'S5'
        : 'S6');
  const subject = course.subject || 'Matiere generale';
  const isNew = createdAt ? Date.now() - createdAt.getTime() < 7 * 24 * 60 * 60 * 1000 : false;
  const backendTags = Array.isArray(course.tags) ? course.tags.filter(Boolean) : [];
  const mergedTags = [...new Set([subject, level, extension, ...backendTags])].slice(0, 6);

  return {
    id: course.course_id,
    title: course.title,
    description: course.description || 'Aucune description fournie pour ce cours.',
    professor: course.teacher_username || 'Enseignant',
    teacherUsername: course.teacher_username || '',
    level,
    levelLabel: `Semestre ${level.replace('S', '')}`,
    subject,
    fileSize: formatFileSize(course.file_size),
    fileType: extension,
    tags: mergedTags,
    image: course.cover_image_data_url || fallbackCourseImages[index % fallbackCourseImages.length],
    isNew,
    isFavorite: false,
    originalFilename: course.original_filename || `${course.title}.${extension.toLowerCase()}`,
    createdAtLabel: createdAt ? createdAt.toLocaleDateString('fr-FR') : 'N/A',
  };
};

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadProgress, setDownloadProgress] = useState({});
  const [deletingCourseId, setDeletingCourseId] = useState('');

  const roleMeta = useMemo(() => getRoleMeta(user?.role), [user?.role]);

  const availableSemesters = useMemo(() => {
    return [...new Set(courses.map((course) => course.level).filter(Boolean))].sort(
      (left, right) => Number.parseInt(left.replace('S', ''), 10) - Number.parseInt(right.replace('S', ''), 10)
    );
  }, [courses]);

  const stats = useMemo(() => {
    const total = courses.length;
    const newCount = courses.filter((course) => course.isNew).length;
    const semesterCount = availableSemesters.length;
    const ownedCount = courses.filter((course) => course.teacherUsername === user?.username).length;

    return {
      total,
      newCount,
      semesterCount,
      ownedCount,
    };
  }, [availableSemesters.length, courses, user?.username]);

  const loadCourses = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchCoursesRequest();
      const mappedCourses = data.map(mapCourse);
      const visibleCourses =
        user?.role === 'enseignant'
          ? mappedCourses.filter((course) => course.teacherUsername === user.username)
          : mappedCourses;
      setCourses(visibleCourses);
    } catch (loadError) {
      setCourses([]);
      setError(getApiErrorMessage(loadError, 'Impossible de charger les cours.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadCourses();
  }, [user, navigate]);

  const toggleFavorite = (courseId) => {
    setCourses((previous) =>
      previous.map((course) => (course.id === courseId ? { ...course, isFavorite: !course.isFavorite } : course))
    );
  };

  const handleDownload = async (courseId, fileName) => {
    setError('');
    setDownloadProgress((previous) => ({ ...previous, [courseId]: 5 }));

    try {
      const response = await downloadCourseFile(courseId, {
        onDownloadProgress: (event) => {
          if (!event.total) {
            return;
          }

          const percent = Math.min(100, Math.round((event.loaded * 100) / event.total));
          setDownloadProgress((previous) => ({ ...previous, [courseId]: percent }));
        },
      });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (downloadError) {
      setError(getApiErrorMessage(downloadError, 'Telechargement impossible.'));
    } finally {
      setTimeout(() => {
        setDownloadProgress((previous) => {
          const next = { ...previous };
          delete next[courseId];
          return next;
        });
      }, 500);
    }
  };

  const canDeleteCourse = (course) => {
    if (!user) {
      return false;
    }

    return user.role === 'admin' || (user.role === 'enseignant' && course.teacherUsername === user.username);
  };

  const handleDeleteCourse = async (course) => {
    if (!canDeleteCourse(course)) {
      return;
    }

    if (!window.confirm(`Supprimer le cours "${course.title}" ?`)) {
      return;
    }

    setError('');
    setDeletingCourseId(course.id);

    try {
      await deleteCourseRequest(course.id);
      await loadCourses();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'Suppression du cours impossible.'));
    } finally {
      setDeletingCourseId('');
    }
  };

  const filteredCourses = courses.filter((course) => {
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch =
      course.title.toLowerCase().includes(normalizedSearch) ||
      course.description.toLowerCase().includes(normalizedSearch) ||
      course.professor.toLowerCase().includes(normalizedSearch) ||
      course.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'new' && course.isNew) ||
      (selectedCategory === 'favorites' && course.isFavorite) ||
      selectedCategory === course.level;

    return matchesSearch && matchesCategory;
  });

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
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <button className="notif-btn" type="button">
              <Bell size={20} />
              <span className="notif-dot"></span>
            </button>

            <div className="user-menu">
              <div className="user-avatar">{user.username?.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-role">{roleMeta.label}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="content-wrapper">
          <div className="content-header">
            <div>
              <h1 className="page-title">Cours disponibles</h1>
              <div className="courses-subtitle-row">
                <span className="role-chip">
                  {roleMeta.icon}
                  {roleMeta.label}
                </span>
                <span className="page-subtitle">{filteredCourses.length} cours visibles apres filtrage</span>
              </div>
            </div>

            <div className="view-options">
              <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} type="button">
                <Grid size={18} />
              </button>
              <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} type="button">
                <List size={18} />
              </button>
            </div>
          </div>

          <div className="courses-insights">
            <div className="insight-card">
              <div className="insight-icon blue">
                <BookOpen size={18} />
              </div>
              <div className="insight-copy">
                <span className="insight-value">{stats.total}</span>
                <span className="insight-label">Cours disponibles</span>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon gold">
                <Sparkles size={18} />
              </div>
              <div className="insight-copy">
                <span className="insight-value">{stats.newCount}</span>
                <span className="insight-label">Nouveautes</span>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon teal">
                <CalendarDays size={18} />
              </div>
              <div className="insight-copy">
                <span className="insight-value">{stats.semesterCount}</span>
                <span className="insight-label">Semestres presents</span>
              </div>
            </div>
            {(user.role === 'enseignant' || user.role === 'admin') && (
              <div className="insight-card">
                <div className="insight-icon rose">
                  <GraduationCap size={18} />
                </div>
                <div className="insight-copy">
                  <span className="insight-value">{stats.ownedCount}</span>
                  <span className="insight-label">Cours que vous gerez</span>
                </div>
              </div>
            )}
          </div>

          <div className="filters-section">
            <div className="filter-tabs">
              <button className={`filter-tab ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedCategory('all')} type="button">
                Tous les cours
              </button>
              <button className={`filter-tab ${selectedCategory === 'new' ? 'active' : ''}`} onClick={() => setSelectedCategory('new')} type="button">
                Nouveautes
              </button>
              <button
                className={`filter-tab ${selectedCategory === 'favorites' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('favorites')}
                type="button"
              >
                Favoris
              </button>
              {availableSemesters.map((semester) => (
                <button
                  key={semester}
                  className={`filter-tab ${selectedCategory === semester ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(semester)}
                  type="button"
                >
                  Semestre {semester.replace('S', '')}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Chargement des cours...</p>
            </div>
          )}

          {!loading && filteredCourses.length > 0 && (
            <div className={viewMode === 'grid' ? 'courses-grid' : 'courses-list'}>
              {filteredCourses.map((course) => (
                <div key={course.id} className={`course-card ${viewMode}`}>
                  {viewMode === 'grid' ? (
                    <>
                      <div className="course-image">
                        <img src={course.image} alt={course.title} />
                        <div className="course-image-overlay"></div>
                        <div className="course-image-top">
                          {course.isNew && (
                            <span className="course-badge new">
                              <Sparkles size={12} />
                              Nouveau
                            </span>
                          )}
                          <button className={`favorite-btn ${course.isFavorite ? 'active' : ''}`} onClick={() => toggleFavorite(course.id)} type="button">
                            <Star size={16} fill={course.isFavorite ? '#fbbf24' : 'none'} />
                          </button>
                        </div>
                        <div className="course-image-bottom">
                          <span className="course-semester-chip">
                            <CalendarDays size={12} />
                            {course.levelLabel}
                          </span>
                          <span className="course-format-chip">{course.fileType}</span>
                        </div>
                      </div>

                      <div className="course-content">
                        <div className="course-header-block">
                          <h3 className="course-title">{course.title}</h3>
                          <div className="course-owner-row">
                            <span className="owner-chip">
                              <User size={12} />
                              {course.professor}
                            </span>
                            {canDeleteCourse(course) && <span className="ownership-chip">Votre cours</span>}
                          </div>
                        </div>

                        <p className="course-description">{course.description}</p>

                        <div className="course-meta-grid">
                          <div className="meta-panel">
                            <FileText size={14} />
                            <div>
                              <span className="meta-label">Taille</span>
                              <strong>{course.fileSize}</strong>
                            </div>
                          </div>
                          <div className="meta-panel">
                            <CalendarDays size={14} />
                            <div>
                              <span className="meta-label">Matiere</span>
                              <strong>{course.subject}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="course-tags">
                          {course.tags.map((tag) => (
                            <span key={`${course.id}-${tag}`} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="course-footer">
                          <div className="file-info">
                            <FileText size={14} />
                            <span>Document {course.fileType}</span>
                          </div>
                          <div className="course-actions">
                            {canDeleteCourse(course) && (
                              <button
                                className="danger-btn"
                                onClick={() => handleDeleteCourse(course)}
                                disabled={deletingCourseId === course.id || downloadProgress[course.id] !== undefined}
                                title="Supprimer ce cours"
                                type="button"
                              >
                                {deletingCourseId === course.id ? <Loader size={16} className="spinner" /> : <Trash2 size={16} />}
                                <span>Supprimer</span>
                              </button>
                            )}
                            <button
                              className="download-btn"
                              onClick={() => handleDownload(course.id, course.originalFilename)}
                              disabled={downloadProgress[course.id] !== undefined || deletingCourseId === course.id}
                              type="button"
                            >
                              {downloadProgress[course.id] !== undefined ? (
                                <>
                                  <span className="progress-text">{downloadProgress[course.id]}%</span>
                                  <div className="download-progress"></div>
                                </>
                              ) : (
                                <>
                                  <Download size={16} />
                                  <span>Telecharger</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="course-list-item">
                      <div className="list-item-image">
                        <img src={course.image} alt={course.title} />
                        {course.isNew && (
                          <span className="list-new-badge">
                            <Sparkles size={12} />
                            Nouveau
                          </span>
                        )}
                      </div>

                      <div className="list-item-content">
                        <div className="list-item-header">
                          <div>
                            <div className="list-title-row">
                              <h3 className="list-item-title">{course.title}</h3>
                              <span className="course-level">{course.levelLabel}</span>
                            </div>
                            <p className="list-item-professor">
                              <User size={13} />
                              {course.professor}
                            </p>
                          </div>
                          <button className={`list-favorite-btn ${course.isFavorite ? 'active' : ''}`} onClick={() => toggleFavorite(course.id)} type="button">
                            <Star size={16} fill={course.isFavorite ? '#fbbf24' : 'none'} />
                          </button>
                        </div>

                        <p className="list-item-description">{course.description}</p>

                        <div className="list-item-meta">
                          <span className="meta-badge">
                            <FileText size={14} />
                            {course.fileSize}
                          </span>
                          <span className="meta-badge">
                            <BookOpen size={14} />
                            {course.subject}
                          </span>
                          <span className="meta-badge">
                            <CalendarDays size={14} />
                            {course.createdAtLabel}
                          </span>
                        </div>

                        <div className="list-item-tags">
                          {course.tags.map((tag) => (
                            <span key={`${course.id}-list-${tag}`} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="list-item-footer">
                          <div className="list-item-progress">
                            <span>{canDeleteCourse(course) ? 'Vous pouvez gerer ce cours' : 'Cours en lecture et telechargement'}</span>
                          </div>
                          <div className="list-item-actions">
                            {canDeleteCourse(course) && (
                              <button
                                className="danger-btn-list"
                                onClick={() => handleDeleteCourse(course)}
                                disabled={deletingCourseId === course.id || downloadProgress[course.id] !== undefined}
                                type="button"
                              >
                                {deletingCourseId === course.id ? <Loader size={16} className="spinner" /> : <Trash2 size={16} />}
                                Supprimer
                              </button>
                            )}
                            <button
                              className="download-btn-list"
                              onClick={() => handleDownload(course.id, course.originalFilename)}
                              disabled={downloadProgress[course.id] !== undefined || deletingCourseId === course.id}
                              type="button"
                            >
                              <Download size={16} />
                              Telecharger
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && filteredCourses.length === 0 && (
            <div className="empty-state">
              <BookOpen size={48} color="#9ca3af" />
              <h3>Aucun cours trouve</h3>
              <p>Les cours publies par les enseignants apparaitront ici.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Courses;
