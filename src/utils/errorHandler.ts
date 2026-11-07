import axios from 'axios'

// TODO 5.1 (Errores): convierta cualquier error en un mensaje legible en español.
// Use axios.isAxiosError(error). Sin error.response: 'Sin conexión...'. Con respuesta, según
// error.response.status: 400, 401, 403, 404 (puede usar data.message del servidor) y 500 o más.
// Cualquier otro caso: un mensaje genérico. Se usa en los toasts y en la card de error.
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    if (!error.response) {
      return 'Sin conexión con el servidor. Verifique su conexión e inténtelo de nuevo.'
    }

    const serverMessage = error.response.data?.message
    const message = typeof serverMessage === 'string' ? serverMessage.toLowerCase() : ''

    switch (error.response.status) {
      case 400:
        if (message.includes('invalid credentials')) return 'El usuario o la contraseña son incorrectos.'
        return 'La solicitud no es válida. Revise los datos e inténtelo de nuevo.'
      case 401:
        if (message.includes('invalid credentials')) return 'El usuario o la contraseña son incorrectos.'
        return 'La sesión no es válida o ha expirado. Inicie sesión nuevamente.'
      case 403:
        return 'No tiene permiso para realizar esta acción.'
      case 404:
        return 'No se encontró el producto solicitado.'
      default:
        if (error.response.status >= 500) {
          return 'Ocurrió un error en el servidor. Inténtelo de nuevo más tarde.'
        }
        if (typeof serverMessage === 'string' && serverMessage.trim()) return serverMessage
    }
  }

  return 'Ocurrió un error'
}
