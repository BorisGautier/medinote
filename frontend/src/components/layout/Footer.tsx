import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { staggerContainer, staggerItem } from '../../animations/variants';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: 'var(--color-bg-2)', borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
      <div className="container" style={{ padding: '48px 24px 24px' }}>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 40 }}
        >
          {/* Brand */}
          <motion.div variants={staggerItem}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #1a56db, #7e3af2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>Medi<span className="gradient-text">Note</span></span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 220 }}>
              Plateforme de prise de rendez-vous médicaux simple, rapide et sécurisée.
            </p>
          </motion.div>

          {/* Links */}
          {[
            { title: 'Plateforme', links: [{ href: '/hospitals', label: 'Hôpitaux' }, { href: '/doctors', label: 'Médecins' }, { href: '/specialties', label: 'Spécialités' }] },
            { title: 'Compte', links: [{ href: '/login', label: 'Connexion' }, { href: '/register', label: 'Inscription' }, { href: '/dashboard', label: 'Mon espace' }] },
            { title: 'Informations', links: [{ href: '#', label: 'Mentions légales' }, { href: '#', label: 'Confidentialité' }, { href: '#', label: 'Contact' }] },
          ].map(({ title, links }) => (
            <motion.div key={title} variants={staggerItem}>
              <h6 style={{ color: 'var(--color-text)', fontWeight: 700, marginBottom: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(({ href, label }) => (
                  <Link key={href} to={href} style={{ color: 'var(--color-text-muted)', fontSize: 14, transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}>{label}</Link>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--color-text-subtle)', fontSize: 13 }}>© {year} MediNote. Tous droits réservés.</p>
          <p style={{ color: 'var(--color-text-subtle)', fontSize: 13 }}>
            🌐 <a href="https://medinote.borisgauty.com" style={{ color: 'var(--color-primary)' }}>medinote.borisgauty.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
