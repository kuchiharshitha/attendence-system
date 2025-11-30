import React, { useEffect, useState } from 'react';
import { MockService } from '../../services/mockData';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { ChevronLeft, ChevronRight, List, LayoutGrid } from 'lucide-react';
import { useAuthStore } from '../../store';

export const History: React.FC = () => {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      MockService.getAttendanceHistory(user.id).then(setHistory);
    }
  }, [user]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDay };
  };

  const { daysInMonth, firstDay } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);

  const getStatusColor = (status?: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return 'bg-green-100 text-green-700 border-green-200';
      case AttendanceStatus.ABSENT: return 'bg-red-100 text-red-700 border-red-200';
      case AttendanceStatus.LATE: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case AttendanceStatus.HALF_DAY: return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-black border-gray-100';
    }
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  // Check if the displayed month is the actual current month to disable future navigation
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-black mb-4 sm:mb-0">Attendance History</h2>
        
        <div className="flex items-center space-x-4">
           {view === 'calendar' && (
             <div className="flex items-center bg-gray-100 rounded-lg p-1">
               <button onClick={prevMonth} className="p-1 hover:bg-white rounded shadow-sm transition-all text-black"><ChevronLeft size={20} /></button>
               <span className="px-4 font-semibold w-32 text-center text-black">
                 {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
               </span>
               <button 
                 onClick={nextMonth} 
                 disabled={isCurrentMonth}
                 className={`p-1 rounded shadow-sm transition-all ${isCurrentMonth ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-black hover:bg-white'}`}
               >
                 <ChevronRight size={20} />
               </button>
             </div>
           )}
           
           <div className="flex bg-gray-100 rounded-lg p-1">
             <button 
               onClick={() => setView('calendar')}
               className={`p-2 rounded transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-black'}`}
             >
               <LayoutGrid size={20} />
             </button>
             <button 
               onClick={() => setView('list')}
               className={`p-2 rounded transition-all ${view === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-black'}`}
             >
               <List size={20} />
             </button>
           </div>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-bold text-black">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {padding.map(p => <div key={`pad-${p}`} className="h-24 md:h-32 bg-gray-50/50 rounded-lg" />)}
            {days.map(day => {
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const record = history.find(r => r.date === dateStr);
              
              // Calculate if the day is in the future
              const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const todayObj = new Date();
              todayObj.setHours(0, 0, 0, 0); // Normalize today to midnight

              if (cellDate > todayObj) {
                // Return an empty placeholder for future dates to maintain grid structure
                return <div key={day} className="h-24 md:h-32 rounded-lg bg-gray-50/10 border border-transparent"></div>;
              }

              return (
                <div key={day} className={`h-24 md:h-32 border rounded-lg p-2 transition-all hover:shadow-md ${record ? getStatusColor(record.status) : 'bg-white border-gray-100 text-black'}`}>
                  <div className="flex justify-between items-start">
                    <span className={`font-semibold text-sm ${record ? '' : 'text-black'}`}>{day}</span>
                    {record && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/50 uppercase">
                            {record.status}
                        </span>
                    )}
                  </div>
                  {record && (
                    <div className="mt-2 text-xs space-y-1">
                      {record.checkInTime && <p>In: {new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                      {record.checkOutTime && <p>Out: {new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                      {record.totalHours > 0 && <p className="font-semibold">{record.totalHours} hrs</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-black justify-center font-medium">
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Present</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span>Late</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span>Half Day</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Absent</span></div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-black text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Check In</th>
                <th className="px-6 py-4 font-bold">Check Out</th>
                <th className="px-6 py-4 font-bold">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-black">
                    {new Date(record.date).toLocaleDateString(undefined, {weekday: 'short', day: 'numeric', month: 'short'})}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(record.status).split(' ')[0]} ${getStatusColor(record.status).split(' ')[1]}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-black">
                    {record.totalHours}h
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                  <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-black">No records found.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};