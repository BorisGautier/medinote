import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { doctorsApi, appointmentsApi } from '../api/client';
import { staggerContainer, staggerItem, fadeInUp, slideInRight } from '../animations/variants';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';
import { TimeSlot, Doctor, Hospital } from '../types';

const StarRating: React.FC<{ value: number; count: number }> = ({ value, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <div className="stars">{[1,2,3,4,5].map(i => <span key={i} style={{ opacity: i <= Math.round(value) ? 1 : 0.25 }}>⭐</span>)}</div>
    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{value.toFixed(1)} ({count} avis)</span>
  </div>
);

const DoctorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [step, setStep] = useState<'profile' | 'book'>('profile');
  const [reason, setReason] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7);
  const weekEnd = addDays(weekStart, 6);

  const { data: doctorData, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => doctorsApi.getById(id!),
    enabled: !!id,
  });

  const { data: availabilityData, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['availability', id, weekOffset, selectedHospital],
    queryFn: () => doctorsApi.getAvailability(id!, {
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      ...(selectedHospital && { hospitalId: selectedHospital }),
    }),
    enabled: !!id,
  });

  const doctor: Doctor = doctorData?.data?.data?.doctor;
  const slots: TimeSlot[] = availabilityData?.data?.data?.slots || [];

  const slotsByDay = slots.reduce((acc, slot) => {
    const day = format(new Date(slot.datetime), 'yyyy-MM-dd');
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleBook = async () => {
    if (!selectedSlot || !reason.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour prendre un rendez-vous.');
      return;
    }
    setIsBooking(true);
    try {
      await appointmentsApi.create({
        doctorId: id,
        hospitalId: selectedSlot.hospitalId,
        scheduledAt: selectedSlot.datetime,
        reason,
      });
      setConfirmed(true);
      toast.success('✅ Rendez-vous confirmé ! Email envoyé.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la réservation.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return (
    <div style={{ paddingTop: 100, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
        <p style={{ marginTop: 16, color: 'var(--color-text-muted)' }}>Chargement...</p>
      </div>
    </div>
  );

  if (!doctor) return <div style={{ paddingTop: 100, textAlign: 'center' }}>Médecin introuvable.</div>;

  if (confirmed) return (
    <div style={{ paddingTop: 100, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ textAlign: 'center', padding: 48, maxWidth: 500 }}
      >
        <div style={{ fontSize: 80, marginBottom: 24 }}>✅</div>
        <h2 style={{ marginBottom: 12 }}>Rendez-vous confirmé !</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
          Un e-mail de confirmation a été envoyé à votre adresse.<br />
          {selectedSlot && `📅 ${format(new Date(selectedSlot.datetime), "EEEE d MMMM à HH'h'mm", { locale: fr })}`}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn btn-primary">Mon espace</Link>
          <Link to="/hospitals" className="btn btn-secondary">Retour</Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div style={{ paddingTop: 90 }}>
      <div className="container" style={{ padding: '32px 24px', maxWidth: 1100 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 32, fontSize: 13, color: 'var(--color-text-muted)' }}>
          <Link to="/hospitals" style={{ color: 'var(--color-primary)' }}>Hôpitaux</Link>
          <span>›</span>
          <span>{doctor.fullName}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          {/* Left: Doctor Info */}
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            {/* Profile Card */}
            <motion.div variants={staggerItem} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 32, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div className="avatar avatar-xl" style={{ background: doctor.photoUrl ? 'transparent' : 'var(--gradient-primary)' }}>
                  {doctor.photoUrl ? <img src={doctor.photoUrl} alt={doctor.fullName} /> : `${doctor.firstName[0]}${doctor.lastName[0]}`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {doctor.isVerified && <span className="badge badge-success">✓ Vérifié</span>}
                    {doctor.specialties?.map((s) => <span key={s._id} className="badge badge-purple">{s.icon} {s.name}</span>)}
                  </div>
                  <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', marginBottom: 8 }}>{doctor.fullName}</h1>
                  <StarRating value={doctor.rating.average} count={doctor.rating.count} />
                  <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>
                        {doctor.consultationFee.toLocaleString('fr-FR')} XAF
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Consultation</div>
                    </div>
                    <div style={{ width: 1, background: 'var(--color-border)' }} />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{doctor.languages?.join(', ') || 'FR'}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Langues</div>
                    </div>
                  </div>
                </div>
              </div>

              {doctor.bio && (
                <p style={{ marginTop: 24, color: 'var(--color-text-muted)', lineHeight: 1.8, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
                  {doctor.bio}
                </p>
              )}
            </motion.div>

            {/* Hospitals */}
            <motion.div variants={staggerItem} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, marginBottom: 16 }}>🏥 Établissements</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {doctor.hospitals?.map((h: any) => (
                  <div key={h._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: 24 }}>🏥</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{h.name}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>📍 {h.city}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Availability & Booking */}
          <div style={{ position: 'sticky', top: 100 }}>
            <motion.div variants={fadeInUp} initial="initial" animate="animate"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              
              {/* Week Navigation */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <button onClick={() => setWeekOffset(w => Math.max(0, w - 1))} disabled={weekOffset === 0}
                    style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: weekOffset === 0 ? 'var(--color-text-subtle)' : 'var(--color-text)', cursor: weekOffset === 0 ? 'default' : 'pointer' }}>←</button>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {format(weekStart, 'd MMM', { locale: fr })} — {format(weekEnd, 'd MMM yyyy', { locale: fr })}
                    </div>
                  </div>
                  <button onClick={() => setWeekOffset(w => Math.min(4, w + 1))}
                    style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)', cursor: 'pointer' }}>→</button>
                </div>
              </div>

              {/* Slots */}
              <div style={{ padding: 20, maxHeight: 400, overflowY: 'auto' }}>
                {isLoadingSlots ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40 }} />)}
                  </div>
                ) : slots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📅</div>
                    <p>Aucun créneau disponible cette semaine.</p>
                  </div>
                ) : (
                  days.map((day) => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const daySlots = slotsByDay[dayKey] || [];
                    if (daySlots.length === 0) return null;
                    return (
                      <div key={dayKey} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                          {format(day, 'EEEE d', { locale: fr })}
                        </div>
                        <div className="slot-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                          {daySlots.map((slot, i) => (
                            <button key={i} onClick={() => { if (slot.available) { setSelectedSlot(slot); setStep('book'); }}}
                              className={`slot-btn ${slot.available ? 'available' : 'booked'} ${selectedSlot?.datetime === slot.datetime ? 'selected' : ''}`}>
                              {format(new Date(slot.datetime), 'HH:mm')}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Booking Form */}
              {selectedSlot && (
                <motion.div
                  variants={slideInRight}
                  initial="initial"
                  animate="animate"
                  style={{ padding: 20, borderTop: '1px solid var(--color-border)', background: 'rgba(26,86,219,0.04)' }}
                >
                  <div style={{ background: 'rgba(26,86,219,0.1)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 16, fontSize: 13 }}>
                    📅 <strong>{format(new Date(selectedSlot.datetime), "EEEE d MMMM à HH'h'mm", { locale: fr })}</strong>
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label">Motif de consultation *</label>
                    <textarea className="form-input" rows={3} placeholder="Décrivez brièvement le motif..." value={reason} onChange={(e) => setReason(e.target.value)}
                      style={{ resize: 'none' }} />
                  </div>
                  {isAuthenticated ? (
                    <button onClick={handleBook} disabled={isBooking} className="btn btn-primary" style={{ width: '100%', opacity: isBooking ? 0.7 : 1 }}>
                      {isBooking ? '⏳ Confirmation...' : '✅ Confirmer le rendez-vous'}
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                      🔑 Connexion pour réserver
                    </Link>
                  )}
                  <button onClick={() => setSelectedSlot(null)} style={{ width: '100%', marginTop: 8, padding: '8px', fontSize: 12, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Annuler la sélection
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
