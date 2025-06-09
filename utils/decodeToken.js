export const obtenerRolDesdeToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
  
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = atob(payloadBase64);
      const payload = JSON.parse(decodedPayload);
      return payload.rol;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  };
  