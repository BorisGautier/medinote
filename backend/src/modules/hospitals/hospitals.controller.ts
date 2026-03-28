import { Request, Response, NextFunction } from 'express';
import * as service from './hospitals.service';

export const getHospitals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await service.getHospitalsService({
      city: req.query.city as string,
      region: req.query.region as string,
      type: req.query.type as string,
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 12,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hospital = await service.getHospitalByIdService(req.params.id as string);
    res.status(200).json({ success: true, data: { hospital } });
  } catch (err) { next(err); }
};

export const getHospitalDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await service.getHospitalDoctorsService(
      req.params.id as string,
      req.query.specialtyId as string,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 12
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const createHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hospital = await service.createHospitalService(req.body);
    res.status(201).json({ success: true, message: 'Hôpital créé.', data: { hospital } });
  } catch (err) { next(err); }
};

export const updateHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hospital = await service.updateHospitalService(req.params.id as string, req.body);
    res.status(200).json({ success: true, data: { hospital } });
  } catch (err) { next(err); }
};

export const deleteHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await service.deleteHospitalService(req.params.id as string);
    res.status(200).json({ success: true, message: 'Hôpital désactivé.' });
  } catch (err) { next(err); }
};
