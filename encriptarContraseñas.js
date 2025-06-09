const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/Usuario'); // Asegúrate de que esta ruta apunte a tu modelo de Usuario

// Conéctate a la base de datos
mongoose.connect('mongodb://localhost:27017/resenas_lima', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error de conexión:', err));

// Función para encriptar las contraseñas
const encriptarContraseñas = async () => {
  try {
    // Buscar todos los usuarios
    const usuarios = await Usuario.find();

    for (let usuario of usuarios) {
      // Si la contraseña está en texto plano, la encriptamos
      if (!usuario.contraseña.startsWith('$2a$')) { // Verifica si ya está encriptada
        const contraseñaEncriptada = await bcrypt.hash(usuario.contraseña, 10);
        usuario.contraseña = contraseñaEncriptada;
        await usuario.save();
        console.log(`Contraseña de ${usuario.nombre} encriptada con éxito.`);
      }
    }

    console.log('Proceso de encriptación de contraseñas completado.');
    process.exit(); // Salir del proceso cuando termine
  } catch (error) {
    console.error('Error al encriptar las contraseñas:', error);
  }
};

encriptarContraseñas();
