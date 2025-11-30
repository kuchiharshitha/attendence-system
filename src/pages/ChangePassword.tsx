import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { MockService } from '../services/mockData';
import { useAuthStore } from '../store';

export const ChangePassword: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      if (user) {
        await MockService.changePassword(user.id, newPassword);
        setSuccess(true);
        setTimeout(() => {
            navigate(-1);
        }, 1500);
      }
    } catch (err) {
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-black">
              <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-black">Change Password</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {success ? (
            <div className="text-center py-10">
                <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-black mb-2">Password Updated!</h3>
                <p className="text-black opacity-70">Your password has been changed successfully.</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-semibold text-black">Current Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-black opacity-50" size={18} />
                    <input
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-black">New Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-black opacity-50" size={18} />
                    <input
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-black">Confirm New Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-black opacity-50" size={18} />
                    <input
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                    />
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm flex justify-center items-center space-x-2"
                >
                    {loading ? (
                        <span>Updating...</span>
                    ) : (
                        <>
                            <Save size={18} />
                            <span>Update Password</span>
                        </>
                    )}
                </button>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};