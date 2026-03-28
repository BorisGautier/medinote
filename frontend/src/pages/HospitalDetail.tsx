import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hospitalsApi } from '../api/client';
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants';
import { Doctor } from '../types';

const HospitalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [page, setPage] = useState(1);

  const { data: hospitalData, isLoading: loadingHospital } = useQuery({
    queryKey: ['hospital', id],
    queryFn: () => hospitalsApi.getById(id!),
    enabled: !!id,
  });

  const { data: doctorsData, isLoading: loadingDoctors } = useQuery({
    queryKey: ['hospital-doctors', id, selectedSpecialty, page],
    queryFn: () => hospitalsApi.getDoctors(id!, { specialtyId: selectedSpecialty || undefined, page, limit: 12 }),
    enabled: !!id,
  });

  const hospital = hospitalData?.data?.data?.hospital;
  const doctors: Doctor[] = doctorsData?.data?.data?.doctors || [];
  const pagination = doctorsData?.data?.data?.pagination;

  // Collect unique specialties from all doctors
  const allSpecialties = doctors.flatMap((d) => d.specialties || []);
  const uniqueSpecialties = Array.from(new Map(allSpecialties.map((s) => [s._id, s])).values());

  if (loadingHospital) return (
    <div style={{ paddingTop: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div style={{ width: 48, height: 48, border: '3px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
    </div>
  );
  if (!hospital) return <div style={{ paddingTop: 100, textAlign: 'center' }}>Hôpital introuvable.</div>;

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      {/* Hospital Header */}
      <div style={{ background: 'var(--color-bg-2)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '40px 24px 32px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24, fontSize: 13, color: 'var(--color-text-muted)' }}>
            <Link to="/hospitals" style={{ color: 'var(--color-primary)' }}>Hôpitaux</Link>
            <span>›</span>
            <span>{hospital.name}</span>
          </div>

          <motion.div variants={fadeInUp} initial="initial" animate="animate" style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #1a56db, #7e3af2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>🏥</div>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span className={`badge ${hospital.type === 'public' ? 'badge-primary' : 'badge-purple'}`}>
                  {hospital.type === 'public' ? 'Hôpital Public' : hospital.type === 'private' ? 'Privé' : 'Clinique'}
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(22px, 3vw, 34px)', marginBottom: 8 }}>{hospital.name}</h1>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', color: 'var(--color-text-muted)', fontSize: 14 }}>
                <span>📍 {hospital.address}, {hospital.city}</span>
                <span>📞 {hospital.phone}</span>
                <span>✉️ {hospital.email}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Doctors Section */}
      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Specialty Filter Tabs */}
        {uniqueSpecialties.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            <button
              onClick={() => { setSelectedSpecialty(''); setPage(1); }}
              className={`btn btn-sm ${!selectedSpecialty ? 'btn-primary' : 'btn-ghost'}`}
            >
              Tous ({pagination?.total || 0})
            </button>
            {uniqueSpecialties.map((specialty) => (
              <button
                key={specialty._id}
                onClick={() => { setSelectedSpecialty(specialty._id); setPage(1); }}
                className={`btn btn-sm ${selectedSpecialty === specialty._id ? 'btn-primary' : 'btn-ghost'}`}
              >
                {specialty.icon} {specialty.name}
              </button>
            ))}
          </div>
        )}

        {/* Doctors Grid */}
        {loadingDoctors ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ padding: 20, background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                  <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skeleton" style={{ height: 14, width: '80%' }} />
                    <div className="skeleton" style={{ height: 12, width: '60%' }} />
                    <div className="skeleton" style={{ height: 12, width: '40%' }} />
                  </div>
                </div>
                <div className="skeleton" style={{ height: 36 }} />
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>👨‍⚕️</div>
            <h3>Aucun médecin disponible</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Aucun médecin pour cette spécialité dans cet établissement.</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}
            >
              {doctors.map((doctor) => (
                <motion.div key={doctor._id} variants={staggerItem}>
                  <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 20, height: '100%' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
                      <div className="avatar avatar-lg" style={{ background: doctor.photoUrl ? 'transparent' : 'var(--gradient-primary)' }}>
                        {doctor.photoUrl ? <img src={doctor.photoUrl} alt={doctor.fullName} /> : `${doctor.firstName[0]}${doctor.lastName[0]}`}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
                          {doctor.specialties?.slice(0, 2).map((s) => <span key={s._id} className="badge badge-primary" style={{ fontSize: 10 }}>{s.icon} {s.name}</span>)}
                        </div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doctor.fullName}</h4>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 11, opacity: i <= Math.round(doctor.rating.average) ? 1 : 0.25 }}>⭐</span>)}
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 4 }}>{doctor.rating.average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>
                        {doctor.consultationFee.toLocaleString('fr-FR')} XAF
                      </span>
                      {doctor.isVerified && <span className="badge badge-success">✓ Vérifié</span>}
                    </div>

                    <Link to={`/doctors/${doctor._id}`} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                      Voir les disponibilités →
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary btn-sm">← Précédent</button>
                <span style={{ padding: '8px 16px', fontSize: 14, color: 'var(--color-text-muted)' }}>{page} / {pagination.totalPages}</span>
                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn btn-secondary btn-sm">Suivant →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HospitalDetail;
