export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'hospital_admin' | 'super_admin';
  firstName?: string;
  lastName?: string;
}

export interface Hospital {
  _id: string;
  name: string;
  type: 'public' | 'private' | 'clinic' | 'university';
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  photoUrl?: string;
  description?: string;
  isActive: boolean;
}

export interface Specialty {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
}

export interface Doctor {
  _id: string;
  title: string;
  firstName: string;
  lastName: string;
  fullName: string;
  licenseNumber: string;
  bio?: string;
  photoUrl?: string;
  consultationFee: number;
  languages: string[];
  specialties: Specialty[];
  hospitals: Hospital[];
  rating: { average: number; count: number };
  isActive: boolean;
  isVerified: boolean;
}

export interface TimeSlot {
  datetime: string;
  available: boolean;
  hospitalId: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Appointment {
  _id: string;
  reference: string;
  patientId: string | User;
  doctorId: string | Doctor;
  hospitalId: string | Hospital;
  scheduledAt: string;
  duration: number;
  reason: string;
  status: AppointmentStatus;
  cancelledBy?: string;
  cancelReason?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
}
