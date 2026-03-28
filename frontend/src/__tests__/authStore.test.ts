/**
 * authStore Tests — TC-AUTH (unit tests for Zustand store)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import useAuthStore from '../stores/authStore';

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

describe('authStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
    });
  });

  it('should start with empty unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setUser should update user, token, and set isAuthenticated to true', () => {
    act(() => {
      useAuthStore.getState().setUser(MOCK_USER as any, 'my-access-token');
    });
    const state = useAuthStore.getState();
    expect(state.user).toEqual(MOCK_USER);
    expect(state.accessToken).toBe('my-access-token');
    expect(state.isAuthenticated).toBe(true);
  });

  it('setAccessToken should update only the token', () => {
    act(() => {
      useAuthStore.getState().setUser(MOCK_USER as any, 'old-token');
      useAuthStore.getState().setAccessToken('new-token');
    });
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('new-token');
    expect(state.isAuthenticated).toBe(true); // unchanged
    expect(state.user).toEqual(MOCK_USER); // unchanged
  });

  it('logout should clear all auth data', () => {
    act(() => {
      useAuthStore.getState().setUser(MOCK_USER as any, 'my-token');
      useAuthStore.getState().logout();
    });
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
