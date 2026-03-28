import { Request, Response, NextFunction } from 'express';
import * as service from './doctors.service';
import { addDays } from 'date-fns';

export const getDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await service.getDoctorsService({
      specialtyId: req.query.specialtyId as string,
      hospitalId: req.query.hospitalId as string,
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 12,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await service.getDoctorByIdService(req.params.id);
    res.status(200).json({ success: true, data: { doctor } });
  } catch (err) { next(err); }
};

export const getDoctorAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : addDays(new Date(), 7);
    const result = await service.getDoctorAvailabilityService(
      req.params.id,
      startDate,
      endDate,
      req.query.hospitalId as string
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const createDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await service.createDoctorService(req.body);
    res.status(201).json({ success: true, data: { doctor } });
  } catch (err) { next(err); }
};

export const updateDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await service.updateDoctorService(req.params.id, req.body);
    res.status(200).json({ success: true, data: { doctor } });
  } catch (err) { next(err); }
};

export const setAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const avails = await service.setAvailabilityService(req.params.id, req.body.availabilities);
    res.status(200).json({ success: true, data: { availabilities: avails } });
  } catch (err) { next(err); }
};
