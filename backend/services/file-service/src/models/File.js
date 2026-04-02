// backend/services/file-service/src/models/File.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false  // Important: peut être null
  }
  // PAS DE CHAMP URL DU TOUT
}, {
  timestamps: true
});

// Log pour confirmer le chargement
console.log('✅ Modèle File chargé avec succès');

module.exports = mongoose.model('File', fileSchema);