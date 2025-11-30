import React, { useEffect, useState } from 'react';
import { Download, Filter, Search } from 'lucide-react';
import { MockService } from '../../services/mockData';
import { AttendanceRecord, AttendanceStatus, User } from '../../types';

export const Reports: React.FC = () => {
  const [data, setData] = useState<(AttendanceRecord & { user: User })[]>([]);
  const [filteredData, setFilteredData] = useState<(AttendanceRecord & { user: User })[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  useEffect(() => {
    MockService.getAllAttendance().then(res => {
        setData(res);
        setFilteredData(res);
    });
  }, []);

  useEffect(() => {
    let result = data;
    
    // Text Search
    if (search) {
        result = result.filter(r => r.user.name.toLowerCase().includes(search.toLowerCase()) || r.user.employeeId.toLowerCase().includes(search.toLowerCase()));
    }
    
    // Status Filter
    if (statusFilter !== 'ALL') {
        result = result.filter(r => r.status === statusFilter);
    }
    
    // Department Filter
    if (departmentFilter !== 'ALL') {
        result = result.filter(r => r.user.department === departmentFilter);
    }

    // Date Range Filter
    if (startDate) {
        result = result.filter(r => r.date >= startDate);
    }
    if (endDate) {
        result = result.filter(r => r.date <= endDate);
    }

    setFilteredData(result);
  }, [search, statusFilter, departmentFilter, startDate, endDate, data]);

  const exportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Date', 'Status', 'Check In', 'Check Out', 'Total Hours'];
    const rows = filteredData.map(r => [
        r.user.employeeId,
        r.user.name,
        r.user.department,
        r.date,
        r.status,
        r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '',
        r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '',
        r.totalHours
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers, ...rows].map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const departments = Array.from(new Set(data.map(r => r.user.department)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-black">Attendance Reports</h1>
        <button 
            onClick={exportCSV}
            className="mt-4 md:mt-0 flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
            <Download size={18} />
            <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="relative">
            <label className="text-xs text-gray-500 font-semibold ml-1 mb-1 block">Search</label>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-black" size={18} />
                <input 
                    type="text" 
                    placeholder="Search employee..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black placeholder:text-gray-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
        
        <div className="relative">
            <label className="text-xs text-gray-500 font-semibold ml-1 mb-1 block">Status</label>
            <div className="relative">
                <Filter className="absolute left-3 top-2.5 text-black" size={18} />
                <select 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-black"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All Statuses</option>
                    {Object.values(AttendanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>

        <div className="relative">
             <label className="text-xs text-gray-500 font-semibold ml-1 mb-1 block">Department</label>
             <div className="relative">
                <Filter className="absolute left-3 top-2.5 text-black" size={18} />
                <select 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-black"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                    <option value="ALL">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
             </div>
        </div>
        
        {/* Date Range Inputs */}
        <div className="flex items-center space-x-2">
            <div className="relative flex-1">
                <label className="text-xs text-gray-500 font-semibold ml-1 mb-1 block">From</label>
                <input 
                    type="date" 
                    className="w-full px-2 py-2 border border-gray-200 rounded-lg outline-none text-black text-sm focus:ring-2 focus:ring-blue-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>
            <div className="relative flex-1">
                <label className="text-xs text-gray-500 font-semibold ml-1 mb-1 block">To</label>
                <input 
                    type="date" 
                    className="w-full px-2 py-2 border border-gray-200 rounded-lg outline-none text-black text-sm focus:ring-2 focus:ring-blue-500" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-black text-xs uppercase font-bold">
                    <tr>
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Check In</th>
                        <th className="px-6 py-4">Check Out</th>
                        <th className="px-6 py-4">Hours</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredData.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-medium text-black">{r.user.name}</p>
                                    <p className="text-xs text-black">{r.user.employeeId}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-black whitespace-nowrap">{r.date}</td>
                            <td className="px-6 py-4 text-sm text-black">{r.user.department}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-semibold 
                                    ${r.status === AttendanceStatus.PRESENT ? 'bg-green-100 text-green-700' : ''}
                                    ${r.status === AttendanceStatus.ABSENT ? 'bg-red-100 text-red-700' : ''}
                                    ${r.status === AttendanceStatus.LATE ? 'bg-yellow-100 text-yellow-700' : ''}
                                    ${r.status === AttendanceStatus.HALF_DAY ? 'bg-orange-100 text-orange-700' : ''}
                                `}>
                                    {r.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-black whitespace-nowrap">
                                {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-black whitespace-nowrap">
                                {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-black">{r.totalHours}</td>
                        </tr>
                    ))}
                    {filteredData.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-black">No records found matching your filters.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 text-sm text-black">
            Showing {filteredData.length} records
        </div>
      </div>
    </div>
  );
};