const express = require('express');
const Categoria = require('../models/Categoria');
const Negocio = require('../models/Negocio');
const router = express.Router();

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener detalle de una categoría y los negocios asociados
router.get('/:id', async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    const negocios = await Negocio.find({ categoria: categoria._id });

    res.status(200).json({
      categoria,
      negocios,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la categoría', error: error.message });
  }
});

module.exports = router;
