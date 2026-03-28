import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hospitalsApi, specialtiesApi } from '../api/client';
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants';
import { Hospital, Specialty } from '../types';

const HospitalCard: React.FC<{ hospital: Hospital }> = ({ hospital }) => (
  <motion.div variants={staggerItem}>
    <Link to={`/hospitals/${hospital._id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <motion.div whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }} transition={{ duration: 0.25 }}
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: '100%' }}>
        {/* Photo */}
        <div style={{ height: 140, background: 'linear-gradient(135deg, rgba(26,86,219,0.15), rgba(126,58,242,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
          🏥
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <span className={`badge ${hospital.type === 'public' ? 'badge-primary' : 'badge-purple'}`}>
              {hospital.type === 'public' ? 'Public' : hospital.type === 'private' ? 'Privé' : hospital.type === 'clinic' ? 'Clinique' : 'Universitaire'}
            </span>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{hospital.name}</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 12 }}>
            📍 {hospital.city}, {hospital.region}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {hospital.phone && <span style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>📞 {hospital.phone}</span>}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Voir les médecins</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>→</span>
          </div>
        </div>
      </motion.div>
    </Link>
  </motion.div>
);

const Hospitals: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['hospitals', search, city, type, page],
    queryFn: () => hospitalsApi.getAll({ search: search || undefined, city: city || undefined, type: type || undefined, page, limit: 12 }),
    placeholderData: (prev) => prev,
  });

  const { data: specialtiesData } = useQuery({ queryKey: ['specialties'], queryFn: specialtiesApi.getAll });
  const hospitals: Hospital[] = data?.data?.data?.hospitals || [];
  const pagination = data?.data?.data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ ...(search && { search }), ...(city && { city }) });
  };

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--color-bg-2)', borderBottom: '1px solid var(--color-border)', padding: '40px 0 32px' }}>
        <div className="container">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 8 }}>
              Nos <span className="gradient-text">Hôpitaux</span>
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
              {pagination?.total || 0} établissements partenaires référencés
            </p>

            {/* Search filters */}
            <form onSubmit={handleSearch}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
                  <input className="form-input" placeholder="Nom de l'hôpital..." value={search}
                    onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 44 }} />
                </div>
                <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 140 }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>📍</span>
                  <input className="form-input" placeholder="Ville..." value={city}
                    onChange={(e) => setCity(e.target.value)} style={{ paddingLeft: 44 }} />
                </div>
                <select className="form-input" value={type} onChange={(e) => setType(e.target.value)} style={{ flex: '1 1 160px', minWidth: 140 }}>
                  <option value="">Tous les types</option>
                  <option value="public">Public</option>
                  <option value="private">Privé</option>
                  <option value="clinic">Clinique</option>
                  <option value="university">Universitaire</option>
                </select>
                <button type="submit" className="btn btn-primary">Filtrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div className="container" style={{ padding: '32px 24px' }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 140 }} />
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="skeleton" style={{ height: 14, width: '60%' }} />
                  <div className="skeleton" style={{ height: 20, width: '90%' }} />
                  <div className="skeleton" style={{ height: 14, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : hospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏥</div>
            <h3 style={{ marginBottom: 8 }}>Aucun hôpital trouvé</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Modifiez vos critères de recherche.</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 40 }}
            >
              {hospitals.map((hospital) => <HospitalCard key={hospital._id} hospital={hospital} />)}
            </motion.div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary btn-sm">← Précédent</button>
                <span style={{ padding: '8px 16px', color: 'var(--color-text-muted)', fontSize: 14 }}>
                  {page} / {pagination.totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn btn-secondary btn-sm">Suivant →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Hospitals;
