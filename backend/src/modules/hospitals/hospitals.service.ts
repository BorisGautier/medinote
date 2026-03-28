import Hospital from '../../models/Hospital.model';
import Doctor from '../../models/Doctor.model';
import { AppError } from '../../middlewares/errorHandler';

interface HospitalFilters {
  city?: string;
  region?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getHospitalsService = async (filters: HospitalFilters) => {
  const { city, region, type, search, page = 1, limit = 12 } = filters;
  const query: Record<string, unknown> = { isActive: true };

  if (city) query.city = new RegExp(city, 'i');
  if (region) query.region = new RegExp(region, 'i');
  if (type) query.type = type;
  if (search) query.$text = { $search: search };

  const skip = (page - 1) * limit;
  const [hospitals, total] = await Promise.all([
    Hospital.find(query).skip(skip).limit(limit).sort({ name: 1 }),
    Hospital.countDocuments(query),
  ]);

  return {
    hospitals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
    },
  };
};

export const getHospitalByIdService = async (id: string) => {
  const hospital = await Hospital.findById(id);
  if (!hospital || !hospital.isActive) throw new AppError('Hôpital introuvable.', 404);
  return hospital;
};

export const getHospitalDoctorsService = async (
  hospitalId: string,
  specialtyId?: string,
  page = 1,
  limit = 12
) => {
  await getHospitalByIdService(hospitalId);
  const query: Record<string, unknown> = { hospitals: hospitalId, isActive: true };
  if (specialtyId) query.specialties = specialtyId;

  const skip = (page - 1) * limit;
  const [doctors, total] = await Promise.all([
    Doctor.find(query)
      .populate('specialties', 'name slug icon')
      .populate('hospitals', 'name city')
      .skip(skip)
      .limit(limit)
      .sort({ 'rating.average': -1 }),
    Doctor.countDocuments(query),
  ]);

  return {
    doctors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const createHospitalService = async (data: Partial<typeof Hospital.prototype>) => {
  const hospital = await Hospital.create(data);
  return hospital;
};

export const updateHospitalService = async (id: string, data: Record<string, unknown>) => {
  const hospital = await Hospital.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!hospital) throw new AppError('Hôpital introuvable.', 404);
  return hospital;
};

export const deleteHospitalService = async (id: string) => {
  const hospital = await Hospital.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!hospital) throw new AppError('Hôpital introuvable.', 404);
  return hospital;
};
