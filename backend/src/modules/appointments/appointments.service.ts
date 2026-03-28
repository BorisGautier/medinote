import Appointment from '../../models/Appointment.model';
import Doctor from '../../models/Doctor.model';
import User from '../../models/User.model';
import { AppError } from '../../middlewares/errorHandler';
import { lockSlot, isSlotLocked } from '../../config/redis';
import { addEmailToQueue } from '../../queues/email.queue';
import logger from '../../config/logger';

interface CreateAppointmentData {
  doctorId: string;
  hospitalId: string;
  scheduledAt: string;
  reason: string;
  patientId: string;
}

export const createAppointmentService = async (data: CreateAppointmentData) => {
  const { doctorId, hospitalId, scheduledAt, reason, patientId } = data;
  const slotDate = new Date(scheduledAt);

  if (slotDate <= new Date()) throw new AppError('Ce créneau est déjà passé.', 400);
  if (slotDate < new Date(Date.now() + 60 * 60 * 1000))
    throw new AppError('Réservez au moins 1h à l\'avance.', 400);

  // Vérifier verrou Redis (10 min)
  const locked = await isSlotLocked(doctorId, scheduledAt);
  if (locked) throw new AppError('Ce créneau est en cours de réservation. Réessayez.', 409);

  // Poser le verrou
  const gotLock = await lockSlot(doctorId, scheduledAt, patientId, 600);
  if (!gotLock) throw new AppError('Ce créneau vient d\'être réservé.', 409);

  try {
    // Vérifier en BDD qu'aucun RDV confirmé n'existe
    const existing = await Appointment.findOne({
      doctorId,
      scheduledAt: slotDate,
      status: { $in: ['confirmed', 'pending'] },
    });
    if (existing) throw new AppError('Ce créneau n\'est plus disponible.', 409);

    // Récupérer durée du médecin (via ses availabilities)
    const doctor = await Doctor.findById(doctorId).populate('hospitals');
    if (!doctor) throw new AppError('Médecin introuvable.', 404);

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      hospitalId,
      scheduledAt: slotDate,
      duration: 30,
      reason,
      status: 'confirmed',
    });

    // Populate pour l'email
    const populated = await Appointment.findById(appointment.id)
      .populate('patientId', 'email')
      .populate({
        path: 'doctorId',
        populate: { path: 'specialties', select: 'name' },
      })
      .populate('hospitalId', 'name address city phone');

    // Envoyer email de confirmation en queue
    await addEmailToQueue('appointment.confirmed', {
      appointment: populated,
      patient: await User.findById(patientId).select('email'),
    });

    logger.info(`Appointment created: ${appointment.reference} for patient ${patientId}`);
    return populated;
  } catch (error) {
    throw error;
  }
};

export const getPatientAppointmentsService = async (patientId: string, status?: string) => {
  const query: Record<string, unknown> = { patientId };
  if (status) query.status = status;

  return Appointment.find(query)
    .populate({
      path: 'doctorId',
      select: 'title firstName lastName photoUrl consultationFee',
      populate: { path: 'specialties', select: 'name icon' },
    })
    .populate('hospitalId', 'name city address')
    .sort({ scheduledAt: -1 });
};

export const getDoctorAppointmentsService = async (doctorId: string, date?: string) => {
  const query: Record<string, unknown> = { doctorId, status: { $in: ['confirmed', 'completed'] } };
  if (date) {
    const d = new Date(date);
    query.scheduledAt = {
      $gte: new Date(d.setHours(0, 0, 0, 0)),
      $lte: new Date(d.setHours(23, 59, 59, 999)),
    };
  }
  return Appointment.find(query)
    .populate('patientId', 'email')
    .sort({ scheduledAt: 1 });
};

export const cancelAppointmentService = async (
  appointmentId: string,
  userId: string,
  userRole: string,
  cancelReason?: string
) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new AppError('Rendez-vous introuvable.', 404);
  if (appointment.status === 'cancelled') throw new AppError('Déjà annulé.', 400);
  if (appointment.status === 'completed') throw new AppError('Rendez-vous terminé, impossible d\'annuler.', 400);

  const isOwner = appointment.patientId.toString() === userId;
  const isDoc = userRole === 'doctor';
  const isAdmin = ['super_admin', 'hospital_admin'].includes(userRole);
  if (!isOwner && !isDoc && !isAdmin) throw new AppError('Non autorisé.', 403);

  // Délai minimum : 2h avant le RDV
  const twoHoursBefore = new Date(appointment.scheduledAt.getTime() - 2 * 60 * 60 * 1000);
  if (!isAdmin && new Date() > twoHoursBefore)
    throw new AppError('Annulation impossible moins de 2h avant le rendez-vous.', 400);

  appointment.status = 'cancelled';
  appointment.cancelledBy = isOwner ? 'patient' : isDoc ? 'doctor' : 'admin';
  appointment.cancelReason = cancelReason || 'Non précisé';
  await appointment.save();

  // Email annulation
  await addEmailToQueue('appointment.cancelled', { appointment });

  logger.info(`Appointment ${appointment.reference} cancelled by ${userRole} ${userId}`);
  return appointment;
};
