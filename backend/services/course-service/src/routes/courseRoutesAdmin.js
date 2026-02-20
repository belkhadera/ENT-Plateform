const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getMyCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addStudentToCourse,
  addMultipleStudents,
  removeStudentFromCourse,
  getAvailableStudents,
  getCourseStudents
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

// Apply authentication to all routes
router.use(protect);

// Routes publiques (authentifiées)
router.get('/my-courses', getMyCourses);
router.get('/', getAllCourses);

// CRUD Cours (Teacher/Admin)
router.post('/', authorize('TEACHER', 'ADMIN'), createCourse);
router.get('/:id', getCourse);
router.put('/:id', authorize('TEACHER', 'ADMIN'), updateCourse);
router.delete('/:id', authorize('TEACHER', 'ADMIN'), deleteCourse);

// ====== GESTION DES ÉTUDIANTS (ADMIN SEULEMENT) ======

/**
 * @route   GET /api/courses/:id/available-students
 * @desc    Get students not enrolled in this course (for admin selection)
 * @access  Private (ADMIN)
 */
router.get('/:id/available-students', authorize('ADMIN'), getAvailableStudents);

/**
 * @route   GET /api/courses/:id/students
 * @desc    Get all students in a course
 * @access  Private (ADMIN/TEACHER)
 */
router.get('/:id/students', authorize('ADMIN', 'TEACHER'), getCourseStudents);

/**
 * @route   POST /api/courses/:id/students
 * @desc    Add a student to course
 * @access  Private (ADMIN)
 */
router.post('/:id/students', authorize('ADMIN'), addStudentToCourse);

/**
 * @route   POST /api/courses/:id/students/bulk
 * @desc    Add multiple students to course
 * @access  Private (ADMIN)
 */
router.post('/:id/students/bulk', authorize('ADMIN'), addMultipleStudents);

/**
 * @route   DELETE /api/courses/:id/students/:studentId
 * @desc    Remove a student from course
 * @access  Private (ADMIN)
 */
router.delete('/:id/students/:studentId', authorize('ADMIN'), removeStudentFromCourse);

module.exports = router;