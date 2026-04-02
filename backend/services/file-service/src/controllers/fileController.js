const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const mongoose = require('mongoose'); // Ajouté pour la validation ObjectId

// Ensure uploads directory exists
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log('✅ Created uploads directory:', uploadPath);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
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
// Dans fileController.js - uploadFile
const uploadFile = async (req, res) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier téléchargé'
      });
    }

    // Stocker SEULEMENT les infos nécessaires, PAS d'URL
    const fileData = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id
      // PAS DE URL ICI !
    };

    // Ajouter courseId si valide
    if (req.body.courseId && req.body.courseId !== 'null') {
      fileData.courseId = req.body.courseId;
    }

    const file = await File.create(fileData);

    // Répondre sans l'URL
    res.status(201).json({
      success: true,
      data: {
        _id: file._id,
        originalName: file.originalName,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size
      },
      message: 'Fichier téléchargé avec succès'
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement'
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
    const file = await File.findById(req.params.id);

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
const getCourseFiles = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Vérifier que courseId est valide
    if (!courseId || courseId === 'null' || courseId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'ID de cours invalide'
      });
    }

    // Recherche des fichiers
    const files = await File.find({ 
      courseId: courseId 
    }).sort({ createdAt: -1 });

    console.log(`🔍 ${files.length} fichiers trouvés pour le cours ${courseId}`);

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('❌ GetCourseFiles error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des fichiers',
      error: error.message 
    });
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
      console.log('🗑️ Fichier supprimé du disque:', file.path);
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

    console.log('📥 Téléchargement du fichier:', file.originalName);
    console.log('📂 Chemin:', file.path);

    // Check if file exists on filesystem
    if (!fs.existsSync(file.path)) {
      console.error('❌ Fichier introuvable sur le disque:', file.path);
      
      // Essayer de trouver dans le dossier uploads alternatif
      const alternativePath = path.join(__dirname, '../../uploads', file.filename);
      if (fs.existsSync(alternativePath)) {
        console.log('✅ Fichier trouvé dans:', alternativePath);
        
        res.setHeader('Content-Type', file.mimetype);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
        
        const fileStream = fs.createReadStream(alternativePath);
        return fileStream.pipe(res);
      }
      
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
    
    fileStream.on('error', (err) => {
      console.error('❌ Erreur lors du streaming:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du téléchargement'
      });
    });
  } catch (error) {
    console.error('❌ Download file error:', error);
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
    console.error('❌ Get my files error:', error);
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