const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');

// Ensure uploads directory exists
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log('✅ Created uploads directory:', uploadPath);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    // Sanitize filename
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

/**
 * @desc    Upload file
 * @route   POST /api/files/upload
 * @access  Private
 */
const uploadFile = async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('User:', req.user?.id);
    console.log('File:', req.file);
    console.log('Body:', req.body);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier téléchargé'
      });
    }

    // Create file URL - adjust based on your server setup
    const fileUrl = `/uploads/${req.file.filename}`;

    // Create file record in database
    // Préparez l'objet de fichier
    const fileData = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id,
      url: fileUrl
    };

    // N'ajoutez courseId que s'il est valide et non vide
    if (req.body.courseId && req.body.courseId !== 'null' && req.body.courseId !== '') {
      fileData.courseId = req.body.courseId;
    }

    const file = await File.create(fileData);

    console.log('✅ File saved to database:', file._id);

    res.status(201).json({
      success: true,
      data: {
        _id: file._id,
        originalName: file.originalName,
        filename: file.filename,
        url: file.url,
        mimetype: file.mimetype,
        size: file.size
      },
      message: 'Fichier téléchargé avec succès'
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Delete file if database operation failed
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Cleaned up file after error');
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du fichier',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * @desc    Get file by ID
 * @route   GET /api/files/:id
 * @access  Private
 */
const getFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      // .populate('uploadedBy', 'firstName lastName email');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du fichier',
      error: error.message
    });
  }
};

/**
 * @desc    Get all files for a course
 * @route   GET /api/files/course/:courseId
 * @access  Private
 */
// const getCourseFiles = async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     // Vérification de validité de l'ID
//     if (!mongoose.Types.ObjectId.isValid(courseId)) {
//       return res.status(400).json({ success: false, message: 'ID de cours invalide' });
//     }

//     const files = await File.find({ courseId: courseId })
//       // .populate('uploadedBy', 'firstName lastName')
//       .sort({ createdAt: -1 });

//     console.log(`🔍 Recherche fichiers pour le cours: ${courseId} | Trouvés: ${files.length}`);

//     res.json({
//       success: true,
//       count: files.length,
//       data: files
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };
const getCourseFiles = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Recherche simple sans populate
    const files = await File.find({ courseId: courseId })
      .sort({ createdAt: -1 });

    // Si tu as vraiment besoin des noms, tu devrais soit :
    // 1. Stocker le "uploadedByName" en dur lors de l'upload
    // 2. Faire une requête API vers le User Service depuis ici (plus complexe)

    res.json({
      success: true,
      data: files // Retourne les fichiers, le front affichera l'icône et le nom du fichier
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
/**
 * @desc    Delete file
 * @route   DELETE /api/files/:id
 * @access  Private
 */
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    // Check if user owns the file or is admin
    if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce fichier'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete file record from database
    await file.deleteOne();

    res.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du fichier',
      error: error.message
    });
  }
};

/**
 * @desc    Download file
 * @route   GET /api/files/:id/download
 * @access  Private
 */
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    // Check if file exists on filesystem
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier introuvable sur le serveur'
      });
    }

    // Set headers for download
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    
    // Stream file to response
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du fichier',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's uploaded files
 * @route   GET /api/files/my-files
 * @access  Private
 */
const getMyFiles = async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error) {
    console.error('Get my files error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fichiers',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadFile,
  getFile,
  getCourseFiles,
  deleteFile,
  downloadFile,
  getMyFiles
};