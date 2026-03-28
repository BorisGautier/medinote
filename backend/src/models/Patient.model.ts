import mongoose, { Document, Schema, Types } from 'mongoose';

export type Gender = 'male' | 'female' | 'other';

export interface IPatient extends Document {
  userId: Types.ObjectId;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: Gender;
  phone?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    phone: { type: String, trim: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    address: { type: String, maxlength: 500 },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPatient>('Patient', PatientSchema);
