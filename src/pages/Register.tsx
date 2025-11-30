import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, User as UserIcon, Lock, ArrowLeft } from 'lucide-react';
import { MockService } from '../services/mockData';
import { Role } from '../types';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      // Register with the specific role if provided, otherwise default to Employee
      const roleToRegister = (roleParam as Role) || Role.EMPLOYEE;
      // Default department to General as field is removed from UI
      // Pass password to register function
      await MockService.register(username, email, password, 'General', roleToRegister);
      
      // Redirect to login page with success flag
      navigate(`/login?role=${roleToRegister}&registered=true`);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (roleParam) {
      const roleText = roleParam === Role.MANAGER ? 'Manager' : 'Employee';
      return `Create ${roleText} Account`;
    }
    return 'Create Account';
  };

  const loginLink = `/login${roleParam ? `?role=${roleParam}` : ''}`;

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
              <Mail className="absolute left-3 top-3 text-black" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black placeholder:text-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-black" size={20} />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black placeholder:text-gray-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${roleParam === Role.MANAGER ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50`}
            >
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-black">
            <p className="text-sm">
              Already have an account?{' '}
              <Link to={loginLink} className={`${roleParam === Role.MANAGER ? 'text-purple-600' : 'text-blue-600'} font-semibold hover:underline`}>
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};