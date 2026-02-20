const express = require('express');
const router = express.Router();
const {
  upload,
  uploadFile,
  getFile,
  getCourseFiles,
  deleteFile,
  downloadFile,
  getMyFiles
} = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// @route   POST /api/files/upload
// @desc    Upload a file
// @access  Private
router.post('/upload', upload.single('file'), uploadFile);

// @route   GET /api/files/my-files
// @desc    Get current user's uploaded files
// @access  Private
router.get('/my-files', getMyFiles);

// @route   GET /api/files/course/:courseId
// @desc    Get all files for a specific course
// @access  Private
router.get('/course/:courseId', getCourseFiles);

// @route   GET /api/files/:id
// @desc    Get file details by ID
// @access  Private
router.get('/:id', getFile);

// @route   GET /api/files/:id/download
// @desc    Download a file
// @access  Private
router.get('/:id/download', downloadFile);

// @route   DELETE /api/files/:id
// @desc    Delete a file
// @access  Private
router.delete('/:id', deleteFile);

module.exports = router;
