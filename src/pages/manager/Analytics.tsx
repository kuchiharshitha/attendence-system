import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { MockService } from '../../services/mockData';
import { AttendanceRecord, AttendanceStatus, User } from '../../types';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<(AttendanceRecord & { user: User })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MockService.getAllAttendance().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-black text-center">Loading Analytics...</div>;

  // 1. Weekly Trends (Last 7 Days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const weeklyTrendData = last7Days.map(date => {
    const dayRecords = data.filter(r => r.date === date);
    return {
      date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      Present: dayRecords.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.HALF_DAY || r.status === AttendanceStatus.LATE).length,
      Absent: dayRecords.filter(r => r.status === AttendanceStatus.ABSENT).length,
    };
  });

  // 2. Department Distribution
  const deptStats = data.reduce((acc: any, curr) => {
    const dept = curr.user.department || 'Unknown';
    if (!acc[dept]) acc[dept] = { name: dept, Present: 0, Absent: 0, Late: 0 };
    
    if (curr.status === AttendanceStatus.ABSENT) acc[dept].Absent++;
    else if (curr.status === AttendanceStatus.LATE) acc[dept].Late++;
    else acc[dept].Present++;
    
    return acc;
  }, {});
  const deptData = Object.values(deptStats);

  // 3. Overall Status Breakdown
  const statusCounts = {
    Present: data.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.HALF_DAY).length,
    Late: data.filter(r => r.status === AttendanceStatus.LATE).length,
    Absent: data.filter(r => r.status === AttendanceStatus.ABSENT).length,
  };
  const pieData = [
    { name: 'Present', value: statusCounts.Present, color: '#22c55e' },
    { name: 'Late', value: statusCounts.Late, color: '#eab308' },
    { name: 'Absent', value: statusCounts.Absent, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black">Analytics Overview</h1>

      {/* Weekly Trend */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-black mb-4">Weekly Attendance Trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyTrendData}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'black'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'black'}} />
              <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend />
              <Area type="monotone" dataKey="Present" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPresent)" />
              <Area type="monotone" dataKey="Absent" stroke="#ef4444" fillOpacity={1} fill="url(#colorAbsent)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-black mb-4">Department-wise Attendance</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'black'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'black'}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#fff', borderRadius: '8px', color: 'black'}} />
                <Legend />
                <Bar dataKey="Present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Late" fill="#eab308" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-black mb-4">Overall Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};