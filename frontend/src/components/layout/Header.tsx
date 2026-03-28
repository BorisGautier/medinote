import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { authApi } from '../../api/client';
import toast from 'react-hot-toast';

const navLinks = [
  { href: '/hospitals', label: 'Hôpitaux' },
  { href: '/doctors', label: 'Médecins' },
  { href: '/specialties', label: 'Spécialités' },
];

const Header: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      toast.success('À bientôt !');
    } catch {
      logout();
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(10,15,30,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      <div className="container" style={{ padding: '16px 24px' }}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #1a56db, #7e3af2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>🏥</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em' }}>
              Medi<span className="gradient-text">Note</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navLinks.map(({ href, label }) => (
              <Link key={href} to={href} style={{
                padding: '8px 16px', borderRadius: 8,
                fontSize: 14, fontWeight: 500,
                color: location.pathname.startsWith(href) ? 'var(--color-text)' : 'var(--color-text-muted)',
                background: location.pathname.startsWith(href) ? 'rgba(255,255,255,0.06)' : 'transparent',
                transition: 'all 0.2s',
              }}>{label}</Link>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isAuthenticated && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link to="/dashboard" className="btn btn-ghost btn-sm hide-mobile">Mon espace</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={handleLogout}>
                  <div className="avatar avatar-sm" style={{ fontSize: 13 }}>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm hide-mobile">
                  Connexion
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  S'inscrire
                </Link>
              </>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: 'none', flexDirection: 'column', gap: 5, padding: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 8 }}
              className="mobile-menu-btn"
              aria-label="Menu"
            >
              {[0, 1, 2].map((i) => <span key={i} style={{ width: 20, height: 2, background: 'var(--color-text)', display: 'block', borderRadius: 2 }} />)}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: 'rgba(10,15,30,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px' }}
          >
            {navLinks.map(({ href, label }) => (
              <Link key={href} to={href} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '12px 0', color: 'var(--color-text)', fontSize: 16, fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {label}
              </Link>
            ))}
            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="btn btn-ghost" style={{ flex: 1 }}>Se déconnecter</button>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>Connexion</Link>
                  <Link to="/register" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>S'inscrire</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
