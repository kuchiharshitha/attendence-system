require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Attendance = require('./models/Attendance');

const app = express();
app.use(express.json({ limit: '50mb' })); // Increased limit for avatar uploads
app.use(cors());

// --- Database Connection ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_db';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Seed Helper ---
const seedData = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('Seeding initial data...');
    const hashedPassword = await bcrypt.hash('password', 10);
    
    await User.create([
      {
        name: 'Harshitha',
        email: 'harshitha@example.com',
        password: hashedPassword,
        role: 'MANAGER',
        employeeId: 'MGR001',
        department: 'Management',
        avatar: 'https://ui-avatars.com/api/?name=Harshitha&background=9333ea&color=fff'
      },
      {
        name: 'Bhaskar',
        email: 'bhaskar@example.com',
        password: hashedPassword,
        role: 'EMPLOYEE',
        employeeId: 'EMP001',
        department: 'Engineering',
        avatar: 'https://ui-avatars.com/api/?name=Bhaskar&background=2563eb&color=fff'
      },
      {
        name: 'Rathana',
        email: 'rathana@example.com',
        password: hashedPassword,
        role: 'EMPLOYEE',
        employeeId: 'EMP002',
        department: 'Design',
        avatar: 'https://ui-avatars.com/api/?name=Rathana&background=random&color=fff'
      },
      {
        name: 'Ruthvika',
        email: 'ruthvika@example.com',
        password: hashedPassword,
        role: 'EMPLOYEE',
        employeeId: 'EMP003',
        department: 'Testing',
        avatar: 'https://ui-avatars.com/api/?name=Ruthvika&background=random&color=fff'
      },
      {
        name: 'Nandha',
        email: 'nandha@example.com',
        password: hashedPassword,
        role: 'EMPLOYEE',
        employeeId: 'EMP004',
        department: 'HR',
        avatar: 'https://ui-avatars.com/api/?name=Nandha&background=random&color=fff'
      }
    ]);
    console.log('✅ Seed data inserted');
  }
};
seedData();

// --- Auth Routes ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const employeeId = role === 'MANAGER' 
      ? `MGR${Date.now().toString().slice(-3)}` 
      : `EMP${Date.now().toString().slice(-3)}`;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      role,
      employeeId,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });

    res.status(201).json({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      department: user.department, 
      avatar: user.avatar 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Find by email OR name (case insensitive)
    const user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${username}$`, 'i') } },
        { name: { $regex: new RegExp(`^${username}$`, 'i') } }
      ]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department,
      avatar: user.avatar
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/users/:id/change-password', async (req, res) => {
    try {
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
        res.json({ message: 'Password updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({ role: 'EMPLOYEE' });
        // Map _id to id for frontend consistency
        const mapped = users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            employeeId: u.employeeId,
            department: u.department,
            avatar: u.avatar
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Attendance Routes ---

app.get('/api/attendance/today/:userId', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const record = await Attendance.findOne({ userId: req.params.userId, date: todayStr });
    
    if (record) {
        res.json({
            id: record._id,
            userId: record.userId,
            date: record.date,
            checkInTime: record.checkInTime,
            checkOutTime: record.checkOutTime,
            status: record.status,
            totalHours: record.totalHours
        });
    } else {
        res.json(null);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/attendance/history/:userId', async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.params.userId });
    res.json(records.map(r => ({
        id: r._id,
        userId: r.userId,
        date: r.date,
        checkInTime: r.checkInTime,
        checkOutTime: r.checkOutTime,
        status: r.status,
        totalHours: r.totalHours
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/attendance/checkin', async (req, res) => {
  try {
    const { userId } = req.body;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isLate = now.getHours() >= 10;

    const record = await Attendance.create({
      userId,
      date: todayStr,
      checkInTime: now,
      status: isLate ? 'LATE' : 'PRESENT'
    });
    
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/attendance/checkout', async (req, res) => {
  try {
    const { userId } = req.body;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const record = await Attendance.findOne({ userId, date: todayStr });
    if (!record) return res.status(404).json({ message: 'No check-in record found' });

    const checkIn = new Date(record.checkInTime);
    const hours = (now - checkIn) / (1000 * 60 * 60);

    record.checkOutTime = now;
    record.totalHours = parseFloat(hours.toFixed(2));
    if (hours < 4) record.status = 'HALF_DAY';
    
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/attendance/all', async (req, res) => {
    try {
        const records = await Attendance.find().populate('userId');
        const formatted = records.map(r => ({
            id: r._id,
            userId: r.userId._id,
            date: r.date,
            checkInTime: r.checkInTime,
            checkOutTime: r.checkOutTime,
            status: r.status,
            totalHours: r.totalHours,
            user: {
                id: r.userId._id,
                name: r.userId.name,
                email: r.userId.email,
                role: r.userId.role,
                employeeId: r.userId.employeeId,
                department: r.userId.department,
                avatar: r.userId.avatar
            }
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));