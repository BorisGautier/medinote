import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const reminderTemplate = (appointment: any): string => {
  const doctor = appointment.doctorId;
  const hospital = appointment.hospitalId;
  const scheduledDate = new Date(appointment.scheduledAt);

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Rappel RDV</title></head>
<body style="margin:0;padding:16px;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#059669,#0d9488);padding:32px 24px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:24px;">🏥 MediNote</h1>
    <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">⏰ Rappel : vous avez un rendez-vous demain</p>
  </div>
  <div style="padding:24px;">
    <p style="color:#374151;font-size:16px;">Bonjour,</p>
    <p style="color:#6b7280;">Nous vous rappelons votre rendez-vous médical prévu <strong>demain</strong> :</p>
    <div style="background:#f0fdf4;border-radius:8px;padding:20px 24px;border-left:4px solid #059669;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;">👨‍⚕️ Médecin</td><td style="color:#111827;font-weight:600;">${doctor?.title} ${doctor?.firstName} ${doctor?.lastName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">🏥 Lieu</td><td style="color:#111827;">${hospital?.name}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">📍 Adresse</td><td style="color:#111827;">${hospital?.address}, ${hospital?.city}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">⏰ Heure</td><td style="color:#059669;font-weight:700;font-size:18px;">${format(scheduledDate, 'HH:mm')}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">🔖 Référence</td><td style="color:#374151;font-family:monospace;">${appointment.reference}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
        ✅ Confirmer ma présence
      </a>
      &nbsp;
      <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;background:#fee2e2;color:#dc2626;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
        ❌ Annuler
      </a>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:12px;text-align:center;">MediNote — <a href="${process.env.FRONTEND_URL}" style="color:#059669;">medinote.borisgauty.com</a></p>
  </div>
</div>
</body>
</html>`;
};

export const cancellationTemplate = (appointment: any): string => {
  const doctor = appointment.doctorId;
  const scheduledDate = new Date(appointment.scheduledAt);

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Annulation RDV</title></head>
<body style="margin:0;padding:16px;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#dc2626,#9333ea);padding:32px 24px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:24px;">🏥 MediNote</h1>
    <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">❌ Rendez-vous annulé</p>
  </div>
  <div style="padding:24px;">
    <p style="color:#374151;">Votre rendez-vous a été annulé.</p>
    <div style="background:#fef2f2;border-radius:8px;padding:20px 24px;border-left:4px solid #dc2626;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;">Médecin</td><td style="color:#111827;">${doctor?.title} ${doctor?.firstName} ${doctor?.lastName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="color:#dc2626;text-decoration:line-through;">${format(scheduledDate, 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Référence</td><td style="color:#374151;font-family:monospace;">${appointment.reference}</td></tr>
        ${appointment.cancelReason ? `<tr><td style="padding:6px 0;color:#6b7280;">Motif</td><td style="color:#374151;">${appointment.cancelReason}</td></tr>` : ''}
      </table>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.FRONTEND_URL}/hospitals" style="display:inline-block;background:linear-gradient(135deg,#1a56db,#7e3af2);color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
        🔍 Reprendre un rendez-vous
      </a>
    </div>
    <p style="color:#9ca3af;font-size:12px;text-align:center;">MediNote — <a href="${process.env.FRONTEND_URL}" style="color:#1a56db;">medinote.borisgauty.com</a></p>
  </div>
</div>
</body>
</html>`;
};
