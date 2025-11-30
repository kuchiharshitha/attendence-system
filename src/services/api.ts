import { User, Role, AttendanceRecord } from '../types';

const API_URL = 'http://localhost:5000/api';

export const ApiService = {
  login: async (username: string, password?: string): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
    }
    return res.json();
  },

  register: async (name: string, email: string, password: string, department: string, role: Role): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, department, role })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
    }
    return res.json();
  },

  getAttendanceHistory: async (userId: string): Promise<AttendanceRecord[]> => {
    const res = await fetch(`${API_URL}/attendance/history/${userId}`);
    return res.json();
  },

  getAllAttendance: async (): Promise<(AttendanceRecord & { user: User })[]> => {
    const res = await fetch(`${API_URL}/attendance/all`);
    return res.json();
  },

  getTodayStatus: async (userId: string): Promise<AttendanceRecord | null> => {
    const res = await fetch(`${API_URL}/attendance/today/${userId}`);
    return res.json();
  },

  checkIn: async (userId: string): Promise<AttendanceRecord> => {
    const res = await fetch(`${API_URL}/attendance/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
    return res.json();
  },

  checkOut: async (userId: string): Promise<AttendanceRecord> => {
    const res = await fetch(`${API_URL}/attendance/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
    return res.json();
  },

  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/users`);
    return res.json();
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    return res.json();
  },

  changePassword: async (userId: string, newPass: string): Promise<void> => {
    await fetch(`${API_URL}/users/${userId}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPass })
    });
  }
};