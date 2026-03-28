import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
`;

const headerStyle = `
  background: linear-gradient(135deg, #1a56db 0%, #7e3af2 100%);
  padding: 32px 24px;
  text-align: center;
  border-radius: 12px 12px 0 0;
`;

const cardStyle = `
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px 24px;
  margin: 16px 0;
  border-left: 4px solid #1a56db;
`;

const buttonStyle = `
  display: inline-block;
  background: linear-gradient(135deg, #1a56db, #7e3af2);
  color: white;
  padding: 14px 28px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  margin: 8px;
`;

export const confirmationTemplate = (appointment: any, recipient: 'patient' | 'doctor' = 'patient'): string => {
  const doctor = appointment.doctorId;
  const hospital = appointment.hospitalId;
  const scheduledDate = new Date(appointment.scheduledAt);

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Confirmation RDV</title></head>
<body style="margin:0;padding:16px;background:#f1f5f9;">
<div style="${baseStyle}">
  <div style="${headerStyle}">
    <h1 style="color:white;margin:0;font-size:24px;">🏥 MediNote</h1>
    <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">
      ${recipient === 'patient' ? '✅ Votre rendez-vous est confirmé !' : '📅 Nouveau rendez-vous reçu'}
    </p>
  </div>

  <div style="padding:24px;">
    <p style="color:#374151;font-size:16px;">
      ${recipient === 'patient' ? `Bonjour,` : `Bonjour ${doctor?.title} ${doctor?.lastName},`}
    </p>
    <p style="color:#6b7280;">
      ${recipient === 'patient'
        ? 'Votre rendez-vous médical a bien été enregistré. Voici le récapitulatif :'
        : 'Un nouveau patient a pris rendez-vous avec vous :'}
    </p>

    <div style="${cardStyle}">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#6b7280;width:40%;">👨‍⚕️ Médecin</td><td style="color:#111827;font-weight:600;">${doctor?.title} ${doctor?.firstName} ${doctor?.lastName}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">🏥 Établissement</td><td style="color:#111827;">${hospital?.name} — ${hospital?.city}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">🗓️ Date</td><td style="color:#111827;font-weight:600;">${format(scheduledDate, 'EEEE d MMMM yyyy', { locale: fr })}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">⏱️ Heure</td><td style="color:#111827;font-weight:600;">${format(scheduledDate, 'HH:mm')}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">📋 Motif</td><td style="color:#111827;">${appointment.reason}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">🔖 Référence</td><td style="color:#1a56db;font-weight:700;font-family:monospace;">${appointment.reference}</td></tr>
      </table>
    </div>

    ${recipient === 'patient' ? `
    <div style="background:#fff7ed;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #f59e0b;">
      <p style="margin:0;color:#92400e;font-size:14px;">
        ⚠️ <strong>Annulation :</strong> Possible jusqu'à 2h avant le rendez-vous depuis votre espace patient.
      </p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.FRONTEND_URL}/dashboard" style="${buttonStyle}">🗓️ Gérer mon RDV</a>
    </div>` : ''}

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="color:#9ca3af;font-size:12px;text-align:center;">
      MediNote — Plateforme de prise de rendez-vous médicaux<br>
      <a href="${process.env.FRONTEND_URL}" style="color:#1a56db;">medinote.borisgauty.com</a>
    </p>
  </div>
</div>
</body>
</html>`;
};
