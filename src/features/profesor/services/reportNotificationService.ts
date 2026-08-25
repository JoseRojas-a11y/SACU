/**
 * Servicio de Notificaciones de Reportes vía Resend
 * Notifica a los administradores del sistema cuando un comentario o reseña es reportado.
 */

interface ReportNotificationPayload {
  reportId?: string
  reviewId: string
  reason: string
  commentText?: string
  authorTag?: string
  professorName?: string
  courseName?: string
  reportedAt?: string
}

export async function sendResendReportNotification(
  payload: ReportNotificationPayload
): Promise<{ success: boolean; message?: string }> {
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY
  const adminEmail = import.meta.env.VITE_ADMIN_REPORT_EMAIL || 'admin@sacu.pe'
  const timestamp = payload.reportedAt || new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })

  // Log informativo para auditoría local
  console.info('[SACU Resend] Preparando notificación de reporte:', {
    reviewId: payload.reviewId,
    reason: payload.reason,
    timestamp,
  })

  if (!resendApiKey) {
    console.warn(
      '[SACU Resend] Variable VITE_RESEND_API_KEY no configurada. El reporte fue guardado en la base de datos de Supabase. Configure la API key para recibir correos automáticos.'
    )
    return {
      success: true,
      message: 'Reporte guardado en Supabase (Simulación de envío por correo)',
    }
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #7c3aed, #4c1d95); padding: 24px; color: white;">
        <h2 style="margin: 0; font-size: 20px;">🚨 Alerta de Moderación - SACU</h2>
        <p style="margin: 6px 0 0 0; opacity: 0.85; font-size: 13px;">Se ha reportado un comentario en el Directorio de Docentes</p>
      </div>
      
      <div style="padding: 24px; color: #1e293b; background-color: #ffffff;">
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
          <strong style="color: #991b1b; display: block; font-size: 14px;">Motivo del reporte:</strong>
          <p style="margin: 4px 0 0 0; color: #b91c1c; font-size: 14px;">${payload.reason}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 140px;">Docente / Cátedra:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${payload.professorName || 'No especificado'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Curso:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${payload.courseName || 'No especificado'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Autor del comentario:</td>
            <td style="padding: 8px 0; color: #0f172a;">${payload.authorTag || 'Estudiante Anónimo'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">ID de la reseña:</td>
            <td style="padding: 8px 0; font-family: monospace; color: #475569;">${payload.reviewId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Fecha y hora:</td>
            <td style="padding: 8px 0; color: #0f172a;">${timestamp}</td>
          </tr>
        </table>

        ${
          payload.commentText
            ? `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
            <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 6px;">Contenido del comentario:</span>
            <p style="margin: 0; font-style: italic; color: #334155; font-size: 14px;">"${payload.commentText}"</p>
          </div>
        `
            : ''
        }

        <p style="font-size: 12px; color: #94a3b8; margin: 20px 0 0 0; text-align: center;">
          Este correo fue generado automáticamente por el sistema de moderación de SACU.
        </p>
      </div>
    </div>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SACU Moderación <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `[SACU] Reporte de Comentario: ${payload.reason}`,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.warn('[SACU Resend] Respuesta de error de Resend:', errBody)
      return { success: false, message: errBody }
    }

    const data = await response.json()
    console.info('[SACU Resend] Correo de reporte enviado con éxito a los administradores:', data.id)
    return { success: true, message: 'Correo enviado a administradores' }
  } catch (error) {
    console.error('[SACU Resend] Error al despachar correo vía Resend:', error)
    return { success: false, message: String(error) }
  }
}
