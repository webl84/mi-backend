const express = require('express');
const Producto = require('../models/Producto');
const router = express.Router();

// Crear nuevo producto
router.post('/', async (req, res) => {
  try {
    const producto = new Producto(req.body);
    await producto.save();
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener todos los productos con categoría poblada
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find().populate('categoria'); // Poblamos la categoría
    res.status(200).json(productos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener un producto por ID con categoría poblada
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).populate('categoria'); // Poblamos la categoría
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
