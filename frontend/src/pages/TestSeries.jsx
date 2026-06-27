import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Trash2, 
  Download, 
  Calendar, 
  Award, 
  BookOpen, 
  CheckCircle,
  FileText,
  Clock,
  X,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const TestSeries = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [tests, setTests] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]); // For result uploading
  const [myResults, setMyResults] = useState([]); // For student results view
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isGradesViewOpen, setIsGradesViewOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  
  // Results view helper
  const [testGrades, setTestGrades] = useState([]);

  // File Upload states
  const [qpFile, setQpFile] = useState(null);
  const [akFile, setAkFile] = useState(null);
  const [solFile, setSolFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register: regTest, handleSubmit: handleTestSubmit, reset: resetTest } = useForm();
  const { register: regResult, handleSubmit: handleResultSubmit, reset: resetResult } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [testsRes, batchesRes] = await Promise.all([
        api.get('/tests'),
        isAdmin ? api.get('/batches') : Promise.resolve({ data: { batches: [] } })
      ]);
      setTests(testsRes.data.tests || []);
      setBatches(batchesRes.data.batches || []);

      if (isAdmin) {
        const studentRes = await api.get('/students');
        setStudents(studentRes.data.students || []);
      } else {
        const resultsRes = await api.get('/tests/result/my-results');
        setMyResults(resultsRes.data.results || []);
      }
    } catch (err) {
      console.error('Failed to load test series', err);
      setError('Could not retrieve test details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenAddTest = () => {
    resetTest();
    setQpFile(null);
    setAkFile(null);
    setSolFile(null);
    setIsTestOpen(true);
  };

  const handleOpenAddResult = (test) => {
    resetResult();
    setSelectedTest(test);
    setIsResultOpen(true);
  };

  const handleOpenGradesView = async (test) => {
    setSelectedTest(test);
    setIsGradesViewOpen(true);
    try {
      const response = await api.get(`/tests/result/test/${test.id}`);
      setTestGrades(response.data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTest = async (id) => {
    if (window.confirm('Delete this test series and any uploaded student score sheets? This action is permanent.')) {
      try {
        await api.delete(`/tests/${id}`);
        setTests(tests.filter(t => t.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  const handleCreateTest = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('subject', data.subject);
      formData.append('batchId', data.batchId);
      formData.append('totalMarks', data.totalMarks);
      formData.append('date', data.date);
      
      if (qpFile) formData.append('questionPaper', qpFile);
      if (akFile) formData.append('answerKey', akFile);
      if (solFile) formData.append('solution', solFile);

      const response = await api.post('/tests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setIsTestOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadScore = async (data) => {
    setSubmitting(true);
    try {
      const response = await api.post('/tests/result', {
        testId: selectedTest.id,
        studentId: data.studentId,
        marksObtained: data.marksObtained,
        remarks: data.remarks
      });
      if (response.data.success) {
        setIsResultOpen(false);
        alert('Score details published successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Evaluation</p>
          <h1 className="font-outfit font-extrabold text-2xl text-slate-800 dark:text-white mt-1">Test Series Management</h1>
        </div>
        {isAdmin && (
          <button 
            onClick={handleOpenAddTest}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-glow-primary transition-all duration-200"
          >
            <Plus size={18} />
            <span>Create Test</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading exam boards...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <AlertCircle size={32} />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Test Series Lists */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-outfit font-bold text-lg text-slate-805 dark:text-white">Active Test Series</h3>
            
            {tests.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-soft">
                <Award className="mx-auto text-slate-350 dark:text-slate-650 mb-4" size={40} />
                <p className="font-semibold text-slate-705 dark:text-slate-300">No test papers published yet</p>
                <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">Upload exam question papers and answer sheets.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tests.map(test => (
                  <div 
                    key={test.id}
                    className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Subject Tag */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-2.5 py-0.5 rounded-lg bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-light font-bold text-[10px] uppercase">
                          {test.subject}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                          Max: {test.totalMarks} Marks
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-outfit font-bold text-slate-850 dark:text-white text-base truncate" title={test.title}>{test.title}</h4>
                      
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        <Calendar size={12} />
                        <span>Date: {test.date}</span>
                      </div>

                      {/* Resources Attachment Grid links */}
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                        {test.questionPaperUrl ? (
                          <a 
                            href={test.questionPaperUrl.startsWith('http') ? test.questionPaperUrl : `http://localhost:5000${test.questionPaperUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-primary dark:text-primary-light"
                          >
                            Q. Paper
                          </a>
                        ) : <span className="p-2 text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900 rounded-lg">No QP</span>}

                        {test.answerKeyUrl ? (
                          <a 
                            href={test.answerKeyUrl.startsWith('http') ? test.answerKeyUrl : `http://localhost:5000${test.answerKeyUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-success"
                          >
                            Ans Key
                          </a>
                        ) : <span className="p-2 text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900 rounded-lg">No Key</span>}

                        {test.solutionUrl ? (
                          <a 
                            href={test.solutionUrl.startsWith('http') ? test.solutionUrl : `http://localhost:5000${test.solutionUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-secondary dark:text-secondary-light"
                          >
                            Solutions
                          </a>
                        ) : <span className="p-2 text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900 rounded-lg">No Sol</span>}
                      </div>
                    </div>

                    {/* Footer Admin controls */}
                    <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/40 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">
                        Batch: {test.batchName}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {isAdmin ? (
                          <>
                            <button 
                              onClick={() => handleOpenAddResult(test)}
                              className="px-2.5 py-1.5 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary/20 rounded-lg text-xs font-bold transition-all"
                            >
                              Add Grade
                            </button>
                            <button 
                              onClick={() => handleOpenGradesView(test)}
                              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-lg text-xs font-bold transition-all"
                            >
                              View Grades
                            </button>
                            <button 
                              onClick={() => handleDeleteTest(test.id)}
                              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all shadow-sm"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        ) : (
                          // Student: View results trigger if any
                          <button 
                            onClick={() => handleOpenGradesView(test)}
                            className="px-3 py-1.5 bg-primary text-white hover:bg-primary-dark rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            View Result Card
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Score Sheet Reports */}
          <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft h-[500px] flex flex-col">
            <h3 className="font-outfit font-bold text-lg text-slate-805 dark:text-white mb-4">My Score Cards</h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {!isAdmin ? (
                myResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
                    <Award size={36} className="text-slate-350 dark:text-slate-650 mb-2 animate-pulse" />
                    <span className="text-xs font-medium">Exam grades will appear once evaluated.</span>
                  </div>
                ) : (
                  myResults.map(res => (
                    <div 
                      key={res.id}
                      className="p-4 rounded-xl border border-slate-50 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-900/35 hover:border-primary/20 transition-all"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-bold text-slate-850 dark:text-white truncate">{res.testTitle}</span>
                        <span className="px-2 py-0.5 rounded bg-primary text-white text-[10px] font-bold uppercase">Rank {res.rank}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-450 dark:text-slate-500">Marks Obtained</span>
                        <span className="text-slate-800 dark:text-white font-extrabold">{res.marksObtained} / {res.totalMarks} ({res.grade})</span>
                      </div>

                      {res.remarks && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic border-t border-slate-100 dark:border-slate-750 pt-2.5 mt-2.5">
                          "{res.remarks}"
                        </p>
                      )}
                    </div>
                  ))
                )
              ) : (
                /* Admin Instructions */
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-4">
                  <UserCheck size={36} className="text-slate-350 dark:text-slate-650 mb-2" />
                  <span className="text-xs font-medium">Click "Add Grade" on any test card to compile student scores. Students can check their rankings directly in their portal.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Modal - Publish Test Form */}
      {isTestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Publish Exam Paper</h3>
              <button onClick={() => setIsTestOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTestSubmit(handleCreateTest)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Test Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Midterm Physics Mock"
                  {...regTest('title', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-808 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Subject *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Physics"
                    {...regTest('subject', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-808 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Assign Batch *</label>
                  <select
                    required
                    {...regTest('batchId', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-700 dark:text-slate-205"
                  >
                    <option value="">Select Batch</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Max Marks *</label>
                  <input 
                    type="number"
                    required
                    {...regTest('totalMarks', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-808 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Exam Date *</label>
                  <input 
                    type="date"
                    required
                    {...regTest('date', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-850 dark:text-white"
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Exam File Uploads</label>
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Q. Paper:</span>
                    <input type="file" onChange={(e) => setQpFile(e.target.files[0])} className="text-xs text-slate-500 w-44" />
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Ans Key:</span>
                    <input type="file" onChange={(e) => setAkFile(e.target.files[0])} className="text-xs text-slate-500 w-44" />
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Solutions:</span>
                    <input type="file" onChange={(e) => setSolFile(e.target.files[0])} className="text-xs text-slate-500 w-44" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/40">
                <button type="button" onClick={() => setIsTestOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 font-semibold text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-glow-primary text-sm">
                  {submitting ? 'Publishing...' : 'Publish Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Upload Student Grade */}
      {isResultOpen && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-850 dark:text-white">Record student grade</h3>
              <button onClick={() => setIsResultOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResultSubmit(handleUploadScore)} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Selected Test</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-1">{selectedTest.title} (Max: {selectedTest.totalMarks} Marks)</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Select Student *</label>
                <select
                  required
                  {...regResult('studentId', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-700 dark:text-slate-205"
                >
                  <option value="">Select Student</option>
                  {students
                    .filter(s => s.batchId === selectedTest.batchId)
                    .map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                  }
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Marks Obtained *</label>
                <input 
                  type="number"
                  step="0.5"
                  required
                  {...regResult('marksObtained', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Remarks / Comments</label>
                <input 
                  type="text"
                  placeholder="e.g. Excellent conceptual clarity"
                  {...regResult('remarks')}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/40">
                <button type="button" onClick={() => setIsResultOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 font-semibold text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-glow-primary text-sm">
                  Publish Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - View Grades list for Test */}
      {isGradesViewOpen && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <div>
                <h3 className="font-outfit font-bold text-lg text-slate-850 dark:text-white">Exam Report Card</h3>
                <p className="text-xs text-slate-400 dark:text-slate-550 mt-0.5">{selectedTest.title}</p>
              </div>
              <button onClick={() => setIsGradesViewOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-505 dark:text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[25rem] overflow-y-auto">
              {testGrades.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">No results published for this test.</div>
              ) : (
                <div className="space-y-3">
                  {testGrades.map(res => (
                    <div 
                      key={res.id}
                      className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 rounded-xl"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{res.studentName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">Score: {res.marksObtained} / {res.totalMarks} ({res.grade})</p>
                      </div>
                      
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded bg-primary text-white text-[9px] font-bold uppercase">Rank {res.rank}</span>
                        {res.remarks && <p className="text-[9px] text-slate-500 dark:text-slate-400 italic mt-1 truncate w-40">"{res.remarks}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TestSeries;
