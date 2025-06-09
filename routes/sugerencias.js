const express = require("express");
const router = express.Router();
const Sugerencia = require("../models/Sugerencia");

router.post("/", async (req, res) => {
  try {
    const nuevaSugerencia = new Sugerencia({
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
    });
    await nuevaSugerencia.save();
    res.status(201).json({ message: "Sugerencia guardada con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar la sugerencia", error });
  }
});

module.exports = router;
