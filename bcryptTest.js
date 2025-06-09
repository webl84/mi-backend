// bcryptTest.js
const bcrypt = require('bcryptjs');

// La contraseña que vas a probar
const contraseñaOriginal = '123456';

// Encriptar la contraseña
bcrypt.hash(contraseñaOriginal, 10, (err, contraseñaEncriptada) => {
  if (err) {
    console.log('Error al encriptar:', err);
    return;
  }
  console.log('Contraseña encriptada:', contraseñaEncriptada);

  // Ahora vamos a comparar la contraseña original con la encriptada
  bcrypt.compare(contraseñaOriginal, contraseñaEncriptada, (err, result) => {
    if (err) {
      console.log('Error al comparar:', err);
      return;
    }

    if (result) {
      console.log('Las contraseñas coinciden.');
    } else {
      console.log('Las contraseñas no coinciden.');
    }
  });
});
