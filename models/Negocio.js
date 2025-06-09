const mongoose = require('mongoose');

const negocioSchema = new mongoose.Schema({
  nombre: String,
  direccion: String,
  telefono: String,
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria', // Referencia a la colección Categoria
    required: false,
  },
  descripcion: String,
  ubicacion: {
    lat: Number,
    lng: Number,
  },
  imagen: {
    type: String, // Imagen principal
    default: '',
  },
  imagen_banner: [String], // Múltiples imágenes de banner
  logo_imagen: String, // Logo de imagen
  estado: {
    type: String,
    default: 'sin reclamar',
  },
  abierto: {
    type: Boolean,
    default: true,
  },
  etiquetas: [String], // Etiquetas como arreglo
  servicios: [String], // Servicios como arreglo
  horario: String,
  creadoEn: {
    type: Date,
    default: Date.now,
  }, 
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
 
});

module.exports = mongoose.model('Negocio', negocioSchema);
