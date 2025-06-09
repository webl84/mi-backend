const mongoose = require('mongoose');
const Resena = require('./models/Resena'); // Asegúrate de que esta ruta sea correcta

mongoose.connect('mongodb://localhost:27017/reseñas_lima', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    const resenas = await Resena.find({});

    // Renombrar campos en cada reseña
    for (let resena of resenas) {
      resena.usuario = resena.usuarioId; // Renombrar de usuarioId a usuario
      resena.negocio = resena.negocioId; // Renombrar de negocioId a negocio
      resena.texto = resena.comentario; // Renombrar de comentario a texto
      resena.rating = resena.puntuacion; // Renombrar de puntuacion a rating
      resena.fecha = resena.creadoEn; // Renombrar de creadoEn a fecha

      // Eliminar los campos antiguos
      delete resena.usuarioId;
      delete resena.negocioId;
      delete resena.comentario;
      delete resena.puntuacion;
      delete resena.creadoEn;

      // Guardar los cambios
      await resena.save();
    }

    console.log('Campos renombrados y guardados correctamente.');
    mongoose.connection.close();
  })
  .catch(err => console.error(err));
