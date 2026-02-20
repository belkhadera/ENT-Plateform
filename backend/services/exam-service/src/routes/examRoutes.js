const express = require('express');
const router = express.Router();
const {
  getAllExams,
  getMyExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  submitExam,
  getSubmissions,
  getMySubmission,
  gradeSubmission,
  togglePublish
} = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');

// Exam routes
router.get('/', protect, getAllExams);
router.get('/my-exams', protect, getMyExams);
router.get('/:id', protect, getExam);
router.post('/', protect, createExam);
router.put('/:id', protect, updateExam);
router.delete('/:id', protect, deleteExam);
router.patch('/:id/publish', protect, togglePublish);

// Submission routes
router.post('/:id/submit', protect, submitExam);
router.get('/:id/submissions', protect, getSubmissions);
router.get('/:id/my-submission', protect, getMySubmission);
router.post('/:id/submissions/:submissionId/grade', protect, gradeSubmission);

module.exports = router;
