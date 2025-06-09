const mongoose = require('mongoose');

const sugerenciaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
});

const Sugerencia = mongoose.model('Sugerencia', sugerenciaSchema);

module.exports = Sugerencia;
