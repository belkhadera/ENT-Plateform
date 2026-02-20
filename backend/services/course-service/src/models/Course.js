const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  teacherId: { type: mongoose.Schema.Types.ObjectId, required: true },
  files: [{ fileId: String, fileName: String, fileUrl: String }],
  students: [mongoose.Schema.Types.ObjectId]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
