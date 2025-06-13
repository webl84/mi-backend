const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const usuarioController = require("../controllers/usuarioController");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// === Configuración de Multer para subir imágenes ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // La carpeta donde se almacenarán las fotos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Nombrar el archivo
  },
});

const upload = multer({ storage });

// === Login ===
router.post("/login", async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) return res.status(401).json({ message: "Contraseña incorrecta" });

    const payload = {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol, // ✅ AÑADIR ESTO
    };
    const token = jwt.sign(
      { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }, // Incluye el rol en el payload
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

res.cookie("auth_token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "None", // 👈 OBLIGATORIO para Render
  maxAge: 3600000,
});

    res.cookie("usuarioId", usuario._id.toString(), {
      httpOnly: false,
      maxAge: 3600000,
    });


    // ✅ Devolver el rol también
    res.status(200).json({ 
      message: "Login exitoso", 
      token, // <-- Devuelves el token
      usuarioId: usuario._id,
      rol: usuario.rol // <-- agregado aquí
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// === Registro ===
router.post("/register", async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  try {
    const existente = await Usuario.findOne({ email });
    if (existente) return res.status(400).json({ message: "El usuario ya existe." });

    const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      contraseña: contraseñaEncriptada,
    });

    await nuevoUsuario.save();
    res.status(201).json({ message: "Usuario registrado con éxito." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// === Recuperar contraseña ===
router.post("/recuperar-contrasena", usuarioController.recuperarContrasena);

// === Establecer nueva contraseña ===
router.post("/nueva-contrasena", async (req, res) => {
  const { token, nuevaContrasena } = req.body;

  try {
    const usuario = await Usuario.findOne({ recuperacionToken: token });
    if (!usuario) return res.status(404).json({ message: "Token no válido o expirado" });
    if (usuario.recuperacionTokenExpiracion < Date.now())
      return res.status(400).json({ message: "El token ha expirado" });

    const nuevaContraseñaEncriptada = await bcrypt.hash(nuevaContrasena, 10);
    usuario.contraseña = nuevaContraseñaEncriptada;
    usuario.recuperacionToken = undefined;
    usuario.recuperacionTokenExpiracion = undefined;

    await usuario.save();
    res.status(200).json({ message: "Contraseña cambiada con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar la contraseña" });
  }
});

// === Perfil de usuario ===
// Ruta para actualizar el perfil del usuario (nombre, correo y foto)
router.put('/:id/actualizarPerfil', upload.single('foto'), usuarioController.actualizarPerfil);

// Obtener perfil
router.get("/perfil/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el perfil del usuario" });
  }
}); 

module.exports = router;
