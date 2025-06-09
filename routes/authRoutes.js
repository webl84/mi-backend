router.post('/login', async (req, res) => {
    const { email, contraseña } = req.body;
  
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    }
  
    const contrasenaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contrasenaValida) {
      return res.status(400).json({ message: 'Credenciales incorrectas.' });
    }
  
    res.status(200).json({ message: 'Login exitoso.' });
  });
  