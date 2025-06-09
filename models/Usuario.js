const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contraseña: {
    type: String,
    required: true,
  }, 
  ubicacion: {
    type: String,
    required: true,
  },
  creadoEn: {
    type: Date,
    default: Date.now,
  }, 
  rol: {
    type: String,
    enum: ['usuario', 'cliente', 'admin'],
    default: 'usuario'
  },
  recuperacionToken: String,
  recuperacionTokenExpiracion: Date,
  foto: {  // Este es el nuevo campo
    type: String,
    default: '', // Puede estar vacío si no se ha subido una imagen
  },
});

module.exports = mongoose.model('Usuario', usuarioSchema);
