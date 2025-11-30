export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  employeeId: string;
  department: string;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // ISO Date string YYYY-MM-DD
  checkInTime?: string; // ISO string
  checkOutTime?: string; // ISO string
  status: AttendanceStatus;
  totalHours: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
