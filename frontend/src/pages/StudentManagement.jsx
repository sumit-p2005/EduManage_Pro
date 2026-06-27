import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  MessageSquare, 
  AlertCircle,
  X,
  UserCheck,
  Mail,
  Home,
  Calendar,
  Layers,
  DollarSign
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // File upload state for student photo
  const [photoFile, setPhotoFile] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchStudentsAndBatches = async () => {
    setLoading(true);
    try {
      const [studentRes, batchRes] = await Promise.all([
        api.get('/students'),
        api.get('/batches')
      ]);
      setStudents(studentRes.data.students || []);
      setBatches(batchRes.data.batches || []);
    } catch (err) {
      console.error('Failed to load student profiles', err);
      setError('Could not retrieve student list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndBatches();
  }, []);

  const handleOpenAdd = () => {
    reset();
    setEditMode(false);
    setPhotoFile(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditMode(true);
    setSelectedStudent(student);
    setPhotoFile(null);
    setValue('name', student.name);
    setValue('email', student.email);
    setValue('phone', student.phone);
    setValue('parentName', student.parentName);
    setValue('parentPhone', student.parentPhone);
    setValue('address', student.address);
    setValue('admissionDate', student.admissionDate);
    setValue('batchId', student.batchId);
    setValue('feeTotal', student.feeDetails?.total);
    setValue('feePaid', student.feeDetails?.paid);
    setValue('feeDueDate', student.feeDetails?.dueDate);
    setIsFormOpen(true);
  };

  const handleOpenProfile = (student) => {
    setSelectedStudent(student);
    setIsProfileOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you absolutely sure you want to delete this student profile and associated fee history? This cannot be undone.')) {
      try {
        await api.delete(`/students/${id}`);
        setStudents(students.filter(s => s.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Deletion failed.');
      }
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editMode && selectedStudent) {
        // Edit student
        const response = await api.put(`/students/${selectedStudent.id}`, formData, config);
        if (response.data.success) {
          setIsFormOpen(false);
          fetchStudentsAndBatches();
        }
      } else {
        // Create student
        const response = await api.post('/students', formData, config);
        if (response.data.success) {
          setIsFormOpen(false);
          fetchStudentsAndBatches();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    }
  };

  // Filter students list
  const filteredStudents = students.filter(s => {
    const matchQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       s.phone.includes(searchQuery);
    const matchBatch = batchFilter === '' || s.batchId === batchFilter;
    return matchQuery && matchBatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Teacher Tools</p>
          <h1 className="font-outfit font-extrabold text-2xl text-slate-800 dark:text-white mt-1">Student Management</h1>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-glow-primary transition-all duration-205"
        >
          <Plus size={18} />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
        
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl flex-1">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students by name, email, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-transparent outline-none text-slate-850 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Batch selection dropdown filter */}
        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl text-slate-700 dark:text-slate-205 outline-none focus:border-primary"
        >
          <option value="">All Batches</option>
          {batches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

      </div>

      {/* Student Database Grid / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading directory...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <AlertCircle size={32} />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-soft">
          <UserCheck className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={40} />
          <p className="font-semibold text-slate-750 dark:text-slate-300">No students found matching filters</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Enroll students by clicking the "Add New Student" panel.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-700/40 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Batch</th>
                <th className="px-6 py-4">Fee Status</th>
                <th className="px-6 py-4">Parent Phone</th>
                <th className="px-6 py-4 text-center">Quick Links</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30 text-sm font-medium">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-700/10">
                  
                  {/* Photo & Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={student.photo || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'} 
                        alt={student.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{student.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{student.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{student.phone}</td>

                  {/* Batch */}
                  <td className="px-6 py-4 text-slate-650 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 font-semibold text-xs text-slate-600 dark:text-slate-350">
                      {student.batchName}
                    </span>
                  </td>

                  {/* Fee Status Badge */}
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${
                      student.feeDetails?.status === 'Paid' 
                        ? 'bg-success/15 text-success' 
                        : student.feeDetails?.status === 'Partially Paid' 
                          ? 'bg-warning/15 text-warning' 
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {student.feeDetails?.status || 'Pending'}
                    </span>
                  </td>

                  {/* Parent Phone */}
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{student.parentPhone}</td>

                  {/* Quick tap Call/WhatsApp actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <a 
                        href={`tel:${student.phone}`}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-primary/10 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-slate-550 dark:text-slate-350 hover:text-primary transition-colors shadow-sm"
                        title="Direct Voice Call"
                      >
                        <Phone size={14} />
                      </a>
                      <a 
                        href={`https://wa.me/${student.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-green-50/15 hover:bg-green-550/20 text-green-600 dark:text-green-400 shadow-sm transition-colors border border-green-105/20"
                        title="Direct Student WhatsApp chat"
                      >
                        <MessageSquare size={14} />
                      </a>
                    </div>
                  </td>

                  {/* Actions (View Profile, Edit, Delete) */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenProfile(student)}
                        className="p-2 rounded-lg hover:bg-slate-105 text-slate-400 hover:text-primary"
                        title="Full Student Profile"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(student)}
                        className="p-2 rounded-lg hover:bg-slate-105 text-slate-400 hover:text-secondary"
                        title="Modify Profile Details"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="p-2 rounded-lg hover:bg-slate-105 text-slate-400 hover:text-red-500"
                        title="Delete Profile"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal - Add / Edit Student Profile Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-205">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">
                {editMode ? 'Modify Student Profile' : 'Enroll New Student'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4 max-h-[30rem] overflow-y-auto">
              
              {/* Photo Upload Section */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 rounded-xl">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                  <img 
                    src={
                      photoFile 
                        ? URL.createObjectURL(photoFile) 
                        : (editMode && selectedStudent?.photo) 
                          ? selectedStudent.photo 
                          : 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
                    } 
                    alt="Student Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Student Profile Photo
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0] || null)}
                    className="text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary dark:file:bg-primary/20 dark:file:text-primary-light hover:file:bg-primary/20 transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Row 1: Student info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Student Full Name *</label>
                  <input 
                    type="text" 
                    required
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Student Email *</label>
                  <input 
                    type="email" 
                    required
                    disabled={editMode} // Disable email change for simplicity
                    {...register('email', { required: 'Email is required' })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-105 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary disabled:opacity-60 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Parent Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Student Phone *</label>
                  <input 
                    type="tel" 
                    required
                    {...register('phone', { required: 'Phone is required' })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Parent / Guardian Name</label>
                  <input 
                    type="text" 
                    {...register('parentName')}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Parent WhatsApp/Phone *</label>
                  <input 
                    type="tel"
                    required
                    {...register('parentPhone', { required: 'Parent phone is required' })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 3: Address & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Residential Address</label>
                  <input 
                    type="text" 
                    {...register('address')}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Admission Date</label>
                  <input 
                    type="date" 
                    {...register('admissionDate')}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 4: Classroom Batch Selection */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Assigned Classroom Batch *</label>
                <select
                  required
                  {...register('batchId', { required: 'Batch is required' })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-700 dark:text-slate-205"
                >
                  <option value="">Select Batch</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.timings})</option>
                  ))}
                </select>
              </div>

              {/* Row 5: Initial Fee Details (Only required in add mode for simplicity) */}
              {!editMode && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 rounded-xl space-y-4">
                  <p className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider">Fee Collection Setup</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">Total Fee (₹) *</label>
                      <input 
                        type="number" 
                        required
                        {...register('feeTotal', { required: 'Total fee is required' })}
                        className="w-full px-3 py-2 mt-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">Initial Payment Paid (₹)</label>
                      <input 
                        type="number"
                        defaultValue={0}
                        {...register('feePaid')}
                        className="w-full px-3 py-2 mt-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">Dues Due Date</label>
                      <input 
                        type="date" 
                        {...register('feeDueDate')}
                        className="w-full px-3 py-2 mt-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                  Save Profile
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal - View Student Profile Details */}
      {isProfileOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Student Information Card</h3>
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-6">
              
              {/* Header profile details */}
              <div className="flex items-center gap-4">
                <img 
                  src={selectedStudent.photo || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'} 
                  alt={selectedStudent.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-primary/10 shadow-sm"
                />
                <div>
                  <h4 className="font-outfit font-bold text-xl text-slate-850 dark:text-white">{selectedStudent.name}</h4>
                  <span className="inline-block px-2.5 py-0.5 mt-1 font-semibold text-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-lg">
                    {selectedStudent.batchName}
                  </span>
                </div>
              </div>

              {/* Info Matrix */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/30 rounded-xl">
                  <span className="text-slate-400 dark:text-slate-500 uppercase">Student Email</span>
                  <div className="flex items-center gap-1.5 mt-1.5 text-slate-700 dark:text-slate-200">
                    <Mail size={12} className="text-slate-400" />
                    <span className="truncate">{selectedStudent.email}</span>
                  </div>
                </div>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/30 rounded-xl">
                  <span className="text-slate-400 dark:text-slate-500 uppercase">Admission Date</span>
                  <div className="flex items-center gap-1.5 mt-1.5 text-slate-700 dark:text-slate-200">
                    <Calendar size={12} className="text-slate-400" />
                    <span>{selectedStudent.admissionDate}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/30 rounded-xl">
                  <span className="text-slate-400 dark:text-slate-500 uppercase">Guardian Info</span>
                  <div className="mt-1.5 text-slate-700 dark:text-slate-200">
                    <p className="font-bold">{selectedStudent.parentName || 'N/A'}</p>
                    <p className="text-[10px] text-slate-405 dark:text-slate-400 mt-0.5">{selectedStudent.parentPhone}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/30 rounded-xl">
                  <span className="text-slate-400 dark:text-slate-500 uppercase">Home Address</span>
                  <div className="flex items-center gap-1.5 mt-1.5 text-slate-700 dark:text-slate-205">
                    <Home size={12} className="text-slate-400 shrink-0" />
                    <span className="line-clamp-2 leading-relaxed">{selectedStudent.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Fee breakdown details */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Fee Ledger Balance</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                    selectedStudent.feeDetails?.status === 'Paid' 
                      ? 'bg-success text-white' 
                      : selectedStudent.feeDetails?.status === 'Partially Paid' 
                        ? 'bg-warning text-white' 
                        : 'bg-red-500 text-white'
                  }`}>
                    {selectedStudent.feeDetails?.status || 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-1">
                  <div>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold">Total</p>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-1">
                      ₹{selectedStudent.feeDetails?.total.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 uppercase font-bold">Paid</p>
                    <p className="text-sm font-extrabold text-green-600 dark:text-green-450 mt-1">
                      ₹{selectedStudent.feeDetails?.paid.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 uppercase font-bold">Dues</p>
                    <p className="text-sm font-extrabold text-red-500 mt-1">
                      ₹{selectedStudent.feeDetails?.remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedStudent.feeDetails?.remaining > 0 && (
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 text-center border-t border-slate-200 dark:border-slate-700 pt-2.5">
                    Dues balance deadline: <span className="font-extrabold text-red-500">{selectedStudent.feeDetails?.dueDate}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center pt-2">
                <a 
                  href={`tel:${selectedStudent.phone}`}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-sm transition-all"
                >
                  <Phone size={16} />
                  <span>Call Student</span>
                </a>
                <a 
                  href={`https://wa.me/${selectedStudent.parentPhone}?text=Hello, this is Sumit calling from EduManage Pro.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm shadow-sm transition-all"
                >
                  <MessageSquare size={16} />
                  <span>Text Parent</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentManagement;
