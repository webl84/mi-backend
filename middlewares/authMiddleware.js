const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // Leer el token desde la cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ mensaje: 'No autorizado, falta el token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: 'Token inválido.' });
  }
};

module.exports = { verificarToken };
