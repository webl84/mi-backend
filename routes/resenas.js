const express = require('express');
const Resena = require('../models/Resena');
const Usuario = require('../models/Usuario');
const Negocio = require('../models/Negocio');
const multer = require('multer');
const path = require('path');
const { verificarToken } = require("../middlewares/authMiddleware");

const router = express.Router();
const fs = require("fs");

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Asegúrate de tener esta carpeta
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // timestamp para nombre único
  }
});

const upload = multer({ storage });

// Crear una nueva reseña
router.post('/', upload.array('foto'), async (req, res) => {
  try {
    const { usuarioId, negocioId, texto, rating, titulo } = req.body;
    const fotos = req.files ? req.files.map(file => file.path) : [];

    if (!usuarioId || !negocioId || !titulo || !texto || !rating) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const usuario = await Usuario.findById(usuarioId);
    const negocio = await Negocio.findById(negocioId);

    if (!usuario || !negocio) {
      return res.status(404).json({ message: 'Usuario o negocio no encontrado.' });
    }

    const nuevaResena = new Resena({
      usuarioId,
      negocioId,
      texto,
      rating,
      titulo,
      foto: fotos,  // guardar array de rutas
    });

    await nuevaResena.save();
    res.status(201).json(nuevaResena);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar la reseña.', error: error.message });
  }
});

// Obtener todas las reseñas (admin o debug)
router.get('/', async (req, res) => {
  try {
    const resenas = await Resena.find()
      .populate('usuarioId', 'nombre foto')
      .populate('negocioId', 'nombre imagen');
    res.status(200).json(resenas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); 

// Obtener reseñas por ID de usuario
router.get('/usuario/:id', async (req, res) => {
  try {
    const resenas = await Resena.find({ usuarioId: req.params.id })
      .populate('negocioId', 'nombre direccion')
      .populate('usuarioId', 'nombre');
    res.status(200).json(resenas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener reseñas por ID de negocio (💡 Esta es la que usas en el detalle)
router.get('/negocio/:id', async (req, res) => {
  try {
    const resenas = await Resena.find({ negocioId: req.params.id })
      .populate('usuarioId', 'nombre ubicacion foto') // puedes ajustar qué campos quieres
      .populate('negocioId', 'nombre')
   

    if (!resenas || resenas.length === 0) {
      return res.status(404).json({ message: 'No se encontraron reseñas para este negocio' });
    }

    res.status(200).json(resenas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// ⚠️ ESTA RUTA DEBE IR DEBAJO para evitar conflicto con la anterior
router.get('/count/:negocioId', async (req, res) => {
  try {
    const total = await Resena.countDocuments({ negocioId: req.params.negocioId });
    res.json({ total });
  } catch (error) {
    console.error('Error al contar las reseñas:', error);
    res.status(500).json({ error: 'Error al contar las reseñas' });
  }
}); 

router.get('/negocio/:id/promedio', async (req, res) => {
  try {
    const { id } = req.params;
    const objectId = new mongoose.Types.ObjectId(id);

    const promedio = await Resena.aggregate([
      { $match: { negocio: objectId } },
      { $group: { _id: null, promedioEstrellas: { $avg: "$estrellas" } } }
    ]);

    res.json({ promedio: promedio[0]?.promedioEstrellas || 0 });
  } catch (error) {
    console.error("Error al calcular promedio de estrellas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


// Mostrar reseñas de los negocios de un cliente
router.get('/cliente/:clienteId', async (req, res) => {
  const { clienteId } = req.params;

  try {
    // 1. Buscar los negocios que le pertenecen al cliente
    const negocios = await Negocio.find({ clienteId: clienteId });

    // 2. Extraer los IDs de los negocios
    const negocioIds = negocios.map((negocio) => negocio._id);

    // 3. Buscar las reseñas que correspondan a esos negocios
    const resenas = await Resena.find({ negocioId: { $in: negocioIds } })
      .populate('usuarioId', 'nombre foto') 
      .populate('negocioId', 'nombre imagen'); 

    res.json(resenas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las reseñas del cliente' });
  }
});


// Obtener reseñas paginadas por ID de negocio
router.get('/negocio/:id', async (req, res) => {
  try {
    const negocioId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await Resena.countDocuments({ negocio: negocioId });

    const resenas = await Resena.find({ negocio: negocioId })
      .populate('usuario', 'nombre foto') // si tienes referencia al usuario
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // ordena por más recientes
      .exec();

    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      resenas,
    });
  } catch (error) {
    console.error('Error al obtener reseñas paginadas:', error);
    res.status(500).json({ mensaje: 'Error al obtener reseñas' });
  }
}); 



// GET /resenas?page=1&limit=5
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // página actual, default 1
    const limit = parseInt(req.query.limit) || 5; // cantidad por página, default 5
    const skip = (page - 1) * limit;

    // Traer reseñas recomendadas con rating >=4
    const filtro = { rating: { $gte: 4 } };

    const total = await Resena.countDocuments(filtro);
    const resenas = await Resena.find(filtro)
      .populate("usuarioId", "nombre foto ubicacion") // para que traiga datos del usuario
      .sort({ fecha: -1 }) // ordenar por fecha descendente
      .skip(skip)
      .limit(limit);

    res.json({
      total,
      pagina: page,
      totalPaginas: Math.ceil(total / limit),
      resenas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener reseñas" });
  }
});


// Obtener una reseña por ID
router.get('/:id', async (req, res) => {
  try {
    const resena = await Resena.findById(req.params.id);
    if (!resena) return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    res.json(resena);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la reseña', error });
  }
}); 



// PUT /api/resenas/:id -> Actualizar reseña
router.put("/:id", upload.array("foto"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      negocioId,
      texto,
      rating,
      titulo,
      usuarioId,
      fotosAEliminar = [],
    } = req.body;

    // Buscar la reseña
    const resena = await Resena.findById(id);
    if (!resena) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    // Validar que el usuario sea dueño
    if (resena.usuarioId.toString() !== usuarioId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Normalizar fotosAEliminar a array
    let fotosEliminarArray = [];
    if (typeof fotosAEliminar === "string") {
      fotosEliminarArray = [fotosAEliminar];
    } else if (Array.isArray(fotosAEliminar)) {
      fotosEliminarArray = fotosAEliminar;
    }

    // Eliminar archivos físicos y remover de DB
    fotosEliminarArray.forEach((fotoNombre) => {
      const filePath = path.join(__dirname, "..", "uploads", fotoNombre);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      resena.foto = resena.foto.filter((f) => !f.includes(fotoNombre));
    });

    // Agregar nuevas fotos subidas
    if (req.files && req.files.length > 0) {
      const nuevasFotos = req.files.map((file) => "uploads/" + file.filename);
      resena.foto = [...resena.foto, ...nuevasFotos];
    }

    // Actualizar otros campos
    resena.negocioId = negocioId;
    resena.texto = texto;
    resena.rating = Number(rating);
    resena.titulo = titulo;

    await resena.save();

    res.json({ message: "Reseña actualizada correctamente", resena });
  } catch (error) {
    console.error("Error al actualizar reseña:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}); 
/*
const path = require("path");
const fs = require("fs");*/

router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id; // Extraído del token

    const resena = await Resena.findById(id);
    if (!resena) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    // Validar que el usuario sea el autor de la reseña
    if (resena.usuarioId.toString() !== usuarioId) {
      return res.status(403).json({ message: "No autorizado para eliminar esta reseña" });
    }

    // Eliminar fotos físicas asociadas
    if (resena.foto && resena.foto.length > 0) {
      resena.foto.forEach((fotoPath) => {
        const filePath = path.join(__dirname, "..", fotoPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await resena.deleteOne();

    res.json({ message: "Reseña eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar reseña:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});



module.exports = router;