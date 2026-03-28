import mongoose, { Document, Schema, Types } from 'mongoose';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Dim, 1=Lun, ..., 6=Sam

export interface IAvailability extends Document {
  doctorId: Types.ObjectId;
  hospitalId: Types.ObjectId;
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  slotDuration: number; // Minutes
  isRecurring: boolean;
  exceptions: Date[];
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
}

const AvailabilitySchema = new Schema<IAvailability>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    slotDuration: { type: Number, enum: [15, 20, 30, 45, 60], default: 30 },
    isRecurring: { type: Boolean, default: true },
    exceptions: [{ type: Date }],
    validFrom: { type: Date },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AvailabilitySchema.index({ doctorId: 1, dayOfWeek: 1 });

export default mongoose.model<IAvailability>('Availability', AvailabilitySchema);
