const Usuario = require('../models/Usuario');
const crypto = require('crypto');
const enviarCorreo = require('../utils/emailSender');

// Función para generar un token de recuperación
const generarTokenRecuperacion = () => {
  return crypto.randomBytes(20).toString('hex'); // Token único
};

// Función para recuperar la contraseña
const recuperarContrasena = async (req, res) => {  // Aquí eliminé el punto innecesario
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(404).json({ message: 'Correo electrónico no encontrado' });
    }

    // Generar un token de recuperación
    const token = generarTokenRecuperacion();

    // Guardar el token en el usuario (esto lo usaremos para validar el enlace de recuperación)
    usuario.recuperacionToken = token;
    usuario.recuperacionTokenExpiracion = Date.now() + 3600000; // Token válido por 1 hora
    await usuario.save();

    // Enviar el correo con el enlace de recuperación
    const enlaceRecuperacion = `http://localhost:5173/recuperar-contrasena/${token}`;

    await enviarCorreo(
      usuario.email,
      'Recuperación de contraseña',
      `<p>Haz clic en el siguiente enlace para recuperar tu contraseña:</p>
      <a href="${enlaceRecuperacion}" target="_blank">${enlaceRecuperacion}</a>
      <p>Este enlace expirará en 1 hora.</p>`,
    );

    res.status(200).json({ message: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar el correo de recuperación' });
  }
};

const actualizarPerfil = async (req, res) => {
  const { id } = req.params;
  const { nombre, email } = req.body;
  let fotoUrl = req.body.foto;  // Para la foto cargada manualmente

  // Verifica si se subió una foto
  if (req.file) {
    fotoUrl = 'uploads/' + req.file.filename; // Foto subida
  }

  // Si hay un avatar, usamos su URL en lugar de la foto subida
  if (req.body.avatar) {
    fotoUrl = req.body.avatar;  // URL del avatar elegido
  }

  try {
    // Actualiza el usuario con el nuevo nombre, email y foto (ya sea foto subida o avatar)
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      { nombre, email, foto: fotoUrl },
      { new: true }
    );
    res.json(usuarioActualizado);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};




// Exportar las funciones
module.exports = {
  recuperarContrasena,
  actualizarPerfil
};
