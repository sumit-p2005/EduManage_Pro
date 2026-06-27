import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Trash2, 
  Download, 
  Calendar, 
  CheckSquare, 
  Clock,
  X,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const Homework = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [homeworkList, setHomeworkList] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchHomeworkAndBatches = async () => {
    setLoading(true);
    try {
      const [hwRes, batchesRes] = await Promise.all([
        api.get('/homework'),
        isAdmin ? api.get('/batches') : Promise.resolve({ data: { batches: [] } })
      ]);
      setHomeworkList(hwRes.data.homework || []);
      setBatches(batchesRes.data.batches || []);
    } catch (err) {
      console.error('Failed to load homework sheet', err);
      setError('Could not retrieve homework assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworkAndBatches();
  }, [user]);

  const handleOpenAdd = () => {
    reset();
    setUploadFile(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this homework assignment?')) {
      try {
        await api.delete(`/homework/${id}`);
        setHomeworkList(homeworkList.filter(h => h.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('subject', data.subject);
      formData.append('dueDate', data.dueDate);
      formData.append('batchId', data.batchId);
      if (uploadFile) {
        formData.append('file', uploadFile);
      }

      const response = await api.post('/homework', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setIsFormOpen(false);
        fetchHomeworkAndBatches();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish homework');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Tasks</p>
          <h1 className="font-outfit font-extrabold text-2xl text-slate-800 dark:text-white mt-1">Homework Assignments</h1>
        </div>
        {isAdmin && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-glow-primary transition-all duration-200"
          >
            <Plus size={18} />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Homework Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading worksheets...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <AlertCircle size={32} />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : homeworkList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-soft">
          <CheckSquare className="mx-auto text-slate-350 dark:text-slate-650 mb-4" size={40} />
          <p className="font-semibold text-slate-705 dark:text-slate-300">All caught up! Zero homework assigned</p>
          <p className="text-xs text-slate-450 dark:text-slate-505 mt-1 font-medium">
            {isAdmin ? 'Tap "Create Assignment" to dispatch a homework task.' : 'Your notices list is clear.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homeworkList.map(hw => {
            const isOverdue = new Date(hw.dueDate) < new Date().setHours(0,0,0,0);
            return (
              <div 
                key={hw.id}
                className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Header Subject Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-0.5 rounded-lg bg-success/10 text-success dark:bg-success/20 dark:text-success-light font-bold text-[10px] uppercase">
                      {hw.subject}
                    </span>
                    {isAdmin && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                        Batch: {hw.batchName}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-outfit font-bold text-slate-850 dark:text-white text-base truncate" title={hw.title}>{hw.title}</h3>
                  
                  {/* Due Date Indicator */}
                  <div className={`mt-3 py-2 px-3 border rounded-xl flex items-center justify-between font-semibold text-[11px] ${
                    isOverdue 
                      ? 'border-red-105 bg-red-50/20 text-red-600 dark:border-red-950/20 dark:text-red-400' 
                      : 'border-slate-100 bg-slate-5/50 text-slate-550 dark:border-slate-700/60 dark:text-slate-400'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>Deadline: {hw.dueDate}</span>
                    </div>
                    {isOverdue && <span className="font-extrabold uppercase text-[9px]">Overdue</span>}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-4 line-clamp-3">{hw.description}</p>
                </div>

                {/* Footer Controls */}
                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/40 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">
                    Posted: {new Date(hw.createdAt).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {hw.attachmentUrl && (
                      <a 
                        href={hw.attachmentUrl.startsWith('http') ? hw.attachmentUrl : `http://localhost:5000${hw.attachmentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-50 hover:bg-primary/10 dark:bg-slate-700 text-slate-550 hover:text-primary transition-all shadow-sm flex items-center justify-center"
                        title="Download Attachment Sheet"
                      >
                        <Download size={14} />
                      </a>
                    )}
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(hw.id)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all shadow-sm flex items-center justify-center"
                        title="Delete Assignment"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Create Assignment Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Publish Homework Assignment</h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Assignment Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Chapter 4 Integration Practice Sheet"
                  {...register('title', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Subject *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Mathematics"
                    {...register('subject', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>
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
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Due Date *</label>
                <input 
                  type="date" 
                  required
                  {...register('dueDate', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Worksheet Instructions / Description</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Specify task instructions, book page coordinates, or question counts..."
                  {...register('description', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-805 dark:text-white"
                />
              </div>

              {/* Attachment File */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Worksheet Attachment (Optional)</label>
                <input 
                  type="file" 
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full px-4 py-2.5 mt-1 text-xs bg-slate-50 dark:bg-slate-905 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-500 cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/40">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-505 dark:text-slate-400 font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-glow-primary text-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Publish Homework</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Homework;
