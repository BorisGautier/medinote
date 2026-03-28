import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { appointmentsApi } from '../api/client';
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';
import { Appointment, AppointmentStatus, Doctor, Hospital } from '../types';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; badge: string; icon: string }> = {
  confirmed: { label: 'Confirmé', badge: 'badge-success', icon: '✅' },
  pending:   { label: 'En attente', badge: 'badge-warning', icon: '⏳' },
  completed: { label: 'Terminé', badge: 'badge-primary', icon: '🏁' },
  cancelled: { label: 'Annulé', badge: 'badge-error', icon: '❌' },
  no_show:   { label: 'Absent', badge: 'badge-error', icon: '🚫' },
};

const AppointmentCard: React.FC<{ appointment: Appointment; onCancel: (id: string) => void }> = ({ appointment, onCancel }) => {
  const doctor = appointment.doctorId as Doctor;
  const hospital = appointment.hospitalId as Hospital;
  const status = STATUS_CONFIG[appointment.status];
  const scheduledAt = new Date(appointment.scheduledAt);
  const isFuture = scheduledAt > new Date();

  return (
    <motion.div variants={staggerItem}
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Status accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: appointment.status === 'confirmed' ? 'var(--color-secondary)' : appointment.status === 'cancelled' ? 'var(--color-error)' : 'var(--color-primary)' }} />

      <div style={{ paddingLeft: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="avatar" style={{ background: 'var(--gradient-primary)' }}>
              {typeof doctor === 'object' ? `${doctor.firstName?.[0]}${doctor.lastName?.[0]}` : '👨'}
            </div>
            <div>
              <h4 style={{ fontSize: 15, marginBottom: 2 }}>
                {typeof doctor === 'object' ? `${doctor.title} ${doctor.firstName} ${doctor.lastName}` : 'Médecin'}
              </h4>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                🏥 {typeof hospital === 'object' ? hospital.name : 'Hôpital'}
              </p>
            </div>
          </div>
          <span className={`badge ${status.badge}`}>{status.icon} {status.label}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16, padding: '16px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Date & Heure</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{format(scheduledAt, "EEEE d MMM", { locale: fr })}</div>
            <div style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{format(scheduledAt, "HH'h'mm")}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Référence</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 13 }}>{appointment.reference}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Motif</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appointment.reason}</div>
          </div>
        </div>

        {isFuture && appointment.status === 'confirmed' && (
          <button
            onClick={() => onCancel(appointment._id)}
            style={{ fontSize: 13, color: 'var(--color-error)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Annuler ce rendez-vous
          </button>
        )}
      </div>
    </motion.div>
  );
};

const PatientDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-appointments', filter],
    queryFn: () => appointmentsApi.getMine(filter ? { status: filter } : {}),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.cancel(id, { cancelReason: 'Annulé par le patient depuis le tableau de bord.' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      toast.success('Rendez-vous annulé.');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erreur lors de l\'annulation.'),
  });

  const appointments: Appointment[] = data?.data?.data?.appointments || [];
  const upcoming = appointments.filter(a => a.status === 'confirmed' && new Date(a.scheduledAt) > new Date());
  const past = appointments.filter(a => a.status !== 'confirmed' || new Date(a.scheduledAt) <= new Date());

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--color-bg-2)', borderBottom: '1px solid var(--color-border)', padding: '40px 0 32px' }}>
        <div className="container">
          <motion.div variants={fadeInUp} initial="initial" animate="animate" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(24px, 3vw, 32px)', marginBottom: 4 }}>
                Bonjour, <span className="gradient-text">{user?.firstName || user?.email?.split('@')[0]}</span> 👋
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }}>Gérez vos rendez-vous médicaux</p>
            </div>
            <Link to="/hospitals" className="btn btn-primary">
              + Nouveau rendez-vous
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginTop: 24 }}>
            {[
              { label: 'À venir', value: upcoming.length, icon: '📅', color: 'var(--color-primary)' },
              { label: 'Total', value: appointments.length, icon: '📋', color: 'var(--color-secondary)' },
              { label: 'Annulés', value: appointments.filter(a => a.status === 'cancelled').length, icon: '❌', color: 'var(--color-error)' },
              { label: 'Terminés', value: appointments.filter(a => a.status === 'completed').length, icon: '✅', color: 'var(--color-accent)' },
            ].map(({ label, value, icon, color }) => (
              <motion.div key={label} variants={staggerItem}
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Appointments */}
      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {[['', 'Tous'], ['confirmed', '✅ À venir'], ['completed', '🏁 Terminés'], ['cancelled', '❌ Annulés']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} className={`btn btn-sm ${filter === val ? 'btn-primary' : 'btn-ghost'}`}>{label}</button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-xl)' }} />)}
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>📭</div>
            <h3 style={{ marginBottom: 8 }}>Aucun rendez-vous</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Prenez votre premier rendez-vous dès maintenant.</p>
            <Link to="/hospitals" className="btn btn-primary">Trouver un médecin</Link>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment._id} appointment={appointment} onCancel={(id) => cancelMutation.mutate(id)} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
