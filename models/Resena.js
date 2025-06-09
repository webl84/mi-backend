const mongoose = require('mongoose');

const resenaSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  negocioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Negocio', required: true },
  titulo: { type: String, required: true },
  texto: { type: String, required: true },
  rating: { type: Number, required: true },
  foto: [String],
  fecha: { type: Date, default: Date.now } // <-- este campo
});

module.exports = mongoose.model('Resena', resenaSchema);
