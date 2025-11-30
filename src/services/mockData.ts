import { User, Role, AttendanceRecord, AttendanceStatus } from '../types';

// --- Local Storage Keys ---
// Updated keys to '_v6' to force a fresh start with new seed data names
const STORAGE_KEYS = {
  USERS: 'attendance_app_users_v6',
  ATTENDANCE: 'attendance_app_records_v6',
  PASSWORDS: 'attendance_app_passwords_v6'
};

// --- Seed Data ---
const SEED_USERS: User[] = [
  {
    id: 'u1',
    name: 'Harshitha',
    email: 'harshitha@example.com',
    role: Role.MANAGER,
    employeeId: 'MGR001',
    department: 'Management',
    avatar: 'https://ui-avatars.com/api/?name=Harshitha&background=9333ea&color=fff'
  },
  {
    id: 'u2',
    name: 'Bhaskar',
    email: 'bhaskar@example.com',
    role: Role.EMPLOYEE,
    employeeId: 'EMP001',
    department: 'Engineering',
    avatar: 'https://ui-avatars.com/api/?name=Bhaskar&background=2563eb&color=fff'
  },
  {
    id: 'u3',
    name: 'Rathana',
    email: 'rathana@example.com',
    role: Role.EMPLOYEE,
    employeeId: 'EMP002',
    department: 'Design',
    avatar: 'https://ui-avatars.com/api/?name=Rathana&background=random&color=fff'
  },
  {
    id: 'u4',
    name: 'Ruthvika',
    email: 'ruthvika@example.com',
    role: Role.EMPLOYEE,
    employeeId: 'EMP003',
    department: 'Testing',
    avatar: 'https://ui-avatars.com/api/?name=Ruthvika&background=random&color=fff'
  },
  {
    id: 'u5',
    name: 'Nandha',
    email: 'nandha@example.com',
    role: Role.EMPLOYEE,
    employeeId: 'EMP004',
    department: 'HR',
    avatar: 'https://ui-avatars.com/api/?name=Nandha&background=random&color=fff'
  }
];

const SEED_PASSWORDS: Record<string, string> = {
  'u1': 'password',
  'u2': 'password',
  'u3': 'password',
  'u4': 'password',
  'u5': 'password',
};

// Generate attendance for the current month (Seed helper)
const generateSeedAttendance = (users: User[]): AttendanceRecord[] => {
  // If no users, return empty records
  if (users.length === 0) return [];

  const records: AttendanceRecord[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  users.forEach(user => {
    if (user.role === Role.MANAGER) return;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(year, month, day);
      
      // Skip weekends
      if (dateObj.getDay() === 0 || dateObj.getDay() === 6) continue;
      
      // Don't generate future data except for today
      if (day > today.getDate()) continue;

      const isToday = day === today.getDate();
      if (isToday) continue; // Let the app handle today's logic dynamically

      // Randomize status based on user personality/role simulation
      const rand = Math.random();
      let status = AttendanceStatus.PRESENT;
      let hours = 8;
      let checkIn = `${dateStr}T09:00:00`;
      let checkOut = `${dateStr}T17:00:00`;

      if (rand > 0.92) {
        status = AttendanceStatus.ABSENT;
        hours = 0;
        checkIn = undefined;
        checkOut = undefined;
      } else if (rand > 0.85) {
        status = AttendanceStatus.LATE;
        hours = 7.5;
        checkIn = `${dateStr}T09:45:00`;
      } else if (rand > 0.80) {
        status = AttendanceStatus.HALF_DAY;
        hours = 4;
        checkOut = `${dateStr}T13:00:00`;
      }

      // Simulate specific scenarios
      // Rathana (Design) tends to be late on Fridays (day % 5 === 0 approx)
      if (user.department === 'Design' && day % 5 === 0) {
          status = AttendanceStatus.LATE;
          checkIn = `${dateStr}T10:15:00`;
      }

      if (status !== AttendanceStatus.ABSENT && checkIn) {
          records.push({
            id: `att-${user.id}-${day}`,
            userId: user.id,
            date: dateStr,
            checkInTime: checkIn,
            checkOutTime: checkOut,
            status,
            totalHours: hours
          });
      } else {
          records.push({
            id: `att-${user.id}-${day}`,
            userId: user.id,
            date: dateStr,
            status: AttendanceStatus.ABSENT,
            totalHours: 0
          });
      }
    }
  });
  return records;
};

// --- In-Memory State (Synced with LocalStorage) ---
let USERS: User[] = [];
let ATTENDANCE_DB: AttendanceRecord[] = [];
let PASSWORDS: Record<string, string> = {};

// --- Initialization Logic ---
const initializeDatabase = () => {
  const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  const storedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  const storedPasswords = localStorage.getItem(STORAGE_KEYS.PASSWORDS);

  if (storedUsers && storedPasswords) {
    // Load from storage
    USERS = JSON.parse(storedUsers);
    PASSWORDS = JSON.parse(storedPasswords);
    ATTENDANCE_DB = storedAttendance ? JSON.parse(storedAttendance) : [];
    console.log("Loaded data from LocalStorage");
  } else {
    // Seed new data
    USERS = [...SEED_USERS];
    PASSWORDS = { ...SEED_PASSWORDS };
    ATTENDANCE_DB = generateSeedAttendance(USERS);
    saveToStorage();
    console.log("Database initialized with Seed Data");
  }
};

const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(USERS));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(ATTENDANCE_DB));
  localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(PASSWORDS));
};

// Initialize immediately
initializeDatabase();

// --- API Service Simulation ---

export const MockService = {
  login: async (username: string, password?: string): Promise<User> => {
    // Simulating delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Refresh data from storage just in case multiple tabs are open
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (storedUsers) USERS = JSON.parse(storedUsers);
    const storedPasswords = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
    if (storedPasswords) PASSWORDS = JSON.parse(storedPasswords);

    // Find user by username or email (CASE INSENSITIVE)
    const normalizedUsername = username.toLowerCase();
    const user = USERS.find(u => 
      u.name.toLowerCase() === normalizedUsername || 
      u.email.toLowerCase() === normalizedUsername
    );

    if (!user) throw new Error('User not found');
    
    // Validate password
    if (password) {
      if (PASSWORDS[user.id] && PASSWORDS[user.id] !== password) {
        throw new Error('Invalid credentials');
      }
    }
    
    return user;
  },

  register: async (name: string, email: string, password: string, department: string, role: Role = Role.EMPLOYEE): Promise<User> => {
     await new Promise(resolve => setTimeout(resolve, 500));
     
     // Refresh storage to ensure we don't overwrite if updated elsewhere
     const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
     if (storedUsers) USERS = JSON.parse(storedUsers);
     const storedPasswords = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
     if (storedPasswords) PASSWORDS = JSON.parse(storedPasswords);
     
     if (USERS.some(u => u.name.toLowerCase() === name.toLowerCase() || u.email.toLowerCase() === email.toLowerCase())) {
       throw new Error('User already exists');
     }

     const newUser: User = {
         id: `u${Date.now()}`,
         name,
         email,
         role: role,
         employeeId: role === Role.MANAGER ? `MGR${Date.now().toString().slice(-3)}` : `EMP${Date.now().toString().slice(-3)}`,
         department,
         avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
     };
     
     USERS.push(newUser);
     PASSWORDS[newUser.id] = password;
     
     // Save to persistence
     saveToStorage();
     
     return newUser;
  },

  getAttendanceHistory: async (userId: string): Promise<AttendanceRecord[]> => {
    // Ensure we have latest data
    const storedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (storedAttendance) ATTENDANCE_DB = JSON.parse(storedAttendance);
    
    return ATTENDANCE_DB.filter(r => r.userId === userId);
  },

  getAllAttendance: async (): Promise<(AttendanceRecord & { user: User })[]> => {
    const storedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (storedAttendance) ATTENDANCE_DB = JSON.parse(storedAttendance);
    
    // Refresh users too
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (storedUsers) USERS = JSON.parse(storedUsers);

    return ATTENDANCE_DB.map(r => ({
        ...r,
        user: USERS.find(u => u.id === r.userId)!
    })).filter(r => r.user); // safety check
  },

  getTodayStatus: async (userId: string): Promise<AttendanceRecord | null> => {
    const todayStr = new Date().toISOString().split('T')[0];
    const storedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (storedAttendance) ATTENDANCE_DB = JSON.parse(storedAttendance);

    return ATTENDANCE_DB.find(r => r.userId === userId && r.date === todayStr) || null;
  },

  checkIn: async (userId: string): Promise<AttendanceRecord> => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isLate = now.getHours() >= 10; // Late after 10 AM

    const newRecord: AttendanceRecord = {
      id: `att-${userId}-${Date.now()}`,
      userId,
      date: todayStr,
      checkInTime: now.toISOString(),
      status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
      totalHours: 0
    };
    
    ATTENDANCE_DB.push(newRecord);
    saveToStorage();
    return newRecord;
  },

  checkOut: async (userId: string): Promise<AttendanceRecord> => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const recordIndex = ATTENDANCE_DB.findIndex(r => r.userId === userId && r.date === todayStr);
    
    if (recordIndex === -1) throw new Error("No check-in found for today");

    const record = ATTENDANCE_DB[recordIndex];
    const checkIn = new Date(record.checkInTime!);
    const hours = (now.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    const updatedRecord = {
      ...record,
      checkOutTime: now.toISOString(),
      totalHours: parseFloat(hours.toFixed(2)),
      status: hours < 4 ? AttendanceStatus.HALF_DAY : record.status
    };

    ATTENDANCE_DB[recordIndex] = updatedRecord;
    saveToStorage();
    return updatedRecord;
  },

  getUsers: async (): Promise<User[]> => {
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) USERS = JSON.parse(storedUsers);
      return USERS.filter(u => u.role === Role.EMPLOYEE);
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reload users before updating
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (storedUsers) USERS = JSON.parse(storedUsers);

    const index = USERS.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');
    
    USERS[index] = { ...USERS[index], ...updates };
    saveToStorage();
    return USERS[index];
  },

  changePassword: async (userId: string, newPass: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Reload passwords
    const storedPasswords = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
    if (storedPasswords) PASSWORDS = JSON.parse(storedPasswords);
    
    if (PASSWORDS[userId] || USERS.find(u => u.id === userId)) {
        PASSWORDS[userId] = newPass;
        saveToStorage();
    }
    console.log(`Password updated for user ${userId}`);
    return;
  }
};