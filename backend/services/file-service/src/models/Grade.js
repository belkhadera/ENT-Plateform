const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'étudiant est requis']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Le cours est requis']
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'L\'examen est requis']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'enseignant est requis']
  },
  score: {
    type: Number,
    required: [true, 'La note est requise'],
    min: [0, 'La note ne peut pas être négative']
  },
  maxScore: {
    type: Number,
    required: [true, 'La note maximale est requise'],
    default: 20
  },
  coefficient: {
    type: Number,
    default: 1,
    min: [0.5, 'Le coefficient minimum est 0.5'],
    max: [5, 'Le coefficient maximum est 5']
  },
  module: {
    type: String,
    default: 'Général'
  },
  semester: {
    type: Number,
    min: 1,
    max: 10
  },
  credits: {
    type: Number,
    default: 0,
    min: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  gradedAt: {
    type: Date,
    default: Date.now
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
gradeSchema.index({ studentId: 1, createdAt: -1 });
gradeSchema.index({ courseId: 1, studentId: 1 });
gradeSchema.index({ examId: 1, studentId: 1 }, { unique: true });
gradeSchema.index({ semester: 1, studentId: 1 });

// Virtual for normalized score (out of 20)
gradeSchema.virtual('normalizedScore').get(function() {
  return ((this.score / this.maxScore) * 20).toFixed(2);
});

// Virtual for percentage
gradeSchema.virtual('percentage').get(function() {
  return ((this.score / this.maxScore) * 100).toFixed(2);
});

// Virtual for pass/fail status
gradeSchema.virtual('isPassing').get(function() {
  return this.normalizedScore >= 10;
});

// Virtual for grade letter
gradeSchema.virtual('gradeLetter').get(function() {
  const normalized = parseFloat(this.normalizedScore);
  if (normalized >= 16) return 'A';
  if (normalized >= 14) return 'B';
  if (normalized >= 12) return 'C';
  if (normalized >= 10) return 'D';
  return 'F';
});

// Virtual for grade label
gradeSchema.virtual('gradeLabel').get(function() {
  const normalized = parseFloat(this.normalizedScore);
  if (normalized >= 16) return 'Excellent';
  if (normalized >= 14) return 'Bien';
  if (normalized >= 12) return 'Assez Bien';
  if (normalized >= 10) return 'Passable';
  return 'Insuffisant';
});

// Ensure virtuals are included in JSON
gradeSchema.set('toJSON', { virtuals: true });
gradeSchema.set('toObject', { virtuals: true });

// Middleware to ensure student role
gradeSchema.pre('save', async function(next) {
  if (this.isNew) {
    const User = mongoose.model('User');
    const student = await User.findById(this.studentId);
    
    if (!student || student.role !== 'STUDENT') {
      throw new Error('L\'utilisateur doit être un étudiant');
    }
  }
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);
