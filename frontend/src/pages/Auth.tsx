import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../api/client';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';
import { pageVariants } from '../animations/variants';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const registerSchema = z.object({
  firstName: z.string().min(2, '2 caractères minimum'),
  lastName: z.string().min(2, '2 caractères minimum'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, '8 caractères minimum'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface AuthPageProps { mode?: 'login' | 'register'; }

const AuthPage: React.FC<AuthPageProps> = ({ mode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onLogin = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { user, accessToken } = res.data.data;
      setUser(user, accessToken);
      toast.success(`Bienvenue, ${user.email.split('@')[0]} !`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur de connexion.');
    } finally { setLoading(false); }
  };

  const onRegister = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      const { user, accessToken } = res.data.data;
      setUser({ ...user, firstName: data.firstName, lastName: data.lastName }, accessToken);
      toast.success('Compte créé avec succès !');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally { setLoading(false); }
  };

  const InputField = ({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className={`form-input ${error ? 'error' : ''}`} {...props} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 40px', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at top, rgba(26,86,219,0.1) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(126,58,242,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        {/* Logo */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #1a56db, #7e3af2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🏥</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>Medi<span className="gradient-text">Note</span></span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="glass-card" style={{ padding: 32 }}>
          {/* Tab Toggle */}
          <div style={{ display: 'flex', background: 'var(--color-surface)', borderRadius: 10, padding: 4, marginBottom: 32 }}>
            {(['login', 'register'] as const).map((tab) => (
              <button key={tab} onClick={() => setIsLogin(tab === 'login')}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  transition: 'all 0.25s',
                  background: (tab === 'login') === isLogin ? 'var(--gradient-primary)' : 'transparent',
                  color: (tab === 'login') === isLogin ? 'white' : 'var(--color-text-muted)',
                  boxShadow: (tab === 'login') === isLogin ? '0 4px 16px rgba(26,86,219,0.35)' : 'none',
                }}>
                {tab === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
                onSubmit={loginForm.handleSubmit(onLogin)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <InputField label="Email" type="email" placeholder="vous@exemple.com" error={loginForm.formState.errors.email?.message} {...loginForm.register('email')} />
                <InputField label="Mot de passe" type="password" placeholder="••••••••" error={loginForm.formState.errors.password?.message} {...loginForm.register('password')} />
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4, opacity: loading ? 0.75 : 1 }}>
                  {loading ? '⏳ Connexion...' : '🔑 Me connecter'}
                </button>
              </motion.form>
            ) : (
              <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                onSubmit={registerForm.handleSubmit(onRegister)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <InputField label="Prénom" type="text" placeholder="Jean" error={registerForm.formState.errors.firstName?.message} {...registerForm.register('firstName')} />
                  <InputField label="Nom" type="text" placeholder="Dupont" error={registerForm.formState.errors.lastName?.message} {...registerForm.register('lastName')} />
                </div>
                <InputField label="Email" type="email" placeholder="vous@exemple.com" error={registerForm.formState.errors.email?.message} {...registerForm.register('email')} />
                <InputField label="Mot de passe" type="password" placeholder="Min. 8 caractères" error={registerForm.formState.errors.password?.message} {...registerForm.register('password')} />
                <InputField label="Confirmer le mot de passe" type="password" placeholder="••••••••" error={registerForm.formState.errors.confirmPassword?.message} {...registerForm.register('confirmPassword')} />
                <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', lineHeight: 1.5 }}>
                  En créant un compte, vous acceptez nos <Link to="#" style={{ color: 'var(--color-primary)' }}>conditions d'utilisation</Link> et notre <Link to="#" style={{ color: 'var(--color-primary)' }}>politique de confidentialité</Link>.
                </p>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ opacity: loading ? 0.75 : 1 }}>
                  {loading ? '⏳ Création...' : '🚀 Créer mon compte'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--color-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--color-primary)' }}>← Retour à l'accueil</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default AuthPage;
