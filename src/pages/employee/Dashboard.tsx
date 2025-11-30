import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  CalendarCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Timer,
  History,
  Briefcase
} from 'lucide-react';
import { MockService } from '../../services/mockData';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { useAuthStore } from '../../store';
import { Link } from 'react-router-dom';

// --- Shared Logic Hook ---
const useEmployeeAttendance = () => {
  const { user } = useAuthStore();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    if (!user) return;
    try {
      const today = await MockService.getTodayStatus(user.id);
      const all = await MockService.getAttendanceHistory(user.id);
      setTodayRecord(today);
      setHistory(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    setLoading(true);
    await MockService.checkIn(user.id);
    await fetchData();
  };

  const handleCheckOut = async () => {
    if (!user) return;
    setLoading(true);
    await MockService.checkOut(user.id);
    await fetchData();
  };

  return {
    user,
    todayRecord,
    history,
    loading,
    currentTime,
    handleCheckIn,
    handleCheckOut
  };
};

// --- Sub-Components ---

const WelcomeSection = ({ user, currentTime }: { user: any, currentTime: Date }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div>
      <h1 className="text-2xl font-bold text-black">Good {currentTime.getHours() < 12 ? 'Morning' : 'Afternoon'}, {user?.name.split(' ')[0]}!</h1>
      <p className="text-black mt-1">Here's your attendance overview for today.</p>
    </div>
    <div className="mt-4 md:mt-0 text-right">
      <p className="text-3xl font-mono font-bold text-blue-600">
        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
      <p className="text-black text-sm">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  </div>
);

const SimpleStatusWidget = ({ todayRecord }: { todayRecord: AttendanceRecord | null }) => {
  const isCheckedIn = todayRecord?.checkInTime && !todayRecord?.checkOutTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center h-full">
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-3 rounded-full ${isCheckedIn ? 'bg-green-100 text-green-600' : isCheckedOut ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
          <Briefcase size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-black">Today's Status</h2>
          <p className="text-sm text-gray-500">Your current attendance state</p>
        </div>
      </div>

      <div className={`p-4 rounded-lg text-center border-2 ${isCheckedIn ? 'border-green-100 bg-green-50' : isCheckedOut ? 'border-blue-100 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
        <p className={`text-xl font-bold ${isCheckedIn ? 'text-green-700' : isCheckedOut ? 'text-blue-700' : 'text-gray-600'}`}>
          {isCheckedIn ? 'Checked In' : isCheckedOut ? 'Checked Out' : 'Not Checked In'}
        </p>
        {todayRecord?.checkInTime && (
           <p className="text-sm mt-1 text-black">
             In: {new Date(todayRecord.checkInTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
             {todayRecord.checkOutTime && ` • Out: ${new Date(todayRecord.checkOutTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`}
           </p>
        )}
      </div>
      
      {!isCheckedOut && (
        <div className="mt-4 text-center">
            <Link to="/employee/mark-attendance" className="text-sm text-blue-600 hover:underline font-medium">
                Go to Mark Attendance &rarr;
            </Link>
        </div>
      )}
    </div>
  );
};

const CheckInCard = ({ todayRecord, handleCheckIn, handleCheckOut }: any) => (
  <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-6 text-white shadow-lg flex flex-col justify-center items-center h-full min-h-[300px]">
    <div className="mb-6">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm animate-pulse">
            <Clock size={48} className="text-white" />
        </div>
    </div>
    
    <h2 className="text-2xl font-semibold mb-2 text-white text-center">
        {todayRecord?.checkOutTime ? 'You are checked out' : todayRecord?.checkInTime ? 'You are checked in' : 'Not checked in yet'}
    </h2>
    <p className="text-white/80 mb-8 text-center text-sm">
        {todayRecord?.checkOutTime ? 'Have a great evening!' : todayRecord?.checkInTime ? 'Have a productive day!' : 'Please mark your attendance.'}
    </p>

    {!todayRecord ? (
        <button 
            onClick={handleCheckIn}
            className="w-full max-w-xs bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-xl text-lg"
        >
            Check In Now
        </button>
    ) : !todayRecord.checkOutTime ? (
         <button 
            onClick={handleCheckOut}
            className="w-full max-w-xs bg-red-500 text-white hover:bg-red-600 font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-xl text-lg"
        >
            Check Out
        </button>
    ) : (
        <div className="flex items-center space-x-2 bg-white/20 px-6 py-3 rounded-xl text-white backdrop-blur-sm">
            <CheckCircle2 size={24} />
            <span className="font-semibold">Attendance Completed</span>
        </div>
    )}
    
    {todayRecord && (
        <div className="mt-8 w-full grid grid-cols-2 gap-4 text-center text-sm bg-white/10 p-4 rounded-xl text-white backdrop-blur-sm">
            <div>
                <p className="opacity-70 text-xs uppercase tracking-wider">Check In</p>
                <p className="font-mono font-bold text-lg">{new Date(todayRecord.checkInTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            <div>
                <p className="opacity-70 text-xs uppercase tracking-wider">Check Out</p>
                <p className="font-mono font-bold text-lg">{todayRecord.checkOutTime ? new Date(todayRecord.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</p>
            </div>
        </div>
    )}
  </div>
);

const MonthStats = ({ history }: { history: AttendanceRecord[] }) => {
  // Stats Calculation
  const currentMonth = new Date().getMonth();
  const monthlyRecords = history.filter(r => new Date(r.date).getMonth() === currentMonth);
  const presentDays = monthlyRecords.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE || r.status === AttendanceStatus.HALF_DAY).length;
  const lateDays = monthlyRecords.filter(r => r.status === AttendanceStatus.LATE).length;
  const absentDays = monthlyRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
  const totalHours = monthlyRecords.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Present" value={presentDays} sublabel="Days this month" color="text-green-600" bg="bg-green-50" />
        <StatCard icon={AlertCircle} label="Late" value={lateDays} sublabel="Days this month" color="text-yellow-600" bg="bg-yellow-50" />
        <StatCard icon={XCircle} label="Absent" value={absentDays} sublabel="Days this month" color="text-red-600" bg="bg-red-50" />
        <StatCard icon={Timer} label="Hours" value={totalHours.toFixed(1)} sublabel="Worked this month" color="text-purple-600" bg="bg-purple-50" />
    </div>
  );
};

const RecentAttendance = ({ history }: { history: AttendanceRecord[] }) => {
  // Get last 7 records sorted by date descending
  const recentRecords = [...history]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const getStatusColor = (status?: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return 'bg-green-100 text-green-700';
      case AttendanceStatus.ABSENT: return 'bg-red-100 text-red-700';
      case AttendanceStatus.LATE: return 'bg-yellow-100 text-yellow-700';
      case AttendanceStatus.HALF_DAY: return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex items-center space-x-2">
        <History size={20} className="text-gray-500" />
        <h3 className="font-bold text-black">Recent Attendance (Last 7 Days)</h3>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-black text-xs uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Check In</th>
              <th className="px-4 py-3 font-semibold">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentRecords.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-black font-medium">
                    {new Date(r.date).toLocaleDateString(undefined, {weekday: 'short', day: 'numeric', month: 'short'})}
                </td>
                <td className="px-4 py-3">
                   <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(r.status)}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                    {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-black font-semibold">{r.totalHours}h</td>
              </tr>
            ))}
            {recentRecords.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500 text-sm">No recent attendance records found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sublabel, color, bg }: any) => (
    <div className={`p-4 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-4 ${bg} transition-transform hover:-translate-y-1`}>
        <div className={`p-3 rounded-lg bg-white shadow-sm ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm text-gray-600 font-medium">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
        </div>
    </div>
);

// --- Main Components ---

export const EmployeeDashboard: React.FC = () => {
  const { user, todayRecord, history, loading, currentTime } = useEmployeeAttendance();

  if (loading && !todayRecord) return <div className="p-10 text-center text-black">Loading...</div>;

  return (
    <div className="space-y-6">
      <WelcomeSection user={user} currentTime={currentTime} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Status (Read Only Widget) */}
        <div className="lg:col-span-1">
            <SimpleStatusWidget todayRecord={todayRecord} />
        </div>
        
        {/* Right Column: Stats & Recent List */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
            <MonthStats history={history} />
            <div className="flex-1">
                <RecentAttendance history={history} />
            </div>
        </div>
      </div>
    </div>
  );
};

export const EmployeeMarkAttendance: React.FC = () => {
    const { user, todayRecord, loading, currentTime, handleCheckIn, handleCheckOut } = useEmployeeAttendance();
  
    if (loading && !todayRecord) return <div className="p-10 text-center text-black">Loading...</div>;
  
    return (
      <div className="space-y-6">
        <WelcomeSection user={user} currentTime={currentTime} />
        <div className="max-w-xl mx-auto mt-8">
            <CheckInCard todayRecord={todayRecord} handleCheckIn={handleCheckIn} handleCheckOut={handleCheckOut} />
        </div>
      </div>
    );
  };
