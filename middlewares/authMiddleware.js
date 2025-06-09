// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];  // Obtener el token del header

  if (!token) {
    return res.status(401).json({ mensaje: 'No autorizado, falta el token.' });
  }

  try {
    // Decodificar el token usando tu clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Usa la clave secreta adecuada

    req.user = decoded;  // Agregar la información del usuario decodificado al objeto `req.user`
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: 'Token inválido.' });
  }
};

module.exports = { verificarToken };
