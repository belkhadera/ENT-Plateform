const Grade = require('../models/Grade');
const Exam = require('../models/Exam');
const Course = require('../models/Course');
const User = require('../models/User');

/**
 * @desc    Get all grades for current student
 * @route   GET /api/grades/my-grades
 * @access  Private (Student)
 */
const getMyGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.user.id })
      .populate('courseId', 'title code')
      .populate('examId', 'title type')
      .populate('teacherId', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Format response
    const formattedGrades = grades.map(grade => ({
      _id: grade._id,
      examTitle: grade.examId?.title || 'Examen',
      examType: grade.examId?.type || 'EXAM',
      courseName: grade.courseId?.title || 'Cours',
      courseCode: grade.courseId?.code || '',
      teacherName: `${grade.teacherId?.firstName || ''} ${grade.teacherId?.lastName || ''}`.trim(),
      score: grade.score,
      maxScore: grade.maxScore,
      percentage: ((grade.score / grade.maxScore) * 100).toFixed(2),
      coefficient: grade.coefficient,
      module: grade.module,
      semester: grade.semester,
      credits: grade.credits,
      feedback: grade.feedback,
      gradedAt: grade.gradedAt,
      createdAt: grade.createdAt
    }));

    res.json({
      success: true,
      count: formattedGrades.length,
      data: formattedGrades
    });
  } catch (error) {
    console.error('Get my grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notes',
      error: error.message
    });
  }
};

/**
 * @desc    Get grades for a specific course
 * @route   GET /api/grades/course/:courseId
 * @access  Private
 */
const getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user has access to this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    let query = { courseId };

    // Students can only see their own grades
    if (req.user.role === 'STUDENT') {
      query.studentId = req.user.id;
    }

    const grades = await Grade.find(query)
      .populate('studentId', 'firstName lastName email')
      .populate('examId', 'title type')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: grades.length,
      data: grades
    });
  } catch (error) {
    console.error('Get course grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notes',
      error: error.message
    });
  }
};

/**
 * @desc    Get all students grades for a course (teacher)
 * @route   GET /api/grades/course/:courseId/students
 * @access  Private (Teacher/Admin)
 */
const getStudentsGrades = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user is teacher of this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    if (course.teacher.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const grades = await Grade.find({ courseId })
      .populate('studentId', 'firstName lastName email studentId')
      .populate('examId', 'title type totalPoints')
      .sort({ 'studentId.lastName': 1 });

    // Group by student
    const studentGrades = {};
    grades.forEach(grade => {
      const studentId = grade.studentId._id.toString();
      if (!studentGrades[studentId]) {
        studentGrades[studentId] = {
          student: grade.studentId,
          grades: [],
          average: 0
        };
      }
      studentGrades[studentId].grades.push(grade);
    });

    // Calculate averages
    Object.values(studentGrades).forEach(sg => {
      if (sg.grades.length > 0) {
        const total = sg.grades.reduce((sum, g) => sum + g.score, 0);
        sg.average = (total / sg.grades.length).toFixed(2);
      }
    });

    res.json({
      success: true,
      data: Object.values(studentGrades)
    });
  } catch (error) {
    console.error('Get students grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notes',
      error: error.message
    });
  }
};

/**
 * @desc    Get grade statistics for current student
 * @route   GET /api/grades/statistics
 * @access  Private (Student)
 */
const getMyStatistics = async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.user.id });

    if (grades.length === 0) {
      return res.json({
        success: true,
        data: {
          average: 0,
          totalExams: 0,
          totalCredits: 0,
          passRate: 0,
          gradeDistribution: {}
        }
      });
    }

    // Calculate statistics
    const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
    const average = totalScore / grades.length;
    const passed = grades.filter(g => g.score >= 10).length;
    const passRate = (passed / grades.length) * 100;
    const totalCredits = grades.reduce((sum, g) => sum + (g.credits || 0), 0);

    // Grade distribution
    const distribution = {
      excellent: grades.filter(g => g.score >= 16).length,
      good: grades.filter(g => g.score >= 14 && g.score < 16).length,
      pass: grades.filter(g => g.score >= 10 && g.score < 14).length,
      fail: grades.filter(g => g.score < 10).length
    };

    res.json({
      success: true,
      data: {
        average: average.toFixed(2),
        totalExams: grades.length,
        totalCredits,
        passRate: passRate.toFixed(1),
        gradeDistribution: distribution
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new grade
 * @route   POST /api/grades
 * @access  Private (Teacher/Admin)
 */
const createGrade = async (req, res) => {
  try {
    const {
      studentId,
      courseId,
      examId,
      score,
      maxScore,
      coefficient,
      module,
      semester,
      credits,
      feedback
    } = req.body;

    // Validate score
    if (score < 0 || score > maxScore) {
      return res.status(400).json({
        success: false,
        message: 'Note invalide'
      });
    }

    // Check if grade already exists
    const existingGrade = await Grade.findOne({ studentId, examId });
    if (existingGrade) {
      return res.status(400).json({
        success: false,
        message: 'Une note existe déjà pour cet examen'
      });
    }

    const grade = await Grade.create({
      studentId,
      courseId,
      examId,
      teacherId: req.user.id,
      score,
      maxScore,
      coefficient: coefficient || 1,
      module,
      semester,
      credits,
      feedback,
      gradedAt: new Date()
    });

    await grade.populate([
      { path: 'studentId', select: 'firstName lastName email' },
      { path: 'courseId', select: 'title code' },
      { path: 'examId', select: 'title type' }
    ]);

    res.status(201).json({
      success: true,
      data: grade,
      message: 'Note créée avec succès'
    });
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la note',
      error: error.message
    });
  }
};

/**
 * @desc    Update a grade
 * @route   PUT /api/grades/:id
 * @access  Private (Teacher/Admin)
 */
const updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Note non trouvée'
      });
    }

    // Check authorization
    if (grade.teacherId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    // Validate new score if provided
    if (req.body.score !== undefined) {
      if (req.body.score < 0 || req.body.score > (req.body.maxScore || grade.maxScore)) {
        return res.status(400).json({
          success: false,
          message: 'Note invalide'
        });
      }
    }

    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      { ...req.body, gradedAt: new Date() },
      { new: true, runValidators: true }
    ).populate([
      { path: 'studentId', select: 'firstName lastName email' },
      { path: 'courseId', select: 'title code' },
      { path: 'examId', select: 'title type' }
    ]);

    res.json({
      success: true,
      data: updatedGrade,
      message: 'Note mise à jour avec succès'
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la note',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a grade
 * @route   DELETE /api/grades/:id
 * @access  Private (Teacher/Admin)
 */
const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Note non trouvée'
      });
    }

    // Check authorization
    if (grade.teacherId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    await grade.deleteOne();

    res.json({
      success: true,
      message: 'Note supprimée avec succès'
    });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la note',
      error: error.message
    });
  }
};

/**
 * @desc    Get transcript for a semester
 * @route   GET /api/grades/transcript/:semester
 * @access  Private (Student)
 */
const getTranscript = async (req, res) => {
  try {
    const { semester } = req.params;

    const grades = await Grade.find({
      studentId: req.user.id,
      semester
    })
      .populate('courseId', 'title code credits')
      .populate('examId', 'title type')
      .sort({ module: 1, createdAt: 1 });

    // Group by module
    const modules = {};
    grades.forEach(grade => {
      const moduleName = grade.module || 'Général';
      if (!modules[moduleName]) {
        modules[moduleName] = {
          grades: [],
          average: 0,
          credits: 0
        };
      }
      modules[moduleName].grades.push(grade);
    });

    // Calculate module averages
    Object.values(modules).forEach(module => {
      if (module.grades.length > 0) {
        const total = module.grades.reduce((sum, g) => sum + g.score, 0);
        module.average = (total / module.grades.length).toFixed(2);
        module.credits = module.grades.reduce((sum, g) => sum + (g.credits || 0), 0);
      }
    });

    // Calculate overall average
    const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
    const overallAverage = grades.length > 0 ? (totalScore / grades.length).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        semester,
        modules,
        overallAverage,
        totalGrades: grades.length
      }
    });
  } catch (error) {
    console.error('Get transcript error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du relevé',
      error: error.message
    });
  }
};

module.exports = {
  getMyGrades,
  getCourseGrades,
  getStudentsGrades,
  getMyStatistics,
  createGrade,
  updateGrade,
  deleteGrade,
  getTranscript
};
