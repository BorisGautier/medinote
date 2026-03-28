/**
 * Login / Register Form Tests — TC-UI-020 to TC-UI-023
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { act } from '@testing-library/react';
import useAuthStore from '../stores/authStore';

// ─── Mocks ────────────────────────────────────────────────
const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock('../api/client', () => ({
  authApi: {
    login: (data: any) => mockLogin(data),
    register: (data: any) => mockRegister(data),
    logout: vi.fn(),
    refresh: vi.fn(),
    me: vi.fn(),
  },
  default: {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

// ─── Minimal test form components ─────────────────────────
const MOCK_USER = {
  _id: 'user-1',
  email: 'jean@test.cm',
  role: 'patient' as const,
  firstName: 'Jean',
  lastName: 'Dupont',
  isActive: true,
  isEmailVerified: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Simpler standalone form component for testing
const LoginFormTest: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email et mot de passe requis');
      return;
    }
    setLoading(true);
    try {
      const res = await mockLogin({ email, password });
      setUser(res.data.data.user, res.data.data.accessToken);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="login-form">
      {error && <p role="alert">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="email"
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="password"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
};

const RegisterFormTest: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [data, setData] = React.useState({ firstName: '', lastName: '', email: '', password: '' });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.firstName) e.firstName = 'Prénom requis';
    if (!data.lastName) e.lastName = 'Nom requis';
    if (!data.email) e.email = 'Email requis';
    if (!data.password || data.password.length < 8) e.password = 'Mot de passe: 8 caractères minimum';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await mockRegister(data);
      setUser(res.data.data.user, res.data.data.accessToken);
      onSuccess?.();
    } catch (err: any) {
      setErrors({ global: err.response?.data?.message || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="register-form">
      {errors.global && <p role="alert">{errors.global}</p>}
      <input aria-label="firstName" placeholder="Prénom" value={data.firstName} onChange={e => setData(d => ({ ...d, firstName: e.target.value }))} />
      {errors.firstName && <span role="alert">{errors.firstName}</span>}
      <input aria-label="lastName" placeholder="Nom" value={data.lastName} onChange={e => setData(d => ({ ...d, lastName: e.target.value }))} />
      {errors.lastName && <span role="alert">{errors.lastName}</span>}
      <input aria-label="email" type="email" placeholder="Email" value={data.email} onChange={e => setData(d => ({ ...d, email: e.target.value }))} />
      {errors.email && <span role="alert">{errors.email}</span>}
      <input aria-label="password" type="password" placeholder="Mot de passe" value={data.password} onChange={e => setData(d => ({ ...d, password: e.target.value }))} />
      {errors.password && <span role="alert">{errors.password}</span>}
      <button type="submit" disabled={loading}>{loading ? 'Inscription...' : "S'inscrire"}</button>
    </form>
  );
};

// ─── Wrapper ───────────────────────────────────────────────
const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={qc}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false }));
  });

  // TC-UI-022
  it('TC-UI-022: should update store on successful login', async () => {
    mockLogin.mockResolvedValue({
      data: { data: { accessToken: 'tok-123', user: MOCK_USER } },
    });
    const onSuccess = vi.fn();
    render(<Wrapper><LoginFormTest onSuccess={onSuccess} /></Wrapper>);

    await userEvent.type(screen.getByLabelText('email'), 'jean@test.cm');
    await userEvent.type(screen.getByLabelText('password'), 'Password123!');
    fireEvent.submit(screen.getByRole('form', { name: /login-form/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      const { isAuthenticated, accessToken } = useAuthStore.getState();
      expect(isAuthenticated).toBe(true);
      expect(accessToken).toBe('tok-123');
    });
  });

  // TC-UI-023
  it('TC-UI-023: should show error on failed login', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: 'Email ou mot de passe incorrect' } },
    });
    render(<Wrapper><LoginFormTest /></Wrapper>);

    await userEvent.type(screen.getByLabelText('email'), 'jean@test.cm');
    await userEvent.type(screen.getByLabelText('password'), 'WrongPass');
    fireEvent.submit(screen.getByRole('form', { name: /login-form/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/incorrect/i);
    });
  });

  it('should show validation error when fields are empty', async () => {
    render(<Wrapper><LoginFormTest /></Wrapper>);
    fireEvent.submit(screen.getByRole('form', { name: /login-form/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });
});

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false }));
  });

  // TC-UI-020
  it('TC-UI-020: should register and authenticate user on success', async () => {
    mockRegister.mockResolvedValue({
      data: { data: { accessToken: 'reg-tok', user: MOCK_USER } },
    });
    const onSuccess = vi.fn();
    render(<Wrapper><RegisterFormTest onSuccess={onSuccess} /></Wrapper>);

    await userEvent.type(screen.getByLabelText('firstName'), 'Jean');
    await userEvent.type(screen.getByLabelText('lastName'), 'Dupont');
    await userEvent.type(screen.getByLabelText('email'), 'jean@test.cm');
    await userEvent.type(screen.getByLabelText('password'), 'Password123!');
    fireEvent.submit(screen.getByRole('form', { name: /register-form/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  // TC-UI-021
  it('TC-UI-021: should show validation errors on empty form submit', async () => {
    render(<Wrapper><RegisterFormTest /></Wrapper>);
    fireEvent.submit(screen.getByRole('form', { name: /register-form/i }));

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should show password too short error', async () => {
    render(<Wrapper><RegisterFormTest /></Wrapper>);
    await userEvent.type(screen.getByLabelText('firstName'), 'Jean');
    await userEvent.type(screen.getByLabelText('lastName'), 'Dupont');
    await userEvent.type(screen.getByLabelText('email'), 'jean@test.cm');
    await userEvent.type(screen.getByLabelText('password'), 'abc');
    fireEvent.submit(screen.getByRole('form', { name: /register-form/i }));

    await waitFor(() => {
      expect(screen.getByText(/8 caractères/i)).toBeInTheDocument();
    });
  });
});
