import React, { useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  ClipboardList, 
  LogOut, 
  UserCircle,
  Menu,
  X,
  Clock,
  PieChart,
  Camera,
  Key,
} from 'lucide-react';
import { Role } from '../types';
import { MockService } from '../services/mockData';
import { useAuthStore } from '../store';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const result = reader.result as string;
            try {
                await MockService.updateUser(user.id, { avatar: result });
                updateUser({ avatar: result });
            } catch (error) {
                console.error("Failed to update avatar", error);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <NavLink
      to={to}
      onClick={() => setIsSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setIsProfileModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <button 
                    onClick={() => setIsProfileModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
                >
                    <X size={24} />
                </button>
                
                <div className="p-8 flex flex-col items-center">
                    <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                         {user?.avatar ? (
                            <img src={user.avatar} alt="Profile" className="w-32 h-32 rounded-full border-4 border-gray-100 object-cover shadow-md group-hover:opacity-90 transition-opacity" />
                         ) : (
                             <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                                 <UserCircle size={64} className="text-gray-400" />
                             </div>
                         )}
                         <button 
                            type="button"
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors pointer-events-none"
                            title="Change Profile Photo"
                         >
                             <Camera size={18} />
                         </button>
                    </div>
                    
                    <h2 className="mt-4 text-xl font-bold text-black">{user?.name}</h2>
                    <p className="text-sm text-gray-500 capitalize">{user?.role.toLowerCase()} • {user?.department}</p>
                    
                    <div className="mt-8 w-full space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                             <span className="text-sm text-gray-500">Username</span>
                             <span className="text-sm font-semibold text-black">{user?.name}</span>
                        </div>
                        
                        <button 
                            onClick={() => {
                                setIsProfileModalOpen(false);
                                navigate('/change-password');
                            }}
                            className="w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-black text-white py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                            <Key size={18} />
                            <span>Change Password</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Clock className="text-blue-500" size={28} />
            <h1 className="text-xl font-bold">AttendPro</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          {user?.role === Role.EMPLOYEE && (
            <>
              <NavItem to="/employee/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/employee/mark-attendance" icon={Clock} label="Mark Attendance" />
              <NavItem to="/employee/history" icon={CalendarDays} label="Attendance History" />
            </>
          )}

          {user?.role === Role.MANAGER && (
            <>
              <NavItem to="/manager/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/manager/reports" icon={ClipboardList} label="Reports" />
              <NavItem to="/manager/analytics" icon={PieChart} label="Analytics" />
            </>
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-gray-400 hover:text-white w-full px-4 py-3 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-black hover:text-gray-700"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center justify-end w-full space-x-4">
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-black">{user?.name}</p>
                    <p className="text-xs text-black capitalize">{user?.role.toLowerCase()}</p>
                 </div>
                 {user?.avatar ? (
                   <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                 ) : (
                   <UserCircle className="w-10 h-10 text-black" />
                 )}
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-6">
           <div className="max-w-7xl mx-auto">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
};