import Specialty from '../../models/Specialty.model';
import { AppError } from '../../middlewares/errorHandler';

export const getSpecialtiesService = async () => {
  return Specialty.find({ isActive: true }).sort({ name: 1 });
};

export const createSpecialtyService = async (data: Record<string, unknown>) => {
  return Specialty.create(data);
};

export const updateSpecialtyService = async (id: string, data: Record<string, unknown>) => {
  const specialty = await Specialty.findByIdAndUpdate(id, data, { new: true });
  if (!specialty) throw new AppError('Spécialité introuvable.', 404);
  return specialty;
};

export const deleteSpecialtyService = async (id: string) => {
  const specialty = await Specialty.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!specialty) throw new AppError('Spécialité introuvable.', 404);
};
