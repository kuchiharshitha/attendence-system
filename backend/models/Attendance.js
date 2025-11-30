const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  status: { 
    type: String, 
    enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'], 
    default: 'ABSENT' 
  },
  totalHours: { type: Number, default: 0 }
});

module.exports = mongoose.model('Attendance', attendanceSchema);