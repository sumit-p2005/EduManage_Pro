import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Layers, 
  Clock, 
  User, 
  BookOpen, 
  X,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await api.get('/batches');
      setBatches(response.data.batches || []);
    } catch (err) {
      console.error('Failed to load batches', err);
      setError('Could not retrieve batch list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleOpenAdd = () => {
    reset();
    setEditMode(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (batch) => {
    setEditMode(true);
    setSelectedBatch(batch);
    setValue('name', batch.name);
    setValue('teacher', batch.teacher);
    setValue('timings', batch.timings);
    setValue('subjects', batch.subjects.join(', '));
    setValue('status', batch.status);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this batch? Any assigned students will be set to Unassigned status. This cannot be undone.')) {
      try {
        await api.delete(`/batches/${id}`);
        setBatches(batches.filter(b => b.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Deletion failed.');
      }
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      // Split subjects by comma
      const subjectsArray = data.subjects.split(',').map(s => s.trim()).filter(Boolean);
      const batchData = {
        ...data,
        subjects: subjectsArray
      };

      if (editMode && selectedBatch) {
        const response = await api.put(`/batches/${selectedBatch.id}`, batchData);
        if (response.data.success) {
          setIsFormOpen(false);
          fetchBatches();
        }
      } else {
        const response = await api.post('/batches', batchData);
        if (response.data.success) {
          setIsFormOpen(false);
          fetchBatches();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    }
  };

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Teacher Tools</p>
          <h1 className="font-outfit font-extrabold text-2xl text-slate-800 dark:text-white mt-1">Batch Management</h1>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-glow-primary transition-all duration-200"
        >
          <Plus size={18} />
          <span>Create Batch</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
        <Search size={16} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search batches by name or assigned teacher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm bg-transparent outline-none text-slate-850 dark:text-white placeholder-slate-400"
        />
      </div>

      {/* Batch Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading classrooms...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <AlertCircle size={32} />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-soft">
          <Layers className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={40} />
          <p className="font-semibold text-slate-750 dark:text-slate-350">No batches defined yet</p>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">Define new coaching batches by hitting the "Create Batch" panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map(batch => (
            <div 
              key={batch.id}
              className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Title and Status */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white truncate">{batch.name}</h3>
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                    batch.status === 'Active' ? 'bg-success/15 text-success' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {batch.status}
                  </span>
                </div>

                {/* Details Matrix */}
                <div className="space-y-3 text-xs font-semibold text-slate-550 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400 shrink-0" />
                    <span>Teacher: <span className="text-slate-750 dark:text-slate-200 font-bold">{batch.teacher}</span></span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{batch.timings}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <BookOpen size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Subjects:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {batch.subjects.map((sub, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-medium text-[10px] text-slate-600 dark:text-slate-350"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer controls */}
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/40 flex items-center justify-between">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                  {batch.studentsCount || 0} Students enrolled
                </span>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenEdit(batch)}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-secondary hover:bg-secondary/10 transition-colors shadow-sm"
                    title="Edit Batch Details"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(batch.id)}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shadow-sm"
                    title="Delete Batch"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal - Add / Edit Batch Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">
                {editMode ? 'Modify Batch Settings' : 'Create Coaching Classroom'}
              </h3>
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Batch Title (e.g. JEE 2026) *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Class 12 - JEE Elite"
                  {...register('name', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Assigned Teacher (Admin) *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Prof. Sumit Sharma"
                  {...register('teacher', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Weekly Timings / Schedule *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Mon, Wed, Fri (04:00 PM - 07:00 PM)"
                  {...register('timings', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Course Subjects (Comma separated) *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Physics, Chemistry, Mathematics"
                  {...register('subjects', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Class Status</label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-700 dark:text-slate-205"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/40">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-glow-primary text-sm"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BatchManagement;
