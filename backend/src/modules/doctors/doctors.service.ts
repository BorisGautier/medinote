import Doctor from '../../models/Doctor.model';
import Availability from '../../models/Availability.model';
import Appointment from '../../models/Appointment.model';
import { AppError } from '../../middlewares/errorHandler';
import { addMinutes, format, eachDayOfInterval } from 'date-fns';

interface DoctorFilters {
  specialtyId?: string;
  hospitalId?: string;
  search?: string;
  city?: string;
  page?: number;
  limit?: number;
}

export const getDoctorsService = async (filters: DoctorFilters) => {
  const { specialtyId, hospitalId, page = 1, limit = 12 } = filters;
  const query: Record<string, unknown> = { isActive: true };

  if (specialtyId) query.specialties = specialtyId;
  if (hospitalId) query.hospitals = hospitalId;

  const skip = (page - 1) * limit;
  const [doctors, total] = await Promise.all([
    Doctor.find(query)
      .populate('specialties', 'name slug icon')
      .populate('hospitals', 'name city')
      .skip(skip)
      .limit(limit)
      .sort({ 'rating.average': -1, firstName: 1 }),
    Doctor.countDocuments(query),
  ]);

  return { doctors, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getDoctorByIdService = async (id: string) => {
  const doctor = await Doctor.findById(id)
    .populate('specialties', 'name slug icon description')
    .populate('hospitals', 'name city address phone type photoUrl');
  if (!doctor || !doctor.isActive) throw new AppError('Médecin introuvable.', 404);
  return doctor;
};

export const getDoctorAvailabilityService = async (
  doctorId: string,
  startDate: Date,
  endDate: Date,
  hospitalId?: string
) => {
  const availabilities = await Availability.find({
    doctorId,
    isActive: true,
    ...(hospitalId && { hospitalId }),
  });

  if (!availabilities.length) return { slots: [] };

  // Créneaux déjà pris dans la plage
  const bookedAppointments = await Appointment.find({
    doctorId,
    scheduledAt: { $gte: startDate, $lte: endDate },
    status: { $in: ['confirmed', 'pending'] },
  }).select('scheduledAt duration');

  const bookedTimes = new Set(
    bookedAppointments.map((a) => format(a.scheduledAt, "yyyy-MM-dd'T'HH:mm"))
  );

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const allSlots: { datetime: string; available: boolean; hospitalId: string }[] = [];

  for (const day of days) {
    const dayOfWeek = day.getDay();
    const matchingAvails = availabilities.filter((a) => {
      if (a.dayOfWeek !== dayOfWeek) return false;
      if (a.validFrom && day < a.validFrom) return false;
      if (a.validUntil && day > a.validUntil) return false;
      if (a.exceptions.some((ex) => format(ex, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')))
        return false;
      return true;
    });

    for (const avail of matchingAvails) {
      const [startH, startM] = avail.startTime.split(':').map(Number);
      const [endH, endM] = avail.endTime.split(':').map(Number);

      let slotTime = new Date(day);
      slotTime.setHours(startH, startM, 0, 0);
      const slotEnd = new Date(day);
      slotEnd.setHours(endH, endM, 0, 0);

      while (slotTime < slotEnd) {
        const key = format(slotTime, "yyyy-MM-dd'T'HH:mm");
        // N'afficher que les créneaux futurs (min 1h d'avance)
        if (slotTime > addMinutes(new Date(), 60)) {
          allSlots.push({
            datetime: slotTime.toISOString(),
            available: !bookedTimes.has(key),
            hospitalId: avail.hospitalId.toString(),
          });
        }
        slotTime = addMinutes(slotTime, avail.slotDuration);
      }
    }
  }

  return { slots: allSlots };
};

export const createDoctorService = async (data: Record<string, unknown>) => {
  const doctor = await Doctor.create(data);
  return doctor;
};

export const updateDoctorService = async (id: string, data: Record<string, unknown>) => {
  const doctor = await Doctor.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('specialties', 'name slug icon')
    .populate('hospitals', 'name city');
  if (!doctor) throw new AppError('Médecin introuvable.', 404);
  return doctor;
};

export const setAvailabilityService = async (doctorId: string, data: Record<string, unknown>[]) => {
  // Remplacer toutes les disponibilités du médecin
  await Availability.deleteMany({ doctorId });
  const avails = await Availability.insertMany(data.map((d) => ({ ...d, doctorId })));
  return avails;
};
