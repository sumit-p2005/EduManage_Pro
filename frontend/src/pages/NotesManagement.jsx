import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Trash2, 
  BookOpen, 
  Download, 
  Filter, 
  X, 
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const NotesManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [notes, setNotes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notesRes, batchesRes] = await Promise.all([
        api.get('/notes'),
        isAdmin ? api.get('/batches') : Promise.resolve({ data: { batches: [] } })
      ]);
      setNotes(notesRes.data.notes || []);
      setBatches(batchesRes.data.batches || []);
    } catch (err) {
      console.error('Failed to load study materials', err);
      setError('Could not retrieve notes list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenAdd = () => {
    reset();
    setUploadFile(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this notes file permanently?')) {
      try {
        await api.delete(`/notes/${id}`);
        setNotes(notes.filter(n => n.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  const handleFormSubmit = async (data) => {
    if (!uploadFile) {
      alert('Please attach a PDF, PPT or Image file.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('subject', data.subject);
      formData.append('chapter', data.chapter);
      formData.append('topic', data.topic);
      formData.append('batchId', data.batchId);
      formData.append('file', uploadFile);

      const response = await api.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setIsFormOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Extract unique subjects for filtering list
  const subjectsList = [...new Set(notes.map(n => n.subject))];

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchQuery = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       n.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       n.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject = selectedSubject === '' || n.subject === selectedSubject;
    const matchBatch = selectedBatch === '' || n.batchId === selectedBatch;
    return matchQuery && matchSubject && matchBatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Resource Vault</p>
          <h1 className="font-outfit font-extrabold text-2xl text-slate-800 dark:text-white mt-1">Study Notes & Lectures</h1>
        </div>
        {isAdmin && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-glow-primary transition-all duration-200"
          >
            <Plus size={18} />
            <span>Upload Notes</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
        
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl flex-1">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search notes by title, chapter or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl text-slate-750 dark:text-slate-205 focus:border-primary outline-none"
        >
          <option value="">All Subjects</option>
          {subjectsList.map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
        </select>

        {/* Batch Filter (Admin Only) */}
        {isAdmin && (
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl text-slate-750 dark:text-slate-205 focus:border-primary outline-none"
          >
            <option value="">All Batches</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}

      </div>

      {/* Grid of Notes */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Opening folder...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <AlertCircle size={32} />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-soft">
          <BookOpen className="mx-auto text-slate-350 dark:text-slate-600 mb-4" size={40} />
          <p className="font-semibold text-slate-700 dark:text-slate-300">No study notes uploaded yet</p>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
            {isAdmin ? 'Click on "Upload Notes" to dispatch PDF/PPT files to student batches.' : 'Lectures will appear here once uploaded by teachers.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <div 
              key={note.id}
              className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header Subject Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light font-bold text-[10px] uppercase">
                    {note.subject}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] text-slate-450 dark:text-slate-550 font-semibold">
                      Batch: {note.batchName}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-outfit font-bold text-slate-850 dark:text-white text-base truncate" title={note.title}>{note.title}</h3>
                
                {/* Chapter & Topic Path */}
                <div className="mt-3 py-2 px-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1 font-semibold text-[11px] text-slate-550 dark:text-slate-400">
                  <p>Chapter: <span className="text-slate-750 dark:text-slate-200 font-bold">{note.chapter}</span></p>
                  <p>Topic: <span className="text-slate-750 dark:text-slate-205">{note.topic}</span></p>
                </div>

                <p className="text-xs text-slate-450 dark:text-slate-500 leading-relaxed mt-3 line-clamp-2">{note.description || 'No description provided.'}</p>
              </div>

              {/* Card Footer controls */}
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/40 flex items-center justify-between">
                <div className="overflow-hidden mr-2">
                  <p className="text-[9px] text-slate-450 dark:text-slate-550 truncate">File: {note.fileName}</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Uploaded: {new Date(note.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <a 
                    href={note.fileUrl.startsWith('http') ? note.fileUrl : `http://localhost:5000${note.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-50 hover:bg-primary/10 dark:bg-slate-700 text-slate-500 hover:text-primary transition-all shadow-sm flex items-center justify-center"
                    title="Download Note File"
                  >
                    <Download size={14} />
                  </a>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(note.id)}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all shadow-sm flex items-center justify-center"
                      title="Delete Note"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal - Upload Note Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Upload Study Lecture notes</h3>
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Note Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Electrostatics Part 1"
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
                    placeholder="e.g. Physics"
                    {...register('subject', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Chapter *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Electrostatics"
                    {...register('chapter', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Topic *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Coulomb's Law"
                    {...register('topic', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Assign Batch *</label>
                  <select
                    required
                    {...register('batchId', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-750 dark:text-slate-205"
                  >
                    <option value="">Select Batch</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Short Description</label>
                <textarea 
                  rows={2}
                  placeholder="Optional brief notes summary..."
                  {...register('description')}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Document File (PDF, PPT, Image) *</label>
                <input 
                  type="file" 
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full px-4 py-2.5 mt-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-500 cursor-pointer"
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
                    <span>Upload Resource</span>
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

export default NotesManagement;
