import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDoctor extends Document {
  userId: Types.ObjectId;
  title: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  bio?: string;
  photoUrl?: string;
  consultationFee: number;
  languages: string[];
  specialties: Types.ObjectId[];
  hospitals: Types.ObjectId[];
  rating: { average: number; count: number };
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    title: { type: String, enum: ['Dr.', 'Pr.', 'PhD.'], default: 'Dr.' },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true },
    bio: { type: String, maxlength: 2000 },
    photoUrl: { type: String },
    consultationFee: { type: Number, required: true, min: 0 },
    languages: [{ type: String }],
    specialties: [{ type: Schema.Types.ObjectId, ref: 'Specialty' }],
    hospitals: [{ type: Schema.Types.ObjectId, ref: 'Hospital' }],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true, index: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

DoctorSchema.virtual('fullName').get(function () {
  return `${this.title} ${this.firstName} ${this.lastName}`;
});

DoctorSchema.index({ firstName: 'text', lastName: 'text' });
DoctorSchema.index({ specialties: 1 });
DoctorSchema.index({ hospitals: 1 });

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);
