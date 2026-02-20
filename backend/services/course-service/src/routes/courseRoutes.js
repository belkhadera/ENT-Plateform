const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourse,
  getCoursesByTeacher,
  getMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse,
  addFile,
  removeFile
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// Public/General routes
router.get('/', protect, getAllCourses);
router.get('/my-courses', protect, getMyCourses);
router.get('/teacher/:teacherId', protect, getCoursesByTeacher);
router.get('/:id', protect, getCourse);

// Course management (Teacher)
router.post('/', protect, createCourse);
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);

// Enrollment (Student)
router.post('/:id/enroll', protect, enrollCourse);
router.post('/:id/unenroll', protect, unenrollCourse);

// File management
router.post('/:id/files', protect, addFile);
router.delete('/:id/files/:fileId', protect, removeFile);

module.exports = router;
