import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { MockService } from '../services/mockData';
import { Role } from '../types';
import { useAuthStore } from '../store';

export const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const registered = searchParams.get('registered') === 'true';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Mock login using username and password
      const user = await MockService.login(username, password);
      login(user);
      // Redirect Employees to Mark Attendance page, Managers to Dashboard
      navigate(user.role === Role.MANAGER ? '/manager/dashboard' : '/employee/mark-attendance');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or user not found.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (roleParam) {
      const roleText = roleParam === Role.MANAGER ? 'Manager' : 'Employee';
      return `${roleText} Login`;
    }
    return 'Login';
  };

  const registerLink = `/register${roleParam ? `?role=${roleParam}` : ''}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-white/80 hover:text-white z-10 flex items-center text-sm"
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>

        <div className={`${roleParam === Role.MANAGER ? 'bg-purple-600' : 'bg-blue-600'} p-8 text-center transition-colors duration-300`}>
          <h2 className="text-3xl font-bold text-white mb-2">{getTitle()}</h2>
          <p className="text-white/80">AttendancePro System</p>
        </div>
        
        <div className="p-8">
          {registered && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center mb-4 border border-green-200">
              Registration successful! Please login with your credentials.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="relative">
              <UserIcon className="absolute left-3 top-3 text-black" size={20} />
              <input
                type="text"
                placeholder="Username"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black placeholder:text-gray-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-black" size={20} />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black placeholder:text-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${roleParam === Role.MANAGER ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50`}
            >
              {loading ? 'Processing...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center text-black">
            <p className="text-sm">
              Don't have an account?{' '}
              <Link to={registerLink} className={`${roleParam === Role.MANAGER ? 'text-purple-600' : 'text-blue-600'} font-semibold hover:underline`}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};