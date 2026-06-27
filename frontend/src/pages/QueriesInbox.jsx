import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  HelpCircle, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Trash2, 
  X,
  AlertCircle,
  CornerDownRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const QueriesInbox = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register: regSubmit, handleSubmit: handleQuerySubmit, reset: resetSubmit } = useForm();
  const { register: regReply, handleSubmit: handleReplySubmit, reset: resetReply } = useForm();

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/queries');
      setQueries(response.data.queries || []);
    } catch (err) {
      console.error('Failed to load queries', err);
      setError('Could not retrieve queries list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [user]);

  const handleOpenSubmit = () => {
    resetSubmit();
    setIsSubmitOpen(true);
  };

  const handleOpenReply = (query) => {
    resetReply();
    setSelectedQuery(query);
    setIsReplyOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this query history?')) {
      try {
        await api.delete(`/queries/${id}`);
        setQueries(queries.filter(q => q.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  const onSubmitQuery = async (data) => {
    setSubmitting(true);
    try {
      const response = await api.post('/queries', {
        type: data.type,
        queryText: data.queryText
      });
      if (response.data.success) {
        setIsSubmitOpen(false);
        fetchQueries();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to file query');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitReply = async (data) => {
    setSubmitting(true);
    try {
      const response = await api.put(`/queries/reply/${selectedQuery.id}`, {
        replyText: data.replyText
      });
      if (response.data.success) {
        setIsReplyOpen(false);
        fetchQueries();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Inbox</p>
          <h1 className="font-outfit font-extrabold text-2xl text-slate-808 dark:text-white mt-1">Queries & Help Desk</h1>
        </div>
        {!isAdmin && (
          <button 
            onClick={handleOpenSubmit}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-glow-primary transition-all duration-200 text-sm"
          >
            <Plus size={18} />
            <span>New Query Request</span>
          </button>
        )}
      </div>

      {/* Query List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading inbox...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <AlertCircle size={32} />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : queries.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-soft">
          <HelpCircle className="mx-auto text-slate-350 dark:text-slate-650 mb-4" size={40} />
          <p className="font-semibold text-slate-705 dark:text-slate-300">Queries folder is empty</p>
          <p className="text-xs text-slate-450 dark:text-slate-505 mt-1 font-medium">
            {isAdmin ? 'No doubts or leave requests filed by students.' : 'Tap "New Query Request" to message the admin panel.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {queries.map(q => (
            <div 
              key={q.id}
              className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft hover:shadow-premium transition-all duration-300 space-y-4"
            >
              {/* Header: Query Type, Status & metadata */}
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light font-bold text-[10px] uppercase">
                    {q.type}
                  </span>
                  {isAdmin && (
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-205">From: {q.studentName}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                    q.status === 'Resolved' ? 'bg-success/15 text-success' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {q.status === 'Resolved' ? <CheckCircle size={10} /> : <Clock size={10} />}
                    <span>{q.status}</span>
                  </span>
                  
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Student Query Text */}
              <p className="text-sm font-semibold text-slate-705 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-50 dark:border-slate-750">
                {q.queryText}
              </p>

              {/* Admin response block if resolved */}
              {q.status === 'Resolved' ? (
                <div className="pl-6 flex gap-3 text-sm text-slate-600 dark:text-slate-350">
                  <CornerDownRight className="text-primary shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="font-bold text-xs text-slate-400 uppercase tracking-wide">Admin Response</p>
                    <p className="mt-1 leading-relaxed whitespace-pre-line">{q.replyText}</p>
                    <p className="text-[9px] text-slate-400 mt-2 font-semibold uppercase">Responded: {new Date(q.repliedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                /* Unresolved + Admin: show Reply button */
                isAdmin && (
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => handleOpenReply(q)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      <MessageSquare size={12} />
                      <span>Reply / Resolve</span>
                    </button>
                  </div>
                )
              )}

            </div>
          ))}
        </div>
      )}

      {/* Modal - Submit Query (Student) */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">File New Query</h3>
              <button onClick={() => setIsSubmitOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuerySubmit(onSubmitQuery)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Query Type *</label>
                <select
                  required
                  {...regSubmit('type', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-700 dark:text-slate-205"
                >
                  <option value="">Select Category</option>
                  <option value="Doubt">Academic Doubt</option>
                  <option value="Leave Request">Leave Request</option>
                  <option value="General Query">General Query</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Write Details *</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Explain doubt coordinates, dates for leaves, or general questions..."
                  {...regSubmit('queryText', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-105 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-805 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/40">
                <button type="button" onClick={() => setIsSubmitOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-505 font-semibold text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-glow-primary text-sm">
                  {submitting ? 'Filing...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Reply To Query (Admin) */}
      {isReplyOpen && selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-808 dark:text-white">Respond to Query</h3>
              <button onClick={() => setIsReplyOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReplySubmit(onSubmitReply)} className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-705 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Query From: {selectedQuery.studentName}</p>
                <p className="text-sm font-semibold text-slate-750 dark:text-slate-205 mt-2 leading-relaxed italic">"{selectedQuery.queryText}"</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Write Response *</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Provide doubt explanations, approve leave dates, or reply..."
                  {...regReply('replyText', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-105 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-808 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/40">
                <button type="button" onClick={() => setIsReplyOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 font-semibold text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-glow-primary text-sm">
                  {submitting ? 'Resolving...' : 'Publish Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default QueriesInbox;
