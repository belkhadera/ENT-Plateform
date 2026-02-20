const Course = require('../models/Course');
const mongoose=require("mongoose")
// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json({ 
      success: true, 
      count: courses.length,
      data: courses 
    });
    console.log(courses)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get courses by teacher
// @route   GET /api/courses/teacher/:teacherId
// @access  Private
exports.getCoursesByTeacher = async (req, res) => {
  try {
    const courses = await Course.find({ 
      teacherId: req.params.teacherId,
      isActive: true 
    });
    res.json({ 
      success: true, 
      count: courses.length,
      data: courses 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my courses (for current user)
// @route   GET /api/courses/my-courses
// @access  Private
exports.getMyCourses = async (req, res) => {
  try {
    // Vérification de l'utilisateur
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Non autorisé" });
    }

    let query = { isActive: true };
    
    // Conversion sécurisée de l'ID string en ObjectId MongoDB
    const userId = new mongoose.Types.ObjectId(req.user.id);

    if (req.user.role === 'TEACHER') {
      query.teacherId = userId;
    } else if (req.user.role === 'STUDENT') {
      query.students = userId; 
    }

    const courses = await Course.find(query)
      .populate('teacherId', 'name')
      .lean(); // .lean() rend la réponse plus légère (JS pur)

    return res.status(200).json({ 
      success: true, 
      count: courses.length, 
      data: courses 
    });

  } catch (error) {
    console.error("Erreur Backend getMyCourses:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Teacher only)
exports.createCourse = async (req, res) => {
  try {
    // 1. Vérification du rôle
    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Seuls les enseignants peuvent créer des cours' });
    }

    // 2. Préparation des données
    const courseData = {
      ...req.body, // Titre, description, etc.
      teacherId: req.user.id,
      teacherName: `${req.user.firstName} ${req.user.lastName}`
    };

    // 3. GESTION DU FICHIER : Si un fichier a été uploadé via Multer
    if (req.file) {
      // Si tu stockes le chemin localement
      courseData.thumbnail = req.file.path; 
      // OU si tu stockes juste le nom du fichier
      // courseData.fileUrl = `/uploads/${req.file.filename}`;
    }

    // 4. Sauvegarde en base de données
    const course = await Course.create(courseData);
    
    res.status(201).json({ 
      success: true, 
      message: 'Cours créé avec succès',
      data: course 
    });
  } catch (error) {
    console.error("Erreur création cours:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Teacher who created it)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if user owns this course or is admin
    if (course.teacherId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this course' 
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.json({ 
      success: true, 
      message: 'Course updated successfully',
      data: updatedCourse 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete course (soft delete)
// @route   DELETE /api/courses/:id
// @access  Private (Teacher who created it)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if user owns this course or is admin
    if (course.teacherId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this course' 
      });
    }

    await Course.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ 
      success: true, 
      message: 'Course deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled
    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already enrolled in this course' 
      });
    }

    course.students.push(req.user.id);
    await course.save();

    res.json({ 
      success: true, 
      message: 'Successfully enrolled in course',
      data: course 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unenroll from course
// @route   POST /api/courses/:id/unenroll
// @access  Private (Student)
exports.unenrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.students = course.students.filter(
      studentId => studentId.toString() !== req.user.id
    );
    await course.save();

    res.json({ 
      success: true, 
      message: 'Successfully unenrolled from course' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add file to course
// @route   POST /api/courses/:id/files
// @access  Private (Teacher)
exports.addFile = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check authorization
    if (course.teacherId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    course.files.push(req.body);
    await course.save();

    res.json({ 
      success: true, 
      message: 'File added to course',
      data: course 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove file from course
// @route   DELETE /api/courses/:id/files/:fileId
// @access  Private (Teacher)
exports.removeFile = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check authorization
    if (course.teacherId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    course.files = course.files.filter(
      file => file.fileId !== req.params.fileId
    );
    await course.save();

    res.json({ 
      success: true, 
      message: 'File removed from course' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
