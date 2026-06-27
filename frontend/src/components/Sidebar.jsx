import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Users, 
  Layers, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Award, 
  DollarSign, 
  Bell, 
  Image as ImageIcon, 
  HelpCircle, 
  LogOut,
  LayoutDashboard,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const menuItems = isAdmin ? [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Batches', path: '/batches', icon: Layers },
    { name: 'Timetable', path: '/timetable', icon: Calendar },
    { name: 'Study Notes', path: '/notes', icon: BookOpen },
    { name: 'Homework', path: '/homework', icon: CheckSquare },
    { name: 'Test Series', path: '/tests', icon: Award },
    { name: 'Fees Management', path: '/fees', icon: DollarSign },
    { name: 'Announcements', path: '/announcements', icon: Bell },
    { name: 'Gallery', path: '/gallery', icon: ImageIcon },
    { name: 'Queries Inbox', path: '/queries', icon: HelpCircle },
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Timetable', path: '/timetable', icon: Calendar },
    { name: 'Study Notes', path: '/notes', icon: BookOpen },
    { name: 'Homework', path: '/homework', icon: CheckSquare },
    { name: 'Test Series', path: '/tests', icon: Award },
    { name: 'Fee Details', path: '/fees', icon: DollarSign },
    { name: 'Announcements', path: '/announcements', icon: Bell },
    { name: 'Gallery', path: '/gallery', icon: ImageIcon },
    { name: 'Contact Admin', path: '/queries', icon: HelpCircle },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700/60 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-full ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/20">
              <BookOpen size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-outfit font-bold text-lg text-slate-800 dark:text-white tracking-wide">EduManage Pro</h1>
              <p className="text-[10px] text-primary dark:text-primary-light font-semibold tracking-wider uppercase">Coaching System</p>
            </div>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-700/30 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3.5">
            <img 
              src={user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
              alt={user?.name}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-primary/10 shadow-sm"
            />
            <div className="overflow-hidden">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 truncate text-sm">{user?.name}</h3>
              <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-bold text-white uppercase bg-gradient-to-r from-primary/90 to-secondary/90 rounded-md">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light shadow-glow-primary'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      size={18} 
                      className={`transition-colors duration-200 ${
                        isActive 
                          ? 'text-primary dark:text-primary-light' 
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700/60">
          <button 
            onClick={logout}
            className="flex items-center justify-center w-full gap-3 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors duration-200"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
