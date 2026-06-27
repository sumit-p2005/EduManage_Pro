import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle,
  X, 
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const TimetableManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [timetable, setTimetable] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering
  const [selectedBatch, setSelectedBatch] = useState('');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [classList, setClassList] = useState([{ time: '', subject: '', room: '' }]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ttRes, batchesRes] = await Promise.all([
        api.get('/timetable'),
        api.get('/batches')
      ]);
      setTimetable(ttRes.data.timetable || []);
      setBatches(batchesRes.data.batches || []);
      
      if (batchesRes.data.batches?.length > 0 && !selectedBatch) {
        setSelectedBatch(batchesRes.data.batches[0].id);
      }
    } catch (err) {
      console.error('Failed to load timetable', err);
      setError('Could not retrieve timetable schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenAdd = () => {
    reset();
    setClassList([{ time: '', subject: '', room: '' }]);
    setIsFormOpen(true);
  };

  const handleAddClassInput = () => {
    setClassList([...classList, { time: '', subject: '', room: '' }]);
  };

  const handleRemoveClassInput = (index) => {
    const list = [...classList];
    list.splice(index, 1);
    setClassList(list);
  };

  const handleClassInputChange = (index, field, value) => {
    const list = [...classList];
    list[index][field] = value;
    setClassList(list);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this timetable entry?')) {
      try {
        await api.delete(`/timetable/${id}`);
        setTimetable(timetable.filter(t => t.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  const handleFormSubmit = async (data) => {
    // If not holiday/cancelled, class list is required
    if (!data.isHoliday && !data.isCancelled) {
      const validClasses = classList.filter(c => c.time && c.subject);
      if (validClasses.length === 0) {
        alert('Please specify at least one class session.');
        return;
      }
      data.classes = validClasses;
    } else {
      data.classes = [];
    }

    try {
      const response = await api.post('/timetable', data);
      if (response.data.success) {
        setIsFormOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save timetable');
    }
  };

  // Group and sort classes by day of week Mon -> Sat
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Filter timetable by batch select
  const filteredTimetable = timetable.filter(t => !selectedBatch || t.batchId === selectedBatch);
  
  // Sort schedule by days
  const sortedTimetable = [...filteredTimetable].sort((a, b) => 
    daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Scheduler</p>
          <h1 className="font-outfit font-extrabold text-2xl text-slate-800 dark:text-white mt-1">Weekly Timetable</h1>
        </div>
        {isAdmin && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-glow-primary transition-all duration-200"
          >
            <Plus size={18} />
            <span>Add Timetable Entry</span>
          </button>
        )}
      </div>

      {/* Batch Select Selector (Required to organize view) */}
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Select Batch Timetable:</label>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="px-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl text-slate-750 dark:text-slate-205 focus:border-primary outline-none"
        >
          {isAdmin && <option value="">All Batches</option>}
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Weekly Planner Cards Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading schedules...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <AlertCircle size={32} />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : sortedTimetable.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-soft">
          <Calendar className="mx-auto text-slate-350 dark:text-slate-650 mb-4" size={40} />
          <p className="font-semibold text-slate-700 dark:text-slate-300">No class schedule defined for this batch</p>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
            {isAdmin ? 'Click on "Add Timetable Entry" to draft day-wise timetables.' : 'Classes schedule is clear. Check announcements for holiday notices.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedTimetable.map(item => (
            <div 
              key={item.id}
              className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft hover:shadow-premium transition-all duration-300"
            >
              
              {/* Day and actions */}
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/40 pb-4 mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-outfit font-extrabold text-slate-800 dark:text-white text-lg">{item.day}</h3>
                  {isAdmin && (
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase">Batch: {item.batchName}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.isHoliday && (
                    <span className="px-2.5 py-1 rounded-lg bg-orange-500 text-white font-bold text-[10px] uppercase">Holiday Notice</span>
                  )}
                  {item.isCancelled && (
                    <span className="px-2.5 py-1 rounded-lg bg-red-500 text-white font-bold text-[10px] uppercase">Cancelled</span>
                  )}
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all shadow-sm"
                      title="Remove day timetable"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic status contents */}
              {item.isHoliday ? (
                <div className="p-4 bg-orange-55/15 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 text-orange-700 dark:text-orange-400 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Holiday Notice</p>
                    <p className="text-xs mt-0.5 leading-relaxed">{item.remarks || 'Institute closed today.'}</p>
                  </div>
                </div>
              ) : item.isCancelled ? (
                <div className="p-4 bg-red-50/20 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Classes Cancelled</p>
                    <p className="text-xs mt-0.5 leading-relaxed">{item.remarks || 'Timetable cancelled for today.'}</p>
                  </div>
                </div>
              ) : (
                /* Class listing grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.classes.map((cls, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-xl border border-slate-50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-primary dark:text-primary-light">
                        <Clock size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">{cls.time}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{cls.subject}</h4>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                        <MapPin size={14} />
                        <span>{cls.room || 'Classroom A1'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Modal - Create/Configure Timetable Entry */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Create Timetable Entry</h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4 max-h-[30rem] overflow-y-auto">
              
              {/* Batch & Day Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Select Batch *</label>
                  <select
                    required
                    {...register('batchId', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-700 dark:text-slate-205"
                  >
                    <option value="">Select Batch</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Weekday *</label>
                  <select
                    required
                    {...register('day', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-700 dark:text-slate-205"
                  >
                    <option value="">Select Day</option>
                    {daysOrder.map((day, idx) => <option key={idx} value={day}>{day}</option>)}
                  </select>
                </div>
              </div>

              {/* Status Toggles */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isCancelled" {...register('isCancelled')} className="rounded" />
                  <label htmlFor="isCancelled" className="text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer">Classes Cancelled</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isHoliday" {...register('isHoliday')} className="rounded" />
                  <label htmlFor="isHoliday" className="text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer">Holiday Notice</label>
                </div>
              </div>

              {/* Class Schedule Dynamic Input List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Class sessions</label>
                  <button 
                    type="button"
                    onClick={handleAddClassInput}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    + Add Session
                  </button>
                </div>

                {classList.map((c, index) => (
                  <div key={index} className="flex gap-2 items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <input 
                      type="text" 
                      placeholder="Time (e.g. 4:00 - 5:30 PM)"
                      value={c.time}
                      onChange={(e) => handleClassInputChange(index, 'time', e.target.value)}
                      className="px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex-1 outline-none text-slate-800 dark:text-white"
                    />
                    <input 
                      type="text" 
                      placeholder="Subject"
                      value={c.subject}
                      onChange={(e) => handleClassInputChange(index, 'subject', e.target.value)}
                      className="px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex-1 outline-none text-slate-800 dark:text-white"
                    />
                    <input 
                      type="text" 
                      placeholder="Room"
                      value={c.room}
                      onChange={(e) => handleClassInputChange(index, 'room', e.target.value)}
                      className="px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-20 outline-none text-slate-800 dark:text-white"
                    />
                    {classList.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveClassInput(index)}
                        className="text-xs text-red-500 font-bold p-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Remarks/Holiday Reason */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Remarks / Holiday description</label>
                <textarea 
                  rows={2}
                  placeholder="Reason for cancelled classes or holiday notices..."
                  {...register('remarks')}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-105 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/40">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-505 dark:text-slate-400 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-glow-primary text-sm"
                >
                  Save Schedule
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TimetableManagement;
