import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Clock,
  X,
  CreditCard
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const FeesManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [feeData, setFeeData] = useState({ summary: {}, history: [] }); // For student
  const [adminFees, setAdminFees] = useState([]); // For admin
  const [students, setStudents] = useState([]); // For admin
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register: regPay, handleSubmit: handlePaySubmit, reset: resetPay } = useForm();
  const { register: regUpdate, handleSubmit: handleUpdateSubmit, reset: resetUpdate, setValue: setUpdateValue } = useForm();

  const fetchFeeData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [feesRes, studentsRes] = await Promise.all([
          api.get('/fees'),
          api.get('/students')
        ]);
        setAdminFees(feesRes.data.fees || []);
        setStudents(studentsRes.data.students || []);
      } else {
        const response = await api.get('/fees/my-fees');
        setFeeData(response.data || { summary: {}, history: [] });
      }
    } catch (err) {
      console.error('Failed to load fee ledger', err);
      setError('Could not retrieve fee records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, [user]);

  const handleOpenPay = () => {
    resetPay();
    setIsPayOpen(true);
  };

  const handleOpenUpdate = () => {
    resetUpdate();
    setIsUpdateOpen(true);
  };

  const handleStudentSelectForUpdate = (e) => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    if (sId) {
      const student = students.find(s => s.id === sId);
      if (student) {
        setUpdateValue('total', student.feeDetails?.total);
        setUpdateValue('dueDate', student.feeDetails?.dueDate);
      }
    }
  };

  const handleAddPayment = async (data) => {
    setSubmitting(true);
    try {
      const response = await api.post('/fees/pay', {
        studentId: data.studentId,
        amount: data.amount,
        type: data.type,
        date: data.date
      });
      if (response.data.success) {
        setIsPayOpen(false);
        fetchFeeData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFeeDetails = async (data) => {
    if (!selectedStudentId) {
      alert('Please select a student.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.put(`/fees/details/${selectedStudentId}`, {
        total: data.total,
        dueDate: data.dueDate
      });
      if (response.data.success) {
        setIsUpdateOpen(false);
        fetchFeeData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Admin filter
  const filteredAdminFees = adminFees.filter(f => 
    f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Accounts</p>
          <h1 className="font-outfit font-extrabold text-2xl text-slate-800 dark:text-white mt-1">Fee Management Ledger</h1>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <button 
              onClick={handleOpenUpdate}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Update Course Dues
            </button>
            <button 
              onClick={handleOpenPay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-glow-primary transition-all duration-200 text-sm"
            >
              <Plus size={18} />
              <span>Collect Fee</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading ledger...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <AlertCircle size={32} />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : isAdmin ? (
        /* --- ADMIN VIEW --- */
        <div className="space-y-6">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search incoming payments by student name or installment type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm bg-transparent outline-none text-slate-850 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Ledger Table */}
          {filteredAdminFees.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-soft">
              <DollarSign className="mx-auto text-slate-350 dark:text-slate-650 mb-4" size={40} />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No payment records found</p>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">Record student installments using the "Collect Fee" tool.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 dark:border-slate-700/40 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Payment Method / Installment Type</th>
                    <th className="px-6 py-4">Transaction Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30 text-sm font-medium">
                  {filteredAdminFees.map(fee => (
                    <tr key={fee.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-700/10">
                      <td className="px-6 py-4 font-bold text-slate-805 dark:text-white">{fee.studentName}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{fee.type}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{fee.date}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-green-50/50 dark:bg-green-950/20 text-success text-xs font-bold border border-green-105/20">
                          <CheckCircle size={10} />
                          <span>Paid</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-white">
                        ₹{parseFloat(fee.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* --- STUDENT VIEW --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary Card */}
          <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft h-fit space-y-6">
            <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Fee Statement Summary</h3>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700/30 pb-3 text-xs font-semibold">
                <span className="text-slate-400 dark:text-slate-550 uppercase">Total Fee</span>
                <span className="text-slate-800 dark:text-white font-extrabold">₹{feeData.summary.total?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700/30 pb-3 text-xs font-semibold">
                <span className="text-slate-400 dark:text-slate-550 uppercase">Total Paid</span>
                <span className="text-green-600 dark:text-green-450 font-extrabold">₹{feeData.summary.paid?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700/30 pb-3 text-xs font-semibold">
                <span className="text-slate-400 dark:text-slate-550 uppercase">Dues Remaining</span>
                <span className={`font-extrabold ${feeData.summary.remaining > 0 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                  ₹{feeData.summary.remaining?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-slate-700/30 pb-3 text-xs font-semibold">
                <span className="text-slate-400 dark:text-slate-550 uppercase">Due Date</span>
                <span className="text-slate-600 dark:text-slate-300 font-extrabold">{feeData.summary.dueDate || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400 dark:text-slate-550 uppercase">Status</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                  feeData.summary.status === 'Paid' 
                    ? 'bg-success text-white' 
                    : feeData.summary.status === 'Partially Paid' 
                      ? 'bg-warning text-white' 
                      : 'bg-red-500 text-white'
                }`}>
                  {feeData.summary.status}
                </span>
              </div>
            </div>

            {feeData.summary.remaining > 0 && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-955/20 border border-red-105 dark:border-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-3 text-xs leading-relaxed font-semibold">
                <AlertCircle className="shrink-0" />
                <p>Tuition installment due soon. Please process invoice payment via counter.</p>
              </div>
            )}
          </div>

          {/* Payment History List */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
            <h3 className="font-outfit font-bold text-lg text-slate-805 dark:text-white mb-5">Installment History ledger</h3>
            
            <div className="space-y-4">
              {feeData.history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                  <CreditCard size={32} className="text-slate-300 dark:text-slate-600 mb-2" />
                  <span className="text-xs font-medium">No transactions registered yet.</span>
                </div>
              ) : (
                feeData.history.map(item => (
                  <div 
                    key={item.id}
                    className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-700/50 rounded-xl"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">{item.type}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                        <Calendar size={12} />
                        <span>Date: {item.date}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-green-600 dark:text-green-450">₹{parseFloat(item.amount).toLocaleString()}</span>
                      <p className="text-[10px] text-success dark:text-success-light font-bold mt-1 uppercase">Cleared</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal - Pay Fee */}
      {isPayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Record incoming installment</h3>
              <button onClick={() => setIsPayOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePaySubmit(handleAddPayment)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Select Student *</label>
                <select
                  required
                  {...regPay('studentId', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-700 dark:text-slate-205"
                >
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} (Remaining: ₹{s.feeDetails?.remaining})</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Amount Paid (₹) *</label>
                <input 
                  type="number"
                  required
                  {...regPay('amount', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Installment Type / Label *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Installment 2, Fine, Special Fee"
                  {...regPay('type', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Payment Date</label>
                <input 
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  {...regPay('date')}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-850 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/40">
                <button type="button" onClick={() => setIsPayOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 font-semibold text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-glow-primary text-sm">
                  {submitting ? 'Registering...' : 'Collect Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Update Dues */}
      {isUpdateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Update Student Course Dues</h3>
              <button onClick={() => setIsUpdateOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit(handleUpdateFeeDetails)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Select Student *</label>
                <select
                  required
                  onChange={handleStudentSelectForUpdate}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-700 dark:text-slate-205"
                >
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} (Total Dues: ₹{s.feeDetails?.total})</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Tuition Course Fee (₹) *</label>
                <input 
                  type="number"
                  required
                  {...regUpdate('total', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-805 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Dues Payment Deadline *</label>
                <input 
                  type="date"
                  required
                  {...regUpdate('dueDate', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-805 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/40">
                <button type="button" onClick={() => setIsUpdateOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 font-semibold text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-glow-primary text-sm">
                  {submitting ? 'Updating...' : 'Update Dues'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FeesManagement;
