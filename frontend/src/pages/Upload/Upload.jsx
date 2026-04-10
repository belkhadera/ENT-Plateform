import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  BookOpen,
  CheckCircle,
  Clock3,
  File,
  FileImage,
  FileText,
  Loader,
  Search,
  Tag,
  Trash2,
  Upload as UploadIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { createCourse, deleteCourse as deleteCourseRequest, fetchCourses, getApiErrorMessage } from '../../services/api';
import './Upload.css';

const levelOptions = [
  { value: 'S1', label: 'Semestre 1' },
  { value: 'S2', label: 'Semestre 2' },
  { value: 'S3', label: 'Semestre 3' },
  { value: 'S4', label: 'Semestre 4' },
  { value: 'S5', label: 'Semestre 5' },
  { value: 'S6', label: 'Semestre 6' },
];
const maxCourseFileSize = 10 * 1024 * 1024;
const maxCoverImageSize = 5 * 1024 * 1024;
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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

const getCourseLevel = (course) => {
  if (course.level) {
    return course.level;
  }

  if (typeof course.semester === 'string' && /^S[1-6]$/i.test(course.semester)) {
    return course.semester.toUpperCase();
  }

  return 'S1';
};

const buildRecentUploads = (courses, currentUser) => {
  return courses
    .filter((course) => currentUser.role === 'admin' || course.teacher_username === currentUser.username)
    .sort((left, right) => {
      const leftDate = left.created_at ? new Date(left.created_at).getTime() : 0;
      const rightDate = right.created_at ? new Date(right.created_at).getTime() : 0;
      return rightDate - leftDate;
    })
    .slice(0, 8)
    .map((course) => ({
      id: course.course_id,
      title: course.title,
      date: course.created_at ? new Date(course.created_at).toLocaleDateString('fr-FR') : 'N/A',
      size: formatFileSize(course.file_size),
      semester: getCourseLevel(course),
      subject: course.subject || 'Matiere generale',
      teacherUsername: course.teacher_username || '',
      coverImageDataUrl: course.cover_image_data_url || '',
    }));
};

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [semester, setSemester] = useState('S5');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverImageName, setCoverImageName] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [recentUploads, setRecentUploads] = useState([]);
  const [deletingCourseId, setDeletingCourseId] = useState('');

  const visibleCoursesCount = useMemo(() => recentUploads.length, [recentUploads]);
  const visibleSemesters = useMemo(() => new Set(recentUploads.map((course) => course.semester)).size, [recentUploads]);
  const visibleSubjects = useMemo(() => new Set(recentUploads.map((course) => course.subject)).size, [recentUploads]);

  const loadRecentUploads = async () => {
    if (!user) {
      return;
    }

    try {
      const courses = await fetchCourses();
      setRecentUploads(buildRecentUploads(courses, user));
    } catch {
      setRecentUploads([]);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'enseignant' && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadRecentUploads();
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      if (coverImagePreview && coverImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      setUploadError('Seuls les fichiers PDF sont acceptes.');
      return;
    }

    if (selectedFile.size > maxCourseFileSize) {
      setUploadError('Le fichier du cours ne doit pas depasser 10 MB.');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(formatFileSize(selectedFile.size));
    setUploadError('');
  };

  const handleCoverImageChange = (event) => {
    const selectedImage = event.target.files?.[0];
    if (!selectedImage) {
      return;
    }

    if (!allowedImageTypes.includes(selectedImage.type)) {
      setUploadError('L image de couverture doit etre en JPG, PNG, GIF ou WEBP.');
      return;
    }

    if (selectedImage.size > maxCoverImageSize) {
      setUploadError('L image de couverture ne doit pas depasser 5 MB.');
      return;
    }

    if (coverImagePreview && coverImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverImagePreview);
    }

    setCoverImage(selectedImage);
    setCoverImageName(selectedImage.name);
    setCoverImagePreview(URL.createObjectURL(selectedImage));
    setUploadError('');
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName('');
    setFileSize('');
    const input = document.getElementById('file-input');
    if (input) {
      input.value = '';
    }
  };

  const handleRemoveCoverImage = () => {
    if (coverImagePreview && coverImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverImagePreview);
    }

    setCoverImage(null);
    setCoverImageName('');
    setCoverImagePreview('');
    const input = document.getElementById('cover-image-input');
    if (input) {
      input.value = '';
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSemester('S5');
    setSubject('');
    handleRemoveFile();
    handleRemoveCoverImage();
    setUploadProgress(0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploadError('');
    setUploadSuccess(false);

    if (!title.trim()) {
      setUploadError('Le titre est requis.');
      return;
    }

    if (!description.trim()) {
      setUploadError('La description est requise.');
      return;
    }

    if (!subject.trim()) {
      setUploadError('La matiere est requise.');
      return;
    }

    if (!file) {
      setUploadError('Veuillez selectionner un fichier PDF.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('level', semester);
    formData.append('subject', subject.trim());
    formData.append('file', file);
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      await createCourse(formData, {
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            return;
          }

          const percent = Math.min(100, Math.round((progressEvent.loaded * 100) / progressEvent.total));
          setUploadProgress(percent);
        },
      });

      setUploadSuccess(true);
      resetForm();
      await loadRecentUploads();
    } catch (error) {
      setUploadError(getApiErrorMessage(error, 'Erreur lors de la publication du cours.'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Supprimer le cours \"${courseTitle}\" ?`)) {
      return;
    }

    setUploadError('');
    setUploadSuccess(false);
    setDeletingCourseId(courseId);

    try {
      await deleteCourseRequest(courseId);
      await loadRecentUploads();
    } catch (error) {
      setUploadError(getApiErrorMessage(error, 'Suppression du cours impossible.'));
    } finally {
      setDeletingCourseId('');
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
              <input type="text" placeholder="Rechercher..." />
            </div>

            <button className="notif-btn" type="button">
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
              <h1 className="page-title">Ajouter un cours</h1>
              <p className="page-subtitle">Publier un nouveau cours avec ses metadonnees completes pour vos etudiants.</p>
            </div>
          </div>

          <div className="upload-container">
            <section className="upload-form-card upload-reference-card">
              <div className="upload-form-shell">
                <form onSubmit={handleSubmit} className="upload-form upload-form-reference">
                  <div className="form-group">
                    <label htmlFor="title" className="form-label">
                      Titre du cours <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      className="form-input"
                      placeholder="Ex: Introduction a l Intelligence Artificielle"
                      disabled={uploading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description" className="form-label">
                      Description <span className="required">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className="form-textarea"
                      rows="4"
                      placeholder="Decrivez le contenu de votre cours..."
                      disabled={uploading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="semester" className="form-label">
                      Semestre <span className="required">*</span>
                    </label>
                    <div className="plain-select-shell">
                      <select
                        id="semester"
                        value={semester}
                        onChange={(event) => setSemester(event.target.value)}
                        className="form-select"
                        disabled={uploading}
                      >
                        {levelOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject" className="form-label">
                      Matiere <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      className="form-input"
                      placeholder="Ex: Mathematiques, Physique, Informatique..."
                      disabled={uploading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Image du cours (optionnel)</label>
                    {!coverImage ? (
                      <div className="upload-dropzone">
                        <input
                          type="file"
                          id="cover-image-input"
                          accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleCoverImageChange}
                          className="file-input"
                          disabled={uploading}
                        />
                        <label htmlFor="cover-image-input" className="upload-dropzone-label">
                          <FileImage size={20} />
                          <div className="upload-dropzone-copy">
                            <p className="upload-dropzone-title">Cliquez pour selectionner une image</p>
                            <p className="upload-dropzone-hint">JPEG, PNG, GIF, WEBP (max. 5 MB)</p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="upload-cover-preview">
                        <img src={coverImagePreview} alt="Couverture du cours" className="upload-cover-image" />
                        <div className="upload-cover-info">
                          <span className="upload-file-name">{coverImageName}</span>
                          <span className="upload-file-size">Couverture du cours</span>
                        </div>
                        <button type="button" className="upload-file-remove" onClick={handleRemoveCoverImage} disabled={uploading}>
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Fichier PDF <span className="required">*</span>
                    </label>

                    {!file ? (
                      <div className="upload-dropzone upload-dropzone-pdf">
                        <input
                          type="file"
                          id="file-input"
                          accept=".pdf,application/pdf"
                          onChange={handleFileChange}
                          className="file-input"
                          disabled={uploading}
                        />
                        <label htmlFor="file-input" className="upload-dropzone-label">
                          <UploadIcon size={20} />
                          <div className="upload-dropzone-copy">
                            <p className="upload-dropzone-title">Cliquez pour selectionner un fichier</p>
                            <p className="upload-dropzone-hint">PDF uniquement (max. 10 MB)</p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="upload-file-preview">
                        <div className="upload-file-info">
                          <File size={24} color="#0f2b4b" />
                          <div className="upload-file-details">
                            <span className="upload-file-name">{fileName}</span>
                            <span className="upload-file-size">{fileSize}</span>
                          </div>
                        </div>
                        <button type="button" className="upload-file-remove" onClick={handleRemoveFile} disabled={uploading}>
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {uploading && (
                    <div className="progress-container">
                      <div className="progress-header">
                        <span className="progress-label">Upload en cours...</span>
                        <span className="progress-percentage">{uploadProgress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="success-message">
                      <CheckCircle size={20} />
                      <span>Cours ajoute avec succes.</span>
                    </div>
                  )}

                  {uploadError && (
                    <div className="error-message">
                      <AlertCircle size={20} />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div className="form-actions form-actions-reference">
                    <button type="button" className="cancel-btn" onClick={() => navigate('/dashboard')} disabled={uploading}>
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={uploading || !title.trim() || !description.trim() || !subject.trim() || !file}
                    >
                      {uploading ? (
                        <>
                          <Loader size={18} className="spinner" />
                          <span>Publication...</span>
                        </>
                      ) : (
                        <>
                          <UploadIcon size={18} />
                          <span>Publier le cours</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            <div className="upload-secondary-grid">
              <section className="recent-uploads-card">
                <div className="secondary-card-header">
                  <h3>Derniers cours ajoutes</h3>
                  <span>{visibleCoursesCount} visible(s)</span>
                </div>
                <div className="recent-uploads-list">
                  {recentUploads.length === 0 && <p className="empty-inline">Aucun cours publie pour le moment.</p>}
                  {recentUploads.map((item) => (
                    <div key={item.id} className="recent-upload-item">
                      <div className="recent-upload-cover">
                        {item.coverImageDataUrl ? (
                          <img src={item.coverImageDataUrl} alt={item.title} className="recent-upload-cover-image" />
                        ) : (
                          <FileText size={16} color="#0f2b4b" />
                        )}
                      </div>
                      <div className="recent-upload-info">
                        <div className="recent-upload-header">
                          <span className="recent-upload-title">{item.title}</span>
                          <div className="recent-upload-badges">
                            <span className="recent-upload-badge">{item.semester}</span>
                          </div>
                        </div>
                        <span className="recent-upload-meta">{item.subject}</span>
                        <span className="recent-upload-meta">
                          {item.date} - {item.size}
                        </span>
                        {user.role === 'admin' && item.teacherUsername && (
                          <span className="recent-upload-meta">Enseignant: {item.teacherUsername}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="delete-upload-btn"
                        onClick={() => handleDeleteCourse(item.id, item.title)}
                        disabled={uploading || deletingCourseId === item.id}
                        title="Supprimer ce cours"
                      >
                        {deletingCourseId === item.id ? <Loader size={14} className="spinner" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <div className="upload-side-stack">
                <section className="info-card">
                  <div className="secondary-card-header">
                    <h3>Bonnes pratiques</h3>
                  </div>
                  <ul className="info-list">
                    <li>
                      <BookOpen size={16} />
                      <span>Associez chaque cours a un semestre precis pour que les etudiants retrouvent vite le contenu.</span>
                    </li>
                    <li>
                      <FileText size={16} />
                      <span>Ajoutez une description concise pour aider les etudiants a comprendre le contenu.</span>
                    </li>
                    <li>
                      <Tag size={16} />
                      <span>Renseignez bien la matiere pour garder un catalogue de cours clair.</span>
                    </li>
                    <li>
                      <Clock3 size={16} />
                      <span>Formats acceptes: PDF pour le cours, image optionnelle jusqu a 5 MB.</span>
                    </li>
                  </ul>
                </section>

                <section className="stats-mini-card">
                  <div className="secondary-card-header">
                    <h3>Resume</h3>
                  </div>
                  <div className="stat-mini-item">
                    <span className="stat-mini-label">Cours visibles</span>
                    <span className="stat-mini-value">{visibleCoursesCount}</span>
                  </div>
                  <div className="stat-mini-item">
                    <span className="stat-mini-label">Semestres presents</span>
                    <span className="stat-mini-value">{visibleSemesters}</span>
                  </div>
                  <div className="stat-mini-item">
                    <span className="stat-mini-label">Matieres presentes</span>
                    <span className="stat-mini-value">{visibleSubjects}</span>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
