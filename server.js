const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser"); 
const usuariosRoutes = require('./routes/usuarios'); // Asegúrate de la ruta correcta
const negociosRoutes = require('./routes/negocios');

const categoriaRoutes = require('./routes/categorias');
const productoRoutes = require('./routes/productos');
require("dotenv").config();

const resenasRoutes = require('./routes/resenas');


const app = express();
const sugerenciasRoutes = require("./routes/sugerencias");
app.use("/api/sugerencias", sugerenciasRoutes);
app.use(
  cors({
    origin: "https://mi-frontend-w0yb.onrender.com",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use('/api/resenas', resenasRoutes);

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/resenas_lima")
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error de conexión:", err));

// Rutas
app.use("/usuarios", require("./routes/usuarios"));
/*app.use("/api/negocios", require("./routes/negocios"));*/
/*app.use("/api/resenas", require("./routes/resenas")); */
app.use("/api/upload", require("./routes/upload")); 
app.use("/api/usuarios", require("./routes/usuarios")); 

// Usar rutas
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);

app.use('/api/negocios', negociosRoutes); 


app.use('/uploads', express.static('uploads'));

const path = require("path");

// Servir la carpeta 'uploads' como archivos públicos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Verificación de autenticación
app.get("/api/verify", (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ authenticated: false });
    res.json({ authenticated: true, user });
  });
});

// Logout
app.post("/api/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ message: "Sesión cerrada" });
}); 


const negocioRoutes = require('./routes/negocios');
app.use('/api/negocios', negocioRoutes);




/*
app.get('/api/resenas/:id', async (req, res) => {
  const resena = await Resena.findById(req.params.id);
  if (!resena) return res.status(404).json({ error: "No encontrada" });
  res.json(resena);
});*/



const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
