const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  studentName: String,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  files: [{
    fileId: String,
    fileName: String,
    fileUrl: String
  }],
  content: String, // For text submissions
  grade: {
    type: Number,
    min: 0
  },
  feedback: String,
  gradedAt: Date,
  gradedBy: mongoose.Schema.Types.ObjectId,
  status: {
    type: String,
    enum: ['SUBMITTED', 'GRADED', 'LATE'],
    default: 'SUBMITTED'
  }
});

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Course'
  },
  courseName: String,
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  teacherName: String,
  type: {
    type: String,
    enum: ['EXAM', 'ASSIGNMENT', 'QUIZ', 'PROJECT'],
    default: 'ASSIGNMENT'
  },
  dueDate: {
    type: Date,
    required: true
  },
  startDate: Date,
  duration: Number, // in minutes
  totalPoints: {
    type: Number,
    required: true,
    default: 100
  },
  instructions: String,
  attachments: [{
    fileId: String,
    fileName: String,
    fileUrl: String
  }],
  submissions: [submissionSchema],
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for queries
examSchema.index({ courseId: 1, dueDate: -1 });
examSchema.index({ teacherId: 1 });

module.exports = mongoose.model('Exam', examSchema);
