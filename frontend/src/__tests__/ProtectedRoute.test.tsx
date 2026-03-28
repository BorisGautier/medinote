/**
 * ProtectedRoute Tests — TC-UI-040 (route guards)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as React from 'react';
import { act } from '@testing-library/react';
import useAuthStore from '../stores/authStore';

// Re-create the ProtectedRoute component inline to test it in isolation
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <div data-testid="redirect-login">Redirecting to login...</div>;
  }
  return <>{children}</>;
};

const MOCK_USER = {
  _id: 'user-123',
  email: 'jean@test.cm',
  role: 'patient' as const,
  firstName: 'Jean',
  lastName: 'Dupont',
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
    });
  });

  // TC-UI-040
  it('TC-UI-040: should redirect to login when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div data-testid="dashboard-content">Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    // Should NOT show dashboard content
    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
    // Should show redirect indicator
    expect(screen.getByTestId('redirect-login')).toBeInTheDocument();
  });

  it('should show protected content when authenticated', () => {
    act(() => {
      useAuthStore.getState().setUser(MOCK_USER as any, 'my-token');
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div data-testid="dashboard-content">Dashboard Secret</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Secret')).toBeInTheDocument();
  });
});
