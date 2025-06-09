const nodemailer = require("nodemailer");

// Configuración para Mailtrap
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587, // Puedes usar 587 o 2525 si prefieres otro puerto
  auth: {
    user: "51f044600a75a3", // Tu usuario de Mailtrap
    pass: "7b16dfe24a409f", // Tu contraseña de Mailtrap
  },
  tls: {
    rejectUnauthorized: false, // Esto es opcional dependiendo de tu configuración
  },
});

const enviarCorreo = async (destinatario, asunto, mensaje) => {
  const mailOptions = {
    from: '"Lima Review" <no-reply@limareview.com>',
    to: destinatario, // usa el correo real del usuario que pidió recuperar
    subject: asunto,
    html: mensaje,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado: %s", info.messageId);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
};

module.exports = enviarCorreo;
