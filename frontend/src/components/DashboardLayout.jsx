import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Map route paths to page titles for the Navbar
  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/students')) return 'Student Profiles';
    if (pathname.startsWith('/batches')) return 'Batches & Classrooms';
    if (pathname.startsWith('/timetable')) return 'Weekly Timetable';
    if (pathname.startsWith('/notes')) return 'Study Materials';
    if (pathname.startsWith('/homework')) return 'Homework Assignments';
    if (pathname.startsWith('/tests')) return 'Test Series';
    if (pathname.startsWith('/fees')) return 'Fee Management';
    if (pathname.startsWith('/announcements')) return 'Notice Board';
    if (pathname.startsWith('/gallery')) return 'Gallery & Toppers';
    if (pathname.startsWith('/queries')) return 'Help Desk & Doubts';
    return 'Dashboard';
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} title={getPageTitle(location.pathname)} />

        {/* View Content Port */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
