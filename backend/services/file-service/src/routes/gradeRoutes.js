const express = require('express');
const router = express.Router();
const {
  getMyGrades,
  getCourseGrades,
  getStudentsGrades,
  getMyStatistics,
  createGrade,
  updateGrade,
  deleteGrade,
  getTranscript
} = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// @route   GET /api/grades/my-grades
// @desc    Get all grades for current student
// @access  Private (Student)
router.get('/my-grades', authorize('STUDENT'), getMyGrades);

// @route   GET /api/grades/statistics
// @desc    Get grade statistics for current student
// @access  Private (Student)
router.get('/statistics', authorize('STUDENT'), getMyStatistics);

// @route   GET /api/grades/transcript/:semester
// @desc    Get transcript for a semester
// @access  Private (Student)
router.get('/transcript/:semester', authorize('STUDENT'), getTranscript);

// @route   GET /api/grades/course/:courseId
// @desc    Get grades for a specific course
// @access  Private
router.get('/course/:courseId', getCourseGrades);

// @route   GET /api/grades/course/:courseId/students
// @desc    Get all students grades for a course
// @access  Private (Teacher/Admin)
router.get('/course/:courseId/students', authorize('TEACHER', 'ADMIN'), getStudentsGrades);

// @route   POST /api/grades
// @desc    Create a new grade
// @access  Private (Teacher/Admin)
router.post('/', authorize('TEACHER', 'ADMIN'), createGrade);

// @route   PUT /api/grades/:id
// @desc    Update a grade
// @access  Private (Teacher/Admin)
router.put('/:id', authorize('TEACHER', 'ADMIN'), updateGrade);

// @route   DELETE /api/grades/:id
// @desc    Delete a grade
// @access  Private (Teacher/Admin)
router.delete('/:id', authorize('TEACHER', 'ADMIN'), deleteGrade);

module.exports = router;
