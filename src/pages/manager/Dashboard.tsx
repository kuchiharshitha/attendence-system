import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';
import { MockService } from '../../services/mockData';
import { AttendanceStatus, User, AttendanceRecord } from '../../types';

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
}

export const ManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({ totalEmployees: 0, presentToday: 0, absentToday: 0, lateToday: 0 });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [deptData, setDeptData] = useState<any[]>([]);
  const [absentEmployees, setAbsentEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const users = await MockService.getUsers();
      const allAttendance = await MockService.getAllAttendance();
      
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecords = allAttendance.filter(r => r.date === todayStr);
      
      // 1. Basic Stats
      const effectiveRecords = todayRecords.length > 0 ? todayRecords : [];
      setStats({
        totalEmployees: users.length,
        presentToday: effectiveRecords.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.HALF_DAY).length,
        absentToday: effectiveRecords.filter(r => r.status === AttendanceStatus.ABSENT).length,
        lateToday: effectiveRecords.filter(r => r.status === AttendanceStatus.LATE).length,
      });

      // 2. Identify Absent Employees Today
      // An employee is absent if they have an 'ABSENT' record OR no record at all for today (assuming business day)
      const absentUserIds = effectiveRecords
        .filter(r => r.status === AttendanceStatus.ABSENT)
        .map(r => r.userId);
        
      // Also consider users with no record today as potentially absent/not checked in, 
      // but for "Absent List" strictly, usually we look for explicit ABSENT status or those who didn't check in by end of day.
      // For this demo, we'll list explicit ABSENT records.
      const absentList = users.filter(u => absentUserIds.includes(u.id));
      setAbsentEmployees(absentList);

      // 3. Weekly Trends Logic (Last 7 Days)
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
      const trends = last7Days.map(date => {
        const dayRecords = allAttendance.filter(r => r.date === date);
        return {
          date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
          Present: dayRecords.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.HALF_DAY || r.status === AttendanceStatus.LATE).length,
          Absent: dayRecords.filter(r => r.status === AttendanceStatus.ABSENT).length,
        };
      });
      setWeeklyData(trends);

      // 4. Department Data
      const deptStats = allAttendance.reduce((acc: any, curr) => {
        const dept = curr.user.department || 'Unknown';
        if (!acc[dept]) acc[dept] = { name: dept, Present: 0, Absent: 0, Late: 0 };
        
        if (curr.status === AttendanceStatus.ABSENT) acc[dept].Absent++;
        else if (curr.status === AttendanceStatus.LATE) acc[dept].Late++;
        else acc[dept].Present++;
        
        return acc;
      }, {});
      setDeptData(Object.values(deptStats));

      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div className="p-10 text-center text-black">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black">Manager Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Users} 
          label="Total Employees" 
          value={stats.totalEmployees} 
          color="text-blue-600" 
          bg="bg-blue-50"
          onClick={() => navigate('/manager/employees')}
          isClickable={true}
        />
        <StatCard 
          icon={UserCheck} 
          label="Present Today" 
          value={stats.presentToday} 
          color="text-green-600" 
          bg="bg-green-50" 
        />
        <StatCard 
          icon={UserX} 
          label="Absent Today" 
          value={stats.absentToday} 
          color="text-red-600" 
          bg="bg-red-50" 
        />
        <StatCard 
          icon={Clock} 
          label="Late Arrivals" 
          value={stats.lateToday} 
          color="text-yellow-600" 
          bg="bg-yellow-50" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">Weekly Attendance Trend</h3>
            <TrendingUp size={20} className="text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'black', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'black', fontSize: 12}} />
                <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="Present" stroke="#22c55e" fillOpacity={1} fill="url(#colorPresent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Wise */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-black">Department-wise Attendance</h3>
             <PieChart size={20} className="text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'black', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'black', fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="Present" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Absent Employees List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-black">Absent Employees Today</h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{absentEmployees.length} Absent</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-black text-xs uppercase font-bold">
                    <tr>
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {absentEmployees.map(emp => (
                        <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-black font-medium">{emp.name}</td>
                            <td className="px-6 py-4 text-black text-sm">{emp.employeeId}</td>
                            <td className="px-6 py-4 text-black text-sm">{emp.department}</td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Absent
                                </span>
                            </td>
                        </tr>
                    ))}
                    {absentEmployees.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                <UserCheck size={32} className="mx-auto text-green-500 mb-2" />
                                <p>No employees are marked absent today!</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: any;
  label: string;
  value: number;
  color: string;
  bg: string;
  onClick?: () => void;
  isClickable?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, bg, onClick, isClickable }) => (
    <div 
      onClick={onClick}
      className={`
        p-4 rounded-xl border shadow-sm flex items-center space-x-4 transition-all duration-200
        ${bg} 
        ${isClickable ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''}
        border-gray-100
      `}
    >
        <div className={`p-3 rounded-lg bg-white ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm text-black font-medium">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        {isClickable && (
          <div className="ml-auto text-xs font-semibold bg-white/50 px-2 py-1 rounded text-black opacity-60">
            View List
          </div>
        )}
    </div>
);
