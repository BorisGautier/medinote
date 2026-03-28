import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User.model';
import Hospital from '../models/Hospital.model';
import Specialty from '../models/Specialty.model';
import Doctor from '../models/Doctor.model';
import Availability from '../models/Availability.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medinote';

const specialties = [
  { name: 'Cardiologie', slug: 'cardiologie', icon: '🫀', description: 'Spécialité traitant les maladies du cœur.' },
  { name: 'Neurologie', slug: 'neurologie', icon: '🧠', description: 'Maladies du système nerveux.' },
  { name: 'Pédiatrie', slug: 'pediatrie', icon: '👶', description: 'Médecine des enfants et adolescents.' },
  { name: 'Dentisterie', slug: 'dentisterie', icon: '🦷', description: 'Soins dentaires.' },
  { name: 'Ophtalmologie', slug: 'ophtalmologie', icon: '👁️', description: 'Maladies des yeux.' },
  { name: 'Orthopédie', slug: 'orthopedie', icon: '🦴', description: 'Maladies de l\'appareil locomoteur.' },
  { name: 'Médecine Générale', slug: 'medecine-generale', icon: '🩺', description: 'Médecine de premier recours.' },
  { name: 'Dermatologie', slug: 'dermatologie', icon: '🧬', description: 'Maladies de la peau.' },
];

const hospitals = [
  {
    name: 'Hôpital Général de Yaoundé',
    type: 'public',
    address: 'Quartier Ngousso',
    city: 'Yaoundé',
    region: 'Centre',
    phone: '+237 222 21 21 21',
    email: 'contact@hgy.cm',
    isActive: true,
  },
  {
    name: 'Hôpital Laquintinie',
    type: 'public',
    address: 'Quartier Akwa',
    city: 'Douala',
    region: 'Littoral',
    phone: '+237 233 42 15 40',
    email: 'info@laquintinie.cm',
    isActive: true,
  },
  {
    name: 'Clinique Idimed',
    type: 'clinic',
    address: 'Bonapriso',
    city: 'Douala',
    region: 'Littoral',
    phone: '+237 233 43 01 01',
    email: 'contact@idimed.cm',
    isActive: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Nettoyage
    await Promise.all([
      User.deleteMany({ role: 'doctor' }),
      Hospital.deleteMany({}),
      Specialty.deleteMany({}),
      Doctor.deleteMany({}),
      Availability.deleteMany({}),
    ]);

    // 1. Spécialités
    const createdSpecialties = await Specialty.insertMany(specialties);
    console.log(`Created ${createdSpecialties.length} specialties`);

    // 2. Hôpitaux
    const createdHospitals = await Hospital.insertMany(hospitals);
    console.log(`Created ${createdHospitals.length} hospitals`);

    // 3. Médecins & Utilisateurs
    const doctorsData = [
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        title: 'Dr.',
        email: 'jean.dupont@medinote.cm',
        specialtyIdx: 0, // Cardiologie
        hospitalIndices: [0], // HGY
      },
      {
        firstName: 'Marie',
        lastName: 'Ngo',
        title: 'Pr.',
        email: 'marie.ngo@medinote.cm',
        specialtyIdx: 2, // Pédiatrie
        hospitalIndices: [1, 2], // Laquintinie, Idimed
      },
      {
        firstName: 'Paul',
        lastName: 'Biya',
        title: 'Dr.',
        email: 'paul.biya@medinote.cm',
        specialtyIdx: 6, // Médecine Générale
        hospitalIndices: [0], // HGY
      },
    ];

    for (const d of doctorsData) {
      const user = await User.create({
        email: d.email,
        password: 'Password123!',
        role: 'doctor',
        isEmailVerified: true,
      });

      const doctor = await Doctor.create({
        userId: user._id,
        title: d.title,
        firstName: d.firstName,
        lastName: d.lastName,
        licenseNumber: `CAM-${Math.floor(Math.random() * 10000)}`,
        consultationFee: 15000,
        specialties: [createdSpecialties[d.specialtyIdx]._id],
        hospitals: d.hospitalIndices.map(idx => createdHospitals[idx]._id),
        rating: { average: 4.5 + Math.random() * 0.5, count: 10 + Math.floor(Math.random() * 50) },
        isActive: true,
        isVerified: true,
      });

      // 4. Disponibilités (Lundi au Vendredi, 8h-17h)
      const avails = [];
      for (let day = 1; day <= 5; day++) {
        for (const hId of doctor.hospitals) {
          avails.push({
            doctorId: doctor._id,
            hospitalId: hId,
            dayOfWeek: day,
            startTime: '08:00',
            endTime: '12:00',
            slotDuration: 30,
          });
          avails.push({
            doctorId: doctor._id,
            hospitalId: hId,
            dayOfWeek: day,
            startTime: '13:00',
            endTime: '17:00',
            slotDuration: 30,
          });
        }
      }
      await Availability.insertMany(avails);
      console.log(`Created profile and availabilities for ${d.title} ${d.firstName} ${d.lastName}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
