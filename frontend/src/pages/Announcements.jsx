import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Bell, 
  Pin, 
  X,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const Announcements = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data.announcements || []);
    } catch (err) {
      console.error('Failed to load notices', err);
      setError('Could not retrieve announcements list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [user]);

  const handleOpenAdd = () => {
    reset();
    setEditMode(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (ann) => {
    setEditMode(true);
    setSelectedAnn(ann);
    setValue('title', ann.title);
    setValue('content', ann.content);
    setValue('pinned', ann.pinned);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this announcement notice?')) {
      try {
        await api.delete(`/announcements/${id}`);
        setAnnouncements(announcements.filter(a => a.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editMode && selectedAnn) {
        const response = await api.put(`/announcements/${selectedAnn.id}`, data);
        if (response.data.success) {
          setIsFormOpen(false);
          fetchAnnouncements();
        }
      } else {
        const response = await api.post('/announcements', data);
        if (response.data.success) {
          setIsFormOpen(false);
          fetchAnnouncements();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save notice');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Notice Board</p>
          <h1 className="font-outfit font-extrabold text-2xl text-slate-800 dark:text-white mt-1">Announcements</h1>
        </div>
        {isAdmin && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-glow-primary transition-all duration-200"
          >
            <Plus size={18} />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading notice boards...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <AlertCircle size={32} />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-soft">
          <Bell className="mx-auto text-slate-350 dark:text-slate-650 mb-4" size={40} />
          <p className="font-semibold text-slate-705 dark:text-slate-300">Notice board is clear</p>
          <p className="text-xs text-slate-450 dark:text-slate-505 mt-1 font-medium">
            {isAdmin ? 'Tap "Post Announcement" to draft a new notice.' : 'No announcements published yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {announcements.map(ann => (
            <div 
              key={ann.id}
              className={`p-6 bg-white dark:bg-slate-800 border rounded-2xl shadow-soft hover:shadow-premium transition-all duration-300 relative ${
                ann.pinned ? 'border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/5' : 'border-slate-100 dark:border-slate-700/40'
              }`}
            >
              
              {/* Pin indicator */}
              {ann.pinned && (
                <div className="absolute top-6 right-6 flex items-center gap-1 text-[10px] font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                  <Pin size={10} className="fill-current" />
                  <span>Pinned notice</span>
                </div>
              )}

              {/* Title & Author details */}
              <div className="pr-20">
                <h3 className="font-outfit font-extrabold text-slate-805 dark:text-white text-lg">{ann.title}</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">
                  Posted by: {ann.author} • {ann.date}
                </p>
              </div>

              {/* Content */}
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-4 whitespace-pre-line">
                {ann.content}
              </p>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/30 flex justify-end gap-2">
                  <button 
                    onClick={() => handleOpenEdit(ann)}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-secondary hover:bg-secondary/10 transition-colors shadow-sm"
                    title="Edit Notice"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(ann.id)}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-55/20 transition-colors shadow-sm"
                    title="Delete Notice"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Modal - Post Notice */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-808 dark:text-white">
                {editMode ? 'Modify Notice Details' : 'Publish Announcement'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-105 text-slate-500 dark:text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Notice Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Schedule for Extra Doubt Clearing Class"
                  {...register('title', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Notice Content *</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Write clear instructions for students..."
                  {...register('content', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-105 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-805 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <input type="checkbox" id="pinned" {...register('pinned')} className="rounded" />
                <label htmlFor="pinned" className="text-xs font-bold text-slate-650 dark:text-slate-350 cursor-pointer">Pin to top of Board</label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/40">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 font-semibold text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-glow-primary text-sm">
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Announcements;
