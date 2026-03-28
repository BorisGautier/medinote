import mongoose, { Document, Schema } from 'mongoose';

export interface ISpecialty extends Document {
  name: string;
  slug: string;
  description?: string;
  icon: string;
  isActive: boolean;
}

const SpecialtySchema = new Schema<ISpecialty>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    icon: { type: String, default: '🏥' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISpecialty>('Specialty', SpecialtySchema);
