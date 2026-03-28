import { Request, Response, NextFunction } from 'express';
import * as service from './appointments.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await service.createAppointmentService({
      ...req.body,
      patientId: req.user!.id,
    });
    res.status(201).json({
      success: true,
      message: 'Rendez-vous confirmé ! Un email de confirmation vous a été envoyé.',
      data: { appointment },
    });
  } catch (err) { next(err); }
};

export const getMyAppointments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointments = await service.getPatientAppointmentsService(
      req.user!.id,
      req.query.status as string
    );
    res.status(200).json({ success: true, data: { appointments } });
  } catch (err) { next(err); }
};

export const getDoctorAppointments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointments = await service.getDoctorAppointmentsService(
      req.params.doctorId,
      req.query.date as string
    );
    res.status(200).json({ success: true, data: { appointments } });
  } catch (err) { next(err); }
};

export const cancelAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await service.cancelAppointmentService(
      req.params.id,
      req.user!.id,
      req.user!.role,
      req.body.cancelReason
    );
    res.status(200).json({
      success: true,
      message: 'Rendez-vous annulé.',
      data: { appointment },
    });
  } catch (err) { next(err); }
};
