import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from '../config/redis';
import nodemailer from 'nodemailer';
import logger from '../config/logger';
import { confirmationTemplate } from '../templates/emails/confirmation';
import { reminderTemplate, cancellationTemplate } from '../templates/emails/reminder';

export type EmailJobType = 'appointment.confirmed' | 'appointment.reminder' | 'appointment.cancelled';

const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

export const emailQueue = new Queue('email', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const addEmailToQueue = async (type: EmailJobType, data: Record<string, unknown>) => {
  await emailQueue.add(type, data, { priority: type === 'appointment.confirmed' ? 1 : 2 });
  logger.info(`Email job added to queue: ${type}`);
};

// Transporter Nodemailer
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"MediNote" <${process.env.SMTP_FROM || 'noreply@medinote.borisgauty.com'}>`,
    to,
    subject,
    html,
  });
};

// Worker de traitement
export const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    const { appointment, patient } = job.data;

    switch (job.name as EmailJobType) {
      case 'appointment.confirmed': {
        const patientEmail = patient?.email || appointment?.patientId?.email;
        if (patientEmail) {
          await sendEmail(
            patientEmail,
            `✅ Rendez-vous confirmé — ${new Date(appointment.scheduledAt).toLocaleDateString('fr-FR')}`,
            confirmationTemplate(appointment)
          );
        }
        // Email au médecin
        const doctorUser = appointment?.doctorId?.userId;
        if (doctorUser?.email) {
          await sendEmail(
            doctorUser.email,
            `📅 Nouveau rendez-vous — ${new Date(appointment.scheduledAt).toLocaleDateString('fr-FR')}`,
            confirmationTemplate(appointment, 'doctor')
          );
        }
        logger.info(`Confirmation email sent for appointment ${appointment.reference}`);
        break;
      }

      case 'appointment.reminder': {
        const email = appointment?.patientId?.email;
        if (email) {
          await sendEmail(
            email,
            `⏰ Rappel : votre RDV demain — ${new Date(appointment.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
            reminderTemplate(appointment)
          );
          logger.info(`Reminder email sent for appointment ${appointment.reference}`);
        }
        break;
      }

      case 'appointment.cancelled': {
        const email = appointment?.patientId?.email;
        if (email) {
          await sendEmail(
            email,
            `❌ Rendez-vous annulé — ${appointment.reference}`,
            cancellationTemplate(appointment)
          );
          logger.info(`Cancellation email sent for appointment ${appointment.reference}`);
        }
        break;
      }
    }
  },
  { connection, concurrency: 5 }
);

emailWorker.on('completed', (job) => logger.info(`Email job ${job.id} completed`));
emailWorker.on('failed', (job, err) => logger.error(`Email job ${job?.id} failed:`, err));
