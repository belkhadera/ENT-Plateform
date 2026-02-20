const Exam = require('../models/Exam');

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
exports.getAllExams = async (req, res) => {
  try {
    let query = { isActive: true, isPublished: true };
    
    // Filter by course if specified
    if (req.query.courseId) {
      query.courseId = req.query.courseId;
    }
    
    const exams = await Exam.find(query).sort({ dueDate: 1 });
    
    res.json({ 
      success: true, 
      count: exams.length,
      data: exams 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my exams (based on role)
// @route   GET /api/exams/my-exams
// @access  Private
exports.getMyExams = async (req, res) => {
  try {
    let exams;
    
    if (req.user.role === 'TEACHER') {
      // Teachers see exams they created
      exams = await Exam.find({ 
        teacherId: req.user.id,
        isActive: true 
      }).sort({ dueDate: -1 });
    } else {
      // Students see published exams
      exams = await Exam.find({ 
        isActive: true,
        isPublished: true
      }).sort({ dueDate: 1 });
    }
    
    res.json({ 
      success: true, 
      count: exams.length,
      data: exams 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Private
exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    
    // Students can't see unpublished exams
    if (req.user.role === 'STUDENT' && !exam.isPublished) {
      return res.status(403).json({ 
        success: false, 
        message: 'Exam not yet published' 
      });
    }
    
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create exam
// @route   POST /api/exams
// @access  Private (Teacher)
exports.createExam = async (req, res) => {
  try {
    // Check if user is teacher
    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only teachers can create exams' 
      });
    }

    const examData = {
      ...req.body,
      teacherId: req.user.id,
      teacherName: `${req.user.firstName} ${req.user.lastName}`
    };

    const exam = await Exam.create(examData);
    
    res.status(201).json({ 
      success: true, 
      message: 'Exam created successfully',
      data: exam 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Teacher who created it)
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check authorization
    if (exam.teacherId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this exam' 
      });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.json({ 
      success: true, 
      message: 'Exam updated successfully',
      data: updatedExam 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Teacher who created it)
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check authorization
    if (exam.teacherId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this exam' 
      });
    }

    await Exam.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ 
      success: true, 
      message: 'Exam deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit exam/assignment
// @route   POST /api/exams/:id/submit
// @access  Private (Student)
exports.submitExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check if already submitted
    const existingSubmission = exam.submissions.find(
      sub => sub.studentId.toString() === req.user.id
    );

    if (existingSubmission) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already submitted' 
      });
    }

    // Check if past due date
    const now = new Date();
    const isLate = now > new Date(exam.dueDate);
    
    if (isLate && !exam.allowLateSubmission) {
      return res.status(400).json({ 
        success: false, 
        message: 'Submission deadline has passed' 
      });
    }

    const submission = {
      studentId: req.user.id,
      studentName: `${req.user.firstName} ${req.user.lastName}`,
      files: req.body.files || [],
      content: req.body.content || '',
      status: isLate ? 'LATE' : 'SUBMITTED'
    };

    exam.submissions.push(submission);
    await exam.save();

    res.json({ 
      success: true, 
      message: 'Submission successful',
      data: submission 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get exam submissions
// @route   GET /api/exams/:id/submissions
// @access  Private (Teacher)
exports.getSubmissions = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check authorization
    if (exam.teacherId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    res.json({ 
      success: true, 
      count: exam.submissions.length,
      data: exam.submissions 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my submission for an exam
// @route   GET /api/exams/:id/my-submission
// @access  Private (Student)
exports.getMySubmission = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const submission = exam.submissions.find(
      sub => sub.studentId.toString() === req.user.id
    );

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'No submission found' 
      });
    }

    res.json({ 
      success: true, 
      data: submission 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Grade submission
// @route   POST /api/exams/:id/submissions/:submissionId/grade
// @access  Private (Teacher)
exports.gradeSubmission = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check authorization
    if (exam.teacherId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    const submission = exam.submissions.id(req.params.submissionId);
    
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    submission.grade = req.body.grade;
    submission.feedback = req.body.feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;
    submission.status = 'GRADED';

    await exam.save();

    res.json({ 
      success: true, 
      message: 'Submission graded successfully',
      data: submission 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Publish/Unpublish exam
// @route   PATCH /api/exams/:id/publish
// @access  Private (Teacher)
exports.togglePublish = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check authorization
    if (exam.teacherId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    exam.isPublished = !exam.isPublished;
    await exam.save();

    res.json({ 
      success: true, 
      message: `Exam ${exam.isPublished ? 'published' : 'unpublished'} successfully`,
      data: exam 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
