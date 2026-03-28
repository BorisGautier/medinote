import mongoose, { Document, Schema, Types } from 'mongoose';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type CancelledBy = 'patient' | 'doctor' | 'admin';

export interface IAppointment extends Document {
  reference: string;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  hospitalId: Types.ObjectId;
  scheduledAt: Date;
  duration: number;
  reason: string;
  status: AppointmentStatus;
  cancelledBy?: CancelledBy;
  cancelReason?: string;
  doctorNotes?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    reference: { type: String, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    scheduledAt: { type: Date, required: true, index: true },
    duration: { type: Number, required: true, default: 30 },
    reason: { type: String, required: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'confirmed',
      index: true,
    },
    cancelledBy: { type: String, enum: ['patient', 'doctor', 'admin'] },
    cancelReason: { type: String, maxlength: 500 },
    doctorNotes: { type: String, maxlength: 2000 },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Générer automatiquement la référence
AppointmentSchema.pre('save', async function () {
  if (this.isNew && !this.reference) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Appointment').countDocuments();
    this.reference = `RDV-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

// Index composé : empêche double-réservation même créneau/médecin
AppointmentSchema.index(
  { doctorId: 1, scheduledAt: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } },
  }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
