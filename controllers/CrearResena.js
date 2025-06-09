const express = require('express');
const multer = require('multer');
const Resena = require('../models/Resena');
const Usuario = require('../models/Usuario');
const Negocio = require('../models/Negocio');

const router = express.Router();

// Configuración de multer para la carga de archivos
const upload = multer({ dest: 'uploads/' });

// Ruta para crear una reseña
router.post('/', upload.array('foto', 5), async (req, res) => { 
  console.log('Archivos recibidos:', req.files);

  try {
    const { usuarioId, negocioId, texto, rating, titulo } = req.body;
    const fotos = req.files ? req.files.map(file => file.path) : [];

    // Verificar que los datos sean válidos
    if (!usuarioId || !negocioId || !titulo || !texto || !rating) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    // Verificar que el negocio y usuario existan
    const usuario = await Usuario.findById(usuarioId);
    const negocio = await Negocio.findById(negocioId);

    if (!usuario || !negocio) {
      return res.status(404).json({ message: 'Usuario o negocio no encontrado.' });
    }

    // Crear la reseña
    const nuevaResena = new Resena({
      usuarioId,
      negocioId,
      texto,
      rating,
      titulo,
      foto: fotos, // Foto subida
    });

    // Guardar la reseña
    await nuevaResena.save();
    res.status(201).json(nuevaResena); // Devuelve la reseña creada
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar la reseña.', error: error.message });
  }
}); 


// Ruta para crear un negocio
router.post('/negocio', upload.single('imagen_banner'), async (req, res) => {
  try {
    const { nombre, direccion, telefono, categoria, descripcion } = req.body;
    const imagen_banner = req.file ? req.file.path : null;

    if (!nombre || !direccion || !telefono || !categoria || !descripcion) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const nuevoNegocio = new Negocio({
      nombre,
      direccion,
      telefono,
      categoria,
      descripcion,
      imagen_banner,
      estado: "sin reclamar", // puedes cambiar esto si luego implementas verificación
      etiquetas: [], // por ahora vacío
    });

    await nuevoNegocio.save();
    res.status(201).json(nuevoNegocio);
  } catch (error) {
    console.error('Error al crear negocio:', error);
    res.status(500).json({ message: 'Error al crear el negocio', error: error.message });
  }
});



module.exports = router;
