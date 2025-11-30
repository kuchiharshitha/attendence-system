import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react';
import { Role } from '../types';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleNavigation = (mode: 'login' | 'register') => {
    if (selectedRole) {
      if (mode === 'login') {
        navigate(`/login?role=${selectedRole}`);
      } else {
        navigate(`/register?role=${selectedRole}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">Welcome to AttendancePro</h1>
          <p className="text-xl text-black opacity-80">The comprehensive employee attendance management system.</p>
        </div>

        {!selectedRole ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-black mb-8">Please select your role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {/* Employee Card */}
              <button
                onClick={() => handleRoleSelect(Role.EMPLOYEE)}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-500 transition-all group text-left"
              >
                <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                  <User size={32} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-2">Employee</h3>
                <p className="text-black opacity-70">Mark attendance, view history, and track your stats.</p>
                <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Continue as Employee</span>
                  <ArrowRight size={20} className="ml-2" />
                </div>
              </button>

              {/* Manager Card */}
              <button
                onClick={() => handleRoleSelect(Role.MANAGER)}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-purple-500 transition-all group text-left"
              >
                <div className="bg-purple-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
                  <Briefcase size={32} className="text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-2">Manager</h3>
                <p className="text-black opacity-70">Manage team attendance, view reports, and analyze data.</p>
                <div className="mt-6 flex items-center text-purple-600 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Continue as Manager</span>
                  <ArrowRight size={20} className="ml-2" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedRole(null)}
              className="flex items-center text-gray-500 hover:text-black mb-6 transition-colors"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back
            </button>
            
            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${selectedRole === Role.EMPLOYEE ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {selectedRole === Role.EMPLOYEE ? <User size={32} /> : <Briefcase size={32} />}
              </div>
              <h2 className="text-2xl font-bold text-black">
                {selectedRole === Role.EMPLOYEE ? 'Employee Portal' : 'Manager Portal'}
              </h2>
              <p className="text-black opacity-70 mt-2">Do you already have an account?</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleNavigation('login')}
                className="w-full bg-black text-white hover:bg-gray-800 font-bold py-4 px-6 rounded-xl transition-all transform active:scale-95 shadow-md flex justify-between items-center group"
              >
                <span>Yes, I have an account</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => handleNavigation('register')}
                className="w-full bg-white text-black border-2 border-gray-200 hover:border-black font-bold py-4 px-6 rounded-xl transition-all transform active:scale-95 flex justify-between items-center group"
              >
                <span>No, create new account</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};