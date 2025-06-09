const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  descripcion: String,
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',  // Referencia a la colección de Categoría
  },
  disponible: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Producto', productoSchema);
