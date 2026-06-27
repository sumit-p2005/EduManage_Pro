import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Users, 
  Layers, 
  DollarSign, 
  Award, 
  BookOpen, 
  Plus, 
  Bell, 
  Phone, 
  ArrowRight,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useNavigate, Link } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/admin');
        setData(response.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
        setError('Failed to fetch dashboard data. Please try again.');
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
        <span className="text-slate-500 dark:text-slate-400 font-medium">Fetching dashboard metrics...</span>
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

  const { kpis, recentAnnouncements, feeReminders, charts } = data;

  const COLORS = ['#2563EB', '#7C3AED', '#22C55E', '#F97316', '#EF4444'];

  const quickActions = [
    { title: 'Add Student', path: '/students', icon: Plus, desc: 'Enroll new student' },
    { title: 'Create Batch', path: '/batches', icon: Layers, desc: 'Define classrooms' },
    { title: 'Upload Notes', path: '/notes', icon: BookOpen, desc: 'Share lecture resources' },
    { title: 'Create Test', path: '/tests', icon: Award, desc: 'Publish evaluation sheet' },
    { title: 'Post Notice', path: '/announcements', icon: Bell, desc: 'Notify student feed' },
    { title: 'Collect Fees', path: '/fees', icon: DollarSign, desc: 'Record incoming payment' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white shadow-soft relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10 max-w-xl">
          <h1 className="font-outfit font-extrabold text-2xl sm:text-3xl leading-tight">Welcome to Teacher Portal, Sumit!</h1>
          <p className="text-white/80 text-sm mt-1.5 leading-relaxed">
            Monitor admissions trends, evaluate student performance rankings, track installments, and dispatch notice announcements from one console.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Students</p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{kpis.totalStudents}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Batches</p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{kpis.totalBatches}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <Layers size={24} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pending Fees</p>
            <h3 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-2">₹{kpis.totalPendingFees.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Upcoming Tests</p>
            <h3 className="text-3xl font-extrabold text-success mt-2">{kpis.upcomingTests}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
            <Award size={24} />
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Admissions Monthly Trend */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
          <h4 className="font-outfit font-bold text-slate-800 dark:text-white text-base mb-6">Monthly Admissions (Current Year)</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyAdmissions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="admissions" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAdmissions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Students per Batch */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
          <h4 className="font-outfit font-bold text-slate-800 dark:text-white text-base mb-6">Students Enrollment per Batch</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.studentsPerBatch} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="students" fill="#7C3AED" radius={[8, 8, 0, 0]}>
                  {charts.studentsPerBatch.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Fee Collections Overview */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
          <h4 className="font-outfit font-bold text-slate-800 dark:text-white text-base mb-6">Fee Collection Overview</h4>
          <div className="flex flex-col sm:flex-row items-center justify-between h-72 gap-6">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.feeCollectionStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="amount"
                  >
                    <Cell fill="#22C55E" />
                    <Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full sm:w-1/2 space-y-4">
              {charts.feeCollectionStats.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-success' : 'bg-red-500'}`} />
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.name} Balance</span>
                  </div>
                  <p className="text-lg font-bold text-slate-850 dark:text-white mt-1">
                    ₹{item.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 4: Average Test Performance */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
          <h4 className="font-outfit font-bold text-slate-800 dark:text-white text-base mb-6">Average Test Performance (%)</h4>
          <div className="h-72">
            {charts.testPerformance.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">No test data published yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.testPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} truncate />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="average" stroke="#F97316" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Quick Action Grid */}
      <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
        <h4 className="font-outfit font-bold text-slate-800 dark:text-white text-base mb-6">Quick Action Panels</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button 
                key={i}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 hover:bg-primary/5 dark:bg-slate-800/50 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 group transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-primary dark:group-hover:text-primary-light group-hover:bg-primary/10 shadow-sm transition-all">
                  <Icon size={20} />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 mt-3">{action.title}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{action.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fee Reminders & Notices Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Fee Reminders */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div>
              <h4 className="font-outfit font-bold text-slate-800 dark:text-white text-base">Fee Defaulters & Reminders</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Contact students who have outstanding invoices</p>
            </div>
            <button 
              onClick={() => navigate('/fees')}
              className="flex items-center gap-1 text-xs text-primary dark:text-primary-light hover:underline font-semibold"
            >
              <span>Ledger Details</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {feeReminders.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">All fees collected. Zero pending invoices!</div>
            ) : (
              feeReminders.map(student => (
                <div 
                  key={student.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-l-4 shadow-sm ${
                    student.status === 'Pending' 
                      ? 'border-red-100 bg-red-50/20 dark:border-red-950/20 dark:bg-red-950/5 border-l-red-500' 
                      : 'border-amber-100 bg-amber-50/20 dark:border-amber-950/20 dark:bg-amber-950/5 border-l-amber-500'
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">{student.name}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{student.batchName} • Due: {student.dueDate}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Remaining</p>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-white">₹{student.remaining.toLocaleString()}</p>
                    </div>

                    {/* WhatsApp Tap link actions */}
                    <div className="flex items-center gap-2">
                      <a 
                        href={`tel:${student.phone}`}
                        className="p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-105 border border-slate-100 dark:border-slate-600 text-slate-600 dark:text-slate-350 shadow-sm"
                        title="Call Student"
                      >
                        <Phone size={14} />
                      </a>
                      <a 
                        href={`https://wa.me/${student.parentPhone}?text=Hello ${student.name}'s parent, this is a friendly reminder that a tuition fee balance of ₹${student.remaining.toLocaleString()} is pending for their enrollment. Due Date: ${student.dueDate}. Kindly clear the dues soon.`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white shadow-sm flex items-center gap-1 text-xs font-semibold"
                        title="WhatsApp Reminder"
                      >
                        <MessageSquare size={14} />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Column: Recent Notices */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-5">
            <h4 className="font-outfit font-bold text-slate-800 dark:text-white text-base">Important Notices</h4>
            <Link to="/announcements" className="text-xs text-primary dark:text-primary-light hover:underline font-semibold">View Board</Link>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {recentAnnouncements.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">Notice board is clear</div>
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

      </div>

    </div>
  );
};

export default AdminDashboard;
