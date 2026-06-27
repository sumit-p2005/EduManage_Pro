import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Calendar, 
  BookOpen, 
  CheckSquare, 
  Award, 
  DollarSign, 
  Bell, 
  FileText,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/student');
        setData(response.data);
      } catch (err) {
        console.error('Failed to load student dashboard data', err);
        setError('Failed to load your personal dashboard details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-500 dark:text-slate-400 font-medium">Loading your portal...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-500 gap-3">
        <AlertCircle size={40} />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  const { studentProfile, kpis, todayTimetable, recentAnnouncements, recentUpdates } = data;
  const feeDetails = studentProfile.feeDetails || { total: 0, paid: 0, remaining: 0, dueDate: '', status: 'Unassigned' };

  // Determine current day for timetable filtering
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = daysOfWeek[new Date().getDay()];
  const todayClasses = todayTimetable.filter(t => t.day.toLowerCase() === currentDay.toLowerCase());

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white shadow-soft relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10 max-w-xl">
          <h1 className="font-outfit font-extrabold text-2xl sm:text-3xl leading-tight">Welcome Back, {studentProfile.name}!</h1>
          <p className="text-white/80 text-sm mt-1.5 leading-relaxed">
            Review your classes scheduled for today, download files for pending homework assignments, and keep track of upcoming tests.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* KPI 1: Homework */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pending Homework</p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{kpis.pendingHomeworkCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CheckSquare size={24} />
          </div>
        </div>

        {/* KPI 2: Tests */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Upcoming Tests</p>
            <h3 className="text-3xl font-extrabold text-secondary mt-2">{kpis.upcomingTestsCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <Award size={24} />
          </div>
        </div>

        {/* KPI 3: Notes */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Study Notes Uploaded</p>
            <h3 className="text-3xl font-extrabold text-success mt-2">{kpis.notesCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
            <BookOpen size={24} />
          </div>
        </div>

      </div>

      {/* Main Section Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Today's Timetable & Fee Summary (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Timetable */}
          <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h4 className="font-outfit font-bold text-slate-800 dark:text-white text-base">Today's Class Schedule ({currentDay})</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Assigned to batch: {studentProfile.batchName}</p>
              </div>
              <Link to="/timetable" className="text-xs text-primary dark:text-primary-light hover:underline font-semibold flex items-center gap-1">
                <span>Full Timetable</span>
              </Link>
            </div>

            <div className="space-y-4">
              {todayClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Calendar size={36} className="text-slate-300 dark:text-slate-600 mb-2" />
                  <span className="text-sm text-slate-400 dark:text-slate-505 font-medium">No classes scheduled for today. Recheck timetables for holiday notices.</span>
                </div>
              ) : (
                todayClasses.map((item) => (
                  <div key={item.id} className="space-y-3">
                    {item.isHoliday ? (
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 text-orange-700 dark:text-orange-400 rounded-xl flex items-center gap-3">
                        <AlertCircle className="shrink-0" />
                        <div>
                          <p className="font-bold text-sm">Holiday Notice</p>
                          <p className="text-xs mt-0.5">{item.remarks || 'Institute is closed today.'}</p>
                        </div>
                      </div>
                    ) : item.isCancelled ? (
                      <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3">
                        <AlertCircle className="shrink-0" />
                        <div>
                          <p className="font-bold text-sm">Cancelled Classes</p>
                          <p className="text-xs mt-0.5">{item.remarks || 'Classes for today have been cancelled.'}</p>
                        </div>
                      </div>
                    ) : (
                      item.classes.map((cls, idx) => (
                        <div 
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 hover:border-primary/20 transition-all shadow-sm"
                        >
                          <div>
                            <span className="text-xs font-semibold text-primary dark:text-primary-light uppercase tracking-wider">{cls.time}</span>
                            <h5 className="font-bold text-slate-800 dark:text-white mt-1 text-sm">{cls.subject}</h5>
                          </div>
                          <span className="px-3 py-1 bg-slate-205 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-lg text-xs self-start sm:self-center mt-2 sm:mt-0">
                            {cls.room || 'Room A1'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fee Summary */}
          <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
            <div className="flex justify-between items-center mb-5">
              <h4 className="font-outfit font-bold text-slate-800 dark:text-white text-base">Fee Summary Statement</h4>
              <Link to="/fees" className="text-xs text-primary dark:text-primary-light hover:underline font-semibold">Ledger & History</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/30 rounded-xl text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Course Fee</p>
                <p className="text-lg font-extrabold text-slate-800 dark:text-white mt-2">₹{feeDetails.total.toLocaleString()}</p>
              </div>

              <div className="p-4 bg-green-50/20 dark:bg-green-950/5 border border-green-100 dark:border-green-950/20 rounded-xl text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-green-500 dark:text-green-500">Fees Paid</p>
                <p className="text-lg font-extrabold text-green-600 dark:text-green-450 mt-2">₹{feeDetails.paid.toLocaleString()}</p>
              </div>

              <div className={`p-4 border rounded-xl text-center ${
                feeDetails.remaining > 0 
                  ? 'bg-red-50/20 dark:bg-red-950/5 border-red-100 dark:border-red-950/20' 
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-700/30'
              }`}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400">Remaining Balance</p>
                <p className={`text-lg font-extrabold mt-2 ${feeDetails.remaining > 0 ? 'text-red-650 dark:text-red-450' : 'text-slate-800 dark:text-white'}`}>
                  ₹{feeDetails.remaining.toLocaleString()}
                </p>
              </div>

            </div>

            {feeDetails.remaining > 0 && (
              <div className="mt-5 p-4 rounded-xl bg-red-50 dark:bg-red-950/15 border border-red-100 dark:border-red-900/20 text-red-700 dark:text-red-400 flex items-center gap-3 text-xs">
                <AlertCircle className="shrink-0" />
                <p className="font-semibold leading-relaxed">
                  Important: An outstanding balance of <span className="font-extrabold">₹{feeDetails.remaining.toLocaleString()}</span> is pending. The due date is <span className="font-extrabold underline">{feeDetails.dueDate}</span>. Please request your guardian to clear installments.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Notices & Updates */}
        <div className="space-y-8">
          
          {/* Announcements notices */}
          <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft flex flex-col h-[350px]">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-outfit font-bold text-slate-800 dark:text-white text-base">Announcements</h4>
              <Link to="/announcements" className="text-xs text-primary dark:text-primary-light hover:underline font-semibold">All Notices</Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {recentAnnouncements.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">No active notices</div>
              ) : (
                recentAnnouncements.map(ann => (
                  <div 
                    key={ann.id} 
                    className={`p-4 rounded-xl border ${
                      ann.pinned 
                        ? 'border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10' 
                        : 'border-slate-100 bg-slate-50/50 dark:border-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{ann.title}</span>
                      {ann.pinned && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white bg-primary uppercase tracking-wide">Pinned</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">{ann.content}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 text-right mt-3 font-semibold">{ann.date}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Updates feed (notes, homeworks uploads) */}
          <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft flex flex-col h-[350px]">
            <div className="mb-5">
              <h4 className="font-outfit font-bold text-slate-800 dark:text-white text-base">Recent Updates Feed</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Study resources added recently</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {recentUpdates.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">No recent materials added</div>
              ) : (
                recentUpdates.map((update, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-50 dark:border-slate-700/20 hover:border-primary/10 hover:bg-slate-50/40 dark:hover:bg-slate-700/10 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      update.type === 'note' 
                        ? 'text-primary bg-primary/10' 
                        : update.type === 'homework' 
                          ? 'text-success bg-success/10' 
                          : 'text-secondary bg-secondary/10'
                    }`}>
                      {update.type === 'note' ? <BookOpen size={16} /> : update.type === 'homework' ? <CheckSquare size={16} /> : <FileText size={16} />}
                    </div>
                    
                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{update.title}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{update.details}</p>
                    </div>

                    <button 
                      onClick={() => navigate(`/${update.type === 'homework' ? 'homework' : update.type === 'note' ? 'notes' : 'tests'}`)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-650"
                      title="View Details"
                    >
                      <FileDown size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;
