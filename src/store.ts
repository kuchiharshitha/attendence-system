import { create } from 'zustand';
import { User } from './types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('user'),
  
  login: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updates) => set((state) => {
    if (!state.user) return state;
    const updatedUser = { ...state.user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return { user: updatedUser };
  }),
}));