const path = require("path");
const Negocio = require("../models/Negocio");
const Resena = require("../models/Resena");
const Categoria = require("../models/Categoria");

exports.getAllNegocios = async (req, res) => {
  try {
    const negocios = await Negocio.find().populate("categoria");
    if (!negocios || negocios.length === 0) {
      return res.status(404).json({ message: "No se encontraron negocios" });
    }
    res.status(200).json(negocios);
  } catch (error) {
    console.error("Error al obtener los negocios:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getNegocioById = async (req, res) => {
  try {
    const negocio = await Negocio.findById(req.params.id).populate("categoria");
    if (!negocio) {
      return res.status(404).json({ message: "Negocio no encontrado" });
    }

    const totalResenas = await Resena.countDocuments({ negocio: negocio._id });
    const negocioConResenas = negocio.toObject();
    negocioConResenas.totalResenas = totalResenas;

    res.status(200).json(negocioConResenas);
  } catch (error) {
    console.error("Error al obtener negocio por ID:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Crear negocio con imágenes múltiples
exports.crearNegocio = async (req, res) => {
  try {
    const {
      nombre, direccion, telefono, categoria, descripcion,
      horario, lat, lng, estado, abierto,
      etiquetas, servicios, preguntas_comunidad,
    } = req.body;

    const imagen = req.files['imagen'] ? req.files['imagen'][0].path : null;
    const logo_imagen = req.files['logo_imagen'] ? req.files['logo_imagen'][0].path : null;
    const imagen_banner = req.files['imagen_banner']
      ? req.files['imagen_banner'].map(file => file.path)
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
    });

    await nuevoNegocio.save();
    res.status(201).json(nuevoNegocio);
  } catch (error) {
    console.error("Error al crear el negocio:", error);
    res.status(500).json({ mensaje: "Error al crear el negocio" });
  }
}; 

const obtenerNegociosPorCliente = async (req, res) => {
  try {
    // Verifica si el usuario tiene el rol "cliente"
    if (req.user.rol !== 'cliente') {
      return res.status(403).json({ mensaje: 'Acceso denegado, solo clientes pueden ver sus negocios' });
    }

    // Si el rol es correcto, se realiza la consulta
    const negocios = await Negocio.find({ clienteId: req.user.id });

    res.status(200).json(negocios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los negocios', error });
  }
}; 



const actualizarUbicacionNegocio = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;  // Cambié latitud y longitud por lat y lng para que coincidan con la BD

    // Validar que latitud y longitud sean números válidos
    if (
      typeof lat !== 'number' || typeof lng !== 'number' ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180
    ) {
      return res.status(400).json({ mensaje: 'Coordenadas fuera de rango válido' });
    }

    const negocioActualizado = await Negocio.findByIdAndUpdate(
      id,
      {
        ubicacion: { lat, lng }
      },
      { new: true, runValidators: true }
    );

    if (!negocioActualizado) {
      return res.status(404).json({ mensaje: 'Negocio no encontrado' });
    }

    res.json({ mensaje: 'Ubicación actualizada correctamente', negocio: negocioActualizado });

  } catch (error) {
    console.error('Error al actualizar la ubicación:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};




module.exports = { obtenerNegociosPorCliente,  actualizarUbicacionNegocio };