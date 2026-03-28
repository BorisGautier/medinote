import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { specialtiesApi, hospitalsApi } from '../api/client';
import { staggerContainer, staggerItem, fadeInUp, blobFloat } from '../animations/variants';
import { Specialty, Hospital } from '../types';

const POPULAR_SPECIALTIES = [
  { icon: '🫀', name: 'Cardiologie', slug: 'cardiologie' },
  { icon: '🧠', name: 'Neurologie', slug: 'neurologie' },
  { icon: '👶', name: 'Pédiatrie', slug: 'pediatrie' },
  { icon: '🦷', name: 'Dentisterie', slug: 'dentisterie' },
  { icon: '👁️', name: 'Ophtalmologie', slug: 'ophtalmologie' },
  { icon: '🦴', name: 'Orthopédie', slug: 'orthopedie' },
  { icon: '🩺', name: 'Médecine Générale', slug: 'medecine-generale' },
  { icon: '🧬', name: 'Dermatologie', slug: 'dermatologie' },
];

const STATS = [
  { value: '500+', label: 'Médecins' },
  { value: '50+', label: 'Hôpitaux' },
  { value: '10k+', label: 'Patients' },
  { value: '98%', label: 'Satisfaction' },
];

const Home: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [city, setCity] = React.useState('');

  const { data: hospitalsData } = useQuery({
    queryKey: ['hospitals-featured'],
    queryFn: () => hospitalsApi.getAll({ limit: 6 }),
  });

  const hospitals: Hospital[] = hospitalsData?.data?.data?.hospitals || [];

  return (
    <div style={{ paddingTop: 80 }}>
      {/* ─── Hero Section ──────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Background Blobs */}
        <motion.div
          {...blobFloat(0)}
          style={{
            position: 'absolute', top: '10%', left: '5%',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,86,219,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }}
        />
        <motion.div
          {...blobFloat(2)}
          style={{
            position: 'absolute', bottom: '10%', right: '5%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(126,58,242,0.1) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }}
        />
        <motion.div
          {...blobFloat(1)}
          style={{
            position: 'absolute', top: '40%', right: '20%',
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}
          >
            <motion.div variants={staggerItem}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(26,86,219,0.1)', border: '1px solid rgba(26,86,219,0.2)',
                borderRadius: 'var(--radius-full)', padding: '6px 16px', marginBottom: 24
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-secondary)', animation: 'pulse 2s infinite', display: 'block' }} />
                <span style={{ fontSize: 13, color: 'hsl(213,94%,72%)', fontWeight: 500 }}>
                  Plateforme médicale de confiance
                </span>
              </div>
            </motion.div>

            <motion.h1 variants={staggerItem} style={{ fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.1, marginBottom: 24 }}>
              Prenez soin de votre santé{' '}
              <span className="gradient-text">sans attendre</span>
            </motion.h1>

            <motion.p variants={staggerItem} style={{ fontSize: 18, color: 'var(--color-text-muted)', marginBottom: 40, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
              Trouvez le bon médecin parmi nos spécialistes, consultez leurs disponibilités
              et réservez votre rendez-vous en moins de 3 minutes.
            </motion.p>

            {/* Search Bar */}
            <motion.div variants={staggerItem}>
              <div style={{
                display: 'flex', gap: 8, flexWrap: 'wrap',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-xl)', padding: 8,
                backdropFilter: 'blur(16px)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              }}>
                <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
                  <input
                    className="form-input"
                    placeholder="Spécialité ou médecin..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: 44, background: 'transparent', border: 'none', boxShadow: 'none', fontSize: 15 }}
                  />
                </div>
                <div style={{ width: 1, background: 'var(--color-border)', alignSelf: 'stretch', margin: '8px 0' }} />
                <div style={{ flex: 1, position: 'relative', minWidth: 180 }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>📍</span>
                  <input
                    className="form-input"
                    placeholder="Ville..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ paddingLeft: 44, background: 'transparent', border: 'none', boxShadow: 'none', fontSize: 15 }}
                  />
                </div>
                <Link
                  to={`/hospitals?search=${search}&city=${city}`}
                  className="btn btn-primary"
                  style={{ whiteSpace: 'nowrap', borderRadius: 'calc(var(--radius-xl) - 4px)' }}
                >
                  Rechercher
                </Link>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              variants={staggerContainer}
              style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 48, flexWrap: 'wrap' }}
            >
              {STATS.map(({ value, label }) => (
                <motion.div key={label} variants={staggerItem} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Specialties Section ──────────────────────── */}
      <section className="section" style={{ background: 'var(--color-bg-2)' }}>
        <div className="container">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <h2 style={{ marginBottom: 12 }}>Nos <span className="gradient-text">Spécialités</span></h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 17 }}>Trouvez le spécialiste adapté à votre besoin</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}
          >
            {POPULAR_SPECIALTIES.map(({ icon, name, slug }) => (
              <motion.div key={slug} variants={staggerItem}>
                <Link
                  to={`/hospitals?specialty=${slug}`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                    padding: '24px 16px', borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    transition: 'all var(--transition-base)', textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(26,86,219,0.08)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,86,219,0.3)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: 36 }}>{icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', textAlign: 'center' }}>{name}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Featured Hospitals ───────────────────────── */}
      {hospitals.length > 0 && (
        <section className="section">
          <div className="container">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}
            >
              <div>
                <h2 style={{ marginBottom: 8 }}>Établissements <span className="gradient-text">Partenaires</span></h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Des institutions de confiance à votre service</p>
              </div>
              <Link to="/hospitals" className="btn btn-secondary btn-sm">Voir tous →</Link>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}
            >
              {hospitals.map((hospital) => (
                <motion.div key={hospital._id} variants={staggerItem}>
                  <Link to={`/hospitals/${hospital._id}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 24 }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🏥</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: 16, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hospital.name}</h4>
                          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 8 }}>📍 {hospital.city} · {hospital.type === 'public' ? 'Public' : hospital.type === 'private' ? 'Privé' : 'Clinique'}</p>
                          <span className="badge badge-primary">Voir les médecins →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── CTA Section ──────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            style={{
              textAlign: 'center', padding: '64px 32px', borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, rgba(26,86,219,0.12), rgba(126,58,242,0.12))',
              border: '1px solid rgba(26,86,219,0.2)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <h2 style={{ marginBottom: 16 }}>Prêt à prendre soin de vous ?</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 17, marginBottom: 32 }}>
              Créez votre compte gratuitement et prenez votre premier rendez-vous en 3 minutes.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                🚀 Commencer gratuitement
              </Link>
              <Link to="/hospitals" className="btn btn-secondary btn-lg">
                🔍 Explorer les médecins
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
