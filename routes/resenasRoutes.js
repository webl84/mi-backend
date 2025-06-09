const express = require("express");
const router = express.Router();
const { crearResena } = require("../controllers/CrearResena");

// Ruta para crear una nueva reseña
router.post("/resenas", crearResena); 



module.exports = router;
