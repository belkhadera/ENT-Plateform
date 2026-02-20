const Course = require('../models/Course');
const User = require('../models/User');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email studentId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get my courses
exports.getMyCourses = async (req, res) => {
  try {
    console.log('🔍 getMyCourses - User:', req.user.id, 'Role:', req.user.role);
    
    let courses;
    
    if (req.user.role === 'TEACHER') {
      // Prof voit ses cours
      courses = await Course.find({ teacher: req.user.id })
        .populate('teacher', 'firstName lastName')
        .populate('students', 'firstName lastName email studentId');
    } else if (req.user.role === 'STUDENT') {
      // Étudiant voit SEULEMENT les cours où il est assigné
      courses = await Course.find({ students: req.user.id })
        .populate('teacher', 'firstName lastName')
        .populate('students', 'firstName lastName email studentId');
    } else if (req.user.role === 'ADMIN') {
      // Admin voit tous les cours
      courses = await Course.find()
        .populate('teacher', 'firstName lastName')
        .populate('students', 'firstName lastName email studentId');
    }

    console.log('✅ Found courses:', courses.length);

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('❌ getMyCourses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single course
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email studentId');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    // Vérifier accès étudiant
    if (req.user.role === 'STUDENT') {
      const isEnrolled = course.students.some(s => s._id.toString() === req.user.id);
      if (!isEnrolled) {
        return res.status(403).json({ 
          success: false, 
          message: 'Vous n\'êtes pas inscrit à ce cours' 
        });
      }
    }

    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create course (TEACHER or ADMIN)
exports.createCourse = async (req, res) => {
  try {
    console.log('📝 Creating course...');
    console.log('User:', req.user.id, 'Role:', req.user.role);
    console.log('Body:', req.body);

    const course = await Course.create({
      ...req.body,
      teacher: req.user.id
    });

    await course.populate('teacher', 'firstName lastName');

    console.log('✅ Course created:', course._id);

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('❌ Create course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update course (TEACHER or ADMIN)
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    // Seul le prof propriétaire ou admin peut modifier
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('teacher', 'firstName lastName')
      .populate('students', 'firstName lastName email studentId');

    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete course (TEACHER or ADMIN)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    if (course.teacher.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    await course.deleteOne();

    res.json({ success: true, message: 'Cours supprimé' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====== GESTION DES ÉTUDIANTS (ADMIN SEULEMENT) ======

/**
 * @desc    Add student to course (ADMIN only)
 * @route   POST /api/courses/:id/students
 * @access  Private (ADMIN)
 */
exports.addStudentToCourse = async (req, res) => {
  try {
    const { studentId } = req.body;

    console.log('➕ Adding student to course:', studentId);

    if (!studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'L\'ID de l\'étudiant est requis' 
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    // Vérifier que l'utilisateur existe et est un étudiant
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Étudiant non trouvé' });
    }

    if (student.role !== 'STUDENT') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet utilisateur n\'est pas un étudiant' 
      });
    }

    // Vérifier si déjà inscrit
    if (course.students.includes(studentId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet étudiant est déjà inscrit à ce cours' 
      });
    }

    // Ajouter l'étudiant
    course.students.push(studentId);
    await course.save();

    await course.populate('teacher', 'firstName lastName');
    await course.populate('students', 'firstName lastName email studentId');

    console.log('✅ Student added to course');

    res.json({ 
      success: true, 
      data: course,
      message: `${student.firstName} ${student.lastName} ajouté au cours avec succès`
    });
  } catch (error) {
    console.error('❌ Add student error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add multiple students to course (ADMIN only)
 * @route   POST /api/courses/:id/students/bulk
 * @access  Private (ADMIN)
 */
exports.addMultipleStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;

    console.log('➕ Adding multiple students:', studentIds);

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Liste d\'IDs étudiants requise' 
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    let addedCount = 0;
    let skippedCount = 0;

    for (const studentId of studentIds) {
      // Vérifier que l'utilisateur existe et est un étudiant
      const student = await User.findById(studentId);
      if (!student || student.role !== 'STUDENT') {
        skippedCount++;
        continue;
      }

      // Vérifier si déjà inscrit
      if (course.students.includes(studentId)) {
        skippedCount++;
        continue;
      }

      // Ajouter l'étudiant
      course.students.push(studentId);
      addedCount++;
    }

    await course.save();
    await course.populate('teacher', 'firstName lastName');
    await course.populate('students', 'firstName lastName email studentId');

    console.log(`✅ Added ${addedCount} students, skipped ${skippedCount}`);

    res.json({ 
      success: true, 
      data: course,
      message: `${addedCount} étudiant(s) ajouté(s), ${skippedCount} ignoré(s)`
    });
  } catch (error) {
    console.error('❌ Add multiple students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Remove student from course (ADMIN only)
 * @route   DELETE /api/courses/:id/students/:studentId
 * @access  Private (ADMIN)
 */
exports.removeStudentFromCourse = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log('➖ Removing student from course:', studentId);

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    // Vérifier si l'étudiant est inscrit
    if (!course.students.includes(studentId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet étudiant n\'est pas inscrit à ce cours' 
      });
    }

    // Retirer l'étudiant
    course.students = course.students.filter(s => s.toString() !== studentId);
    await course.save();

    await course.populate('teacher', 'firstName lastName');
    await course.populate('students', 'firstName lastName email studentId');

    console.log('✅ Student removed from course');

    res.json({ 
      success: true, 
      data: course,
      message: 'Étudiant retiré du cours avec succès'
    });
  } catch (error) {
    console.error('❌ Remove student error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all students (for admin to select)
 * @route   GET /api/courses/:id/available-students
 * @access  Private (ADMIN)
 */
exports.getAvailableStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    // Trouver tous les étudiants qui ne sont PAS dans ce cours
    const allStudents = await User.find({ role: 'STUDENT' })
      .select('firstName lastName email studentId')
      .sort({ firstName: 1 });

    const enrolledStudentIds = course.students.map(s => s.toString());
    const availableStudents = allStudents.filter(
      student => !enrolledStudentIds.includes(student._id.toString())
    );

    res.json({ 
      success: true, 
      data: availableStudents 
    });
  } catch (error) {
    console.error('Get available students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get course students (for admin/teacher view)
 * @route   GET /api/courses/:id/students
 * @access  Private (ADMIN/TEACHER)
 */
exports.getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('students', 'firstName lastName email studentId');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    // Vérifier autorisation
    if (req.user.role === 'TEACHER' && course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    res.json({ 
      success: true, 
      data: course.students 
    });
  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};