import mongoose, { Document, Schema } from 'mongoose';

export type HospitalType = 'public' | 'private' | 'clinic' | 'university';

export interface IHospital extends Document {
  name: string;
  type: HospitalType;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  photoUrl?: string;
  description?: string;
  coordinates?: { lat: number; lng: number };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, trim: true, index: true },
    type: { type: String, enum: ['public', 'private', 'clinic', 'university'], required: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    region: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    photoUrl: { type: String },
    description: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

HospitalSchema.index({ name: 'text', city: 'text', region: 'text' });

export default mongoose.model<IHospital>('Hospital', HospitalSchema);
