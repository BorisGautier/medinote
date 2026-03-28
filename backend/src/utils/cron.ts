import cron from 'node-cron';
import Appointment from '../models/Appointment.model';
import { addEmailToQueue } from '../queues/email.queue';
import logger from '../config/logger';
import { addHours, isBefore, isAfter, addDays } from 'date-fns';

// Chaque heure — envoyer rappels pour les RDV de demain
export const startReminderCron = () => {
  cron.schedule('0 * * * *', async () => {
    logger.info('[CRON] Running appointment reminder job...');
    try {
      const now = new Date();
      const tomorrow = addDays(now, 1);

      // Créneaux entre 23h et 25h à partir de maintenant (fenêtre 24h)
      const from = addHours(now, 23);
      const to = addHours(now, 25);

      const appointments = await Appointment.find({
        scheduledAt: { $gte: from, $lte: to },
        status: 'confirmed',
        reminderSent: false,
      })
        .populate('patientId', 'email')
        .populate({
          path: 'doctorId',
          select: 'title firstName lastName',
          populate: { path: 'userId', select: 'email' },
        })
        .populate('hospitalId', 'name address city');

      logger.info(`[CRON] Found ${appointments.length} appointments to remind`);

      for (const appointment of appointments) {
        await addEmailToQueue('appointment.reminder', { appointment });
        appointment.reminderSent = true;
        await appointment.save();
      }
    } catch (error) {
      logger.error('[CRON] Reminder job failed:', error);
    }
  });

  logger.info('✅ Appointment reminder CRON job started (every hour)');
};
