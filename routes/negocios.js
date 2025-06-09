const express = require('express');
const router = express.Router();
const Negocio = require('../models/Negocio');
const Categoria = require('../models/Categoria');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const Resena = require('../models/Resena'); 
const  { obtenerNegociosPorCliente } = require('../controllers/negociosController');
const { verificarToken } = require('../middlewares/authMiddleware');

const { actualizarUbicacionNegocio } = require('../controllers/negociosController');

router.put('/negocios/:id/ubicacion', actualizarUbicacionNegocio);

router.get("/mis-negocios", verificarToken, obtenerNegociosPorCliente);

// Configuración de multer para múltiples campos de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Usamos multer.fields para aceptar múltiples campos
const uploadFields = upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'logo_imagen', maxCount: 1 },
  { name: 'imagen_banner', maxCount: 5 }
]);

router.post('/', verificarToken, uploadFields, async (req, res) => { 
  console.log('📥 Datos recibidos en el body:', req.body);
  console.log('🧾 Archivos recibidos:', req.files);
  console.log('🔐 Usuario autenticado (token):', req.user);

  // Verificar si el usuario tiene el rol adecuado
  if (req.user.rol !== 'cliente') {
    return res.status(403).json({ mensaje: 'Solo los clientes pueden crear negocios.' });
  }

  const {
    nombre, direccion, telefono, categoria, descripcion,
    horario, lat, lng, etiquetas, servicios,
    preguntas_comunidad, abierto, estado 
  } = req.body;

  // Convertir latitud y longitud a números y verificar su validez
  const latitud = parseFloat(lat);
  const longitud = parseFloat(lng);

  if (isNaN(latitud) || isNaN(longitud)) {
    return res.status(400).json({ mensaje: 'Las coordenadas de ubicación no son válidas.' });
  }

  try {
    // Validar ID de categoría
    if (!mongoose.Types.ObjectId.isValid(categoria)) {
      return res.status(400).json({ mensaje: 'Categoría no válida' });
    }
const imagen = req.files['imagen'] ? 'uploads/' + req.files['imagen'][0].filename.replace(/\\/g, '/') : null;
const logo_imagen = req.files['logo_imagen'] ? 'uploads/' + req.files['logo_imagen'][0].filename.replace(/\\/g, '/') : null;
const imagen_banner = req.files['imagen_banner']
  ? req.files['imagen_banner'].map(file => 'uploads/' + file.filename.replace(/\\/g, '/'))
  : [];

    const nuevoNegocio = new Negocio({
      nombre,
      direccion,
      telefono,
      categoria,
      descripcion,
      horario,
      ubicacion: {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      },
      imagen,
      imagen_banner,
      logo_imagen,
      estado,
      abierto: abierto === 'true' || abierto === true,
      etiquetas: etiquetas ? etiquetas.split(',').map(tag => tag.trim()) : [],
      servicios: servicios ? servicios.split(',').map(s => s.trim()) : [],
      preguntas_comunidad: preguntas_comunidad
        ? JSON.parse(preguntas_comunidad)
        : [],
      creadoEn: new Date(),
      clienteId: req.user.id,  // Usar "cliente" en lugar de "clienteId"
    });

    await nuevoNegocio.save();
    res.status(201).json({ mensaje: 'Negocio creado con éxito', negocio: nuevoNegocio });
  } catch (error) {
    console.error('❌ Error al crear el negocio:');
    console.error('Mensaje:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    res.status(500).json({
      mensaje: 'Error al crear el negocio',
      error: error.message,
      detalle: error.stack,
    });
  }
});

// Obtener todos los negocios
router.get('/', async (req, res) => {
  try {
    const negocios = await Negocio.find().populate('categoria');
    res.json(negocios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo negocio
/*router.post('/', async (req, res) => {
  try {
    const nuevoNegocio = new Negocio(req.body);
    await nuevoNegocio.save();
    res.status(201).json(nuevoNegocio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});*/

// Obtener todos los negocios con categoría poblada
router.get('/', async (req, res) => {
  try {
    const negocios = await Negocio.find().populate('categoria');
    res.json(negocios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un negocio por ID
router.get('/:id', async (req, res) => {
  try {
    const negocio = await Negocio.findById(req.params.id).populate('categoria');
    if (!negocio) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }
    res.json(negocio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}); 

router.post("/sugerir", async (req, res) => {
  try {
    const { nombre, direccion, categoria } = req.body;
    const nuevoNegocio = new Negocio({
      nombre,
      direccion,
      categorias: [categoria],
      estado: "pendiente", // O puedes tener un campo booleano aprobado: false
    });
    await nuevoNegocio.save();
    res.status(201).json({ message: "Negocio sugerido con éxito." });
  } catch (err) {
    res.status(500).json({ message: "Error al sugerir negocio", error: err.message });
  }
});

// Ruta: obtener total de reseñas por negocio
router.get('/:id/resenas/count', async (req, res) => {
  try {
    const total = await Reseña.countDocuments({ negocioId: req.params.id });
    res.json({ total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al contar reseñas" });
  }
}); 


// Ruta protegida para obtener los negocios de un cliente
router.get('/mis-negocios', verificarToken, async (req, res) => {
  try {
    // Asumimos que el id del cliente está en el token
    const clienteId = req.user.id;
    
    // Buscamos los negocios que corresponden al cliente
    const negocios = await Negocio.find({ clienteId });
    
    if (!negocios) {
      return res.status(404).json({ message: 'No se encontraron negocios' });
    }
    
    res.status(200).json(negocios); // Devuelve los negocios en formato JSON
  } catch (error) {
    console.error('Error al obtener los negocios:', error);
    res.status(500).json({ message: 'Error al obtener los negocios' });
  }
});

// Ruta protegida para obtener las reseñas de un cliente
router.get('/mis-resenas', verificarToken, async (req, res) => {
  try {
    const clienteId = req.user.id; // El ID del cliente está en el token
    
    // Buscamos las reseñas del cliente
    const resenas = await Resena.find({ clienteId }).populate('negocio'); // Poblamos la información del negocio relacionado
    
    if (!resenas || resenas.length === 0) {
      return res.status(404).json({ message: 'No se encontraron reseñas' });
    }
    
    res.status(200).json(resenas); // Devolvemos las reseñas del cliente
  } catch (error) {
    console.error('Error al obtener las reseñas del cliente:', error);
    res.status(500).json({ message: 'Error al obtener las reseñas del cliente' });
  }
});

// En tu archivo de rutas (por ejemplo, resenaRoutes.js)


// Ruta para obtener las reseñas de un negocio
router.get('/resenas/negocio/:negocioId', async (req, res) => {
  const { negocioId } = req.params;

  try {
    const reseñas = await Reseña.find({ negocio: negocioId }).populate('usuario', 'nombre correo'); // Cambia 'usuario' por la relación correcta si es diferente

    if (!reseñas.length) {
      return res.status(404).json({ message: 'No se encontraron reseñas para este negocio.' });
    }

    return res.status(200).json(reseñas);
  } catch (error) {
    console.error('Error al obtener las reseñas:', error);
    return res.status(500).json({ message: 'Hubo un error al obtener las reseñas.' });
  }
});


// Ruta para actualizar un negocio
// Ruta para actualizar un negocio
router.put('/:id', upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'logo_imagen', maxCount: 1 },
  { name: 'imagen_banner', maxCount: 5 },
]), async (req, res) => {
  const { id } = req.params;

  // Convertir lat y lng a número (por si vienen como string desde FormData)
  const latNum = parseFloat(req.body.lat);
  const lngNum = parseFloat(req.body.lng);

  // Validar coordenadas
  if (
    isNaN(latNum) || isNaN(lngNum) ||
    latNum < -90 || latNum > 90 ||
    lngNum < -180 || lngNum > 180
  ) {
    return res.status(400).json({ message: 'Las coordenadas son inválidas.' });
  }

  const {
    nombre,
    descripcion,
    direccion,
    telefono,
    categoria,
    estado,
    abierto,
    etiquetas,
    servicios,
    horario
  } = req.body;

  const negocioData = {
    nombre,
    descripcion,
    direccion,
    telefono,
    categoria,
    ubicacion: { lat: latNum, lng: lngNum },
    estado,
    abierto,
    etiquetas,
    servicios,
    horario,
  };

  // Verificar y asignar imágenes si existen
  if (req.files.imagen) {
    negocioData.imagen = req.files.imagen[0].path;
  }
  if (req.files.logo_imagen) {
    negocioData.logo_imagen = req.files.logo_imagen[0].path;
  }
  if (req.files.imagen_banner) {
    negocioData.imagen_banner = req.files.imagen_banner.map(file => file.path);
  }

  try {
    const negocio = await Negocio.findByIdAndUpdate(id, negocioData, { new: true });
    if (!negocio) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }

    res.status(200).json(negocio);
  } catch (error) {
    console.error('Error al actualizar negocio:', error);
    res.status(500).json({ message: 'Error al actualizar negocio' });
  }
});

module.exports = router;
