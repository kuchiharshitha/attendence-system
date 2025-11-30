import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Mail, 
  Briefcase,
  ArrowLeft
} from 'lucide-react';
import { MockService } from '../../services/mockData';
import { User } from '../../types';

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const users = await MockService.getUsers();
      setEmployees(users);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div className="p-10 text-center text-black">Loading Employees...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
          <button onClick={() => navigate('/manager/dashboard')} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-black">
              <ArrowLeft size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <Users className="text-blue-600" size={28} />
            <h1 className="text-2xl font-bold text-black">Registered Employees</h1>
            <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-sm font-bold">
              {employees.length}
            </span>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-black text-xs uppercase font-bold">
                    <tr>
                        <th className="px-6 py-4">Employee Name</th>
                        <th className="px-6 py-4">Employee ID</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {employees.map(emp => (
                        <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    {emp.avatar ? (
                                      <img src={emp.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                        {emp.name.charAt(0)}
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-medium text-black">{emp.name}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-black text-sm font-mono">
                              <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{emp.employeeId}</span>
                            </td>
                            <td className="px-6 py-4 text-black text-sm">
                              <div className="flex items-center space-x-2">
                                <Briefcase size={16} className="text-gray-400" />
                                <span>{emp.department}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-black text-sm">
                               <div className="flex items-center space-x-2">
                                  <Mail size={16} className="text-gray-400" />
                                  <span>{emp.email}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-sm capitalize">
                               {emp.role.toLowerCase()}
                            </td>
                        </tr>
                    ))}
                    {employees.length === 0 && (
                         <tr><td colSpan={5} className="p-8 text-center text-gray-500">No employees found.</td></tr>
                    )}
                </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};