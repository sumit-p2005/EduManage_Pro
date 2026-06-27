import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Award, 
  Calendar, 
  X,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const Gallery = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [gallery, setGallery] = useState([]);
  const [toppers, setToppers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [activeCategory, setActiveCategory] = useState('all');

  // Modals
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isTopperOpen, setIsTopperOpen] = useState(false);
  
  // File Upload states
  const [photoFile, setPhotoFile] = useState(null);
  const [topperFile, setTopperFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register: regPhoto, handleSubmit: handlePhotoSubmit, reset: resetPhoto } = useForm();
  const { register: regTopper, handleSubmit: handleTopperSubmit, reset: resetTopper } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [galRes, toppersRes] = await Promise.all([
        api.get('/gallery'),
        api.get('/gallery/toppers')
      ]);
      setGallery(galRes.data.gallery || []);
      setToppers(toppersRes.data.toppers || []);
    } catch (err) {
      console.error('Failed to load gallery assets', err);
      setError('Could not retrieve gallery assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenPhoto = () => {
    resetPhoto();
    setPhotoFile(null);
    setIsPhotoOpen(true);
  };

  const handleOpenTopper = () => {
    resetTopper();
    setTopperFile(null);
    setIsTopperOpen(true);
  };

  const handleDeletePhoto = async (id) => {
    if (window.confirm('Delete this photo from the gallery?')) {
      try {
        await api.delete(`/gallery/${id}`);
        setGallery(gallery.filter(g => g.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  const handleDeleteTopper = async (id) => {
    if (window.confirm('Delete this topper card from the portal?')) {
      try {
        await api.delete(`/gallery/toppers/${id}`);
        setToppers(toppers.filter(t => t.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  const handleAddPhoto = async (data) => {
    if (!photoFile) {
      alert('Please select an image file to upload.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('category', data.category);
      formData.append('date', data.date);
      formData.append('image', photoFile);

      const response = await api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setIsPhotoOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTopper = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('marks', data.marks);
      formData.append('rank', data.rank);
      formData.append('quote', data.quote);
      if (topperFile) {
        formData.append('photo', topperFile);
      }

      const response = await api.post('/gallery/toppers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setIsTopperOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish topper card.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['all', 'events', 'seminars', 'toppers', 'annual function'];

  const filteredGallery = gallery.filter(item => 
    activeCategory === 'all' || item.category.toLowerCase() === activeCategory.toLowerCase()
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Visuals</p>
          <h1 className="font-outfit font-extrabold text-2xl text-slate-805 dark:text-white mt-1">Gallery & Achievements</h1>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <button 
              onClick={handleOpenTopper}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Add Topper Card
            </button>
            <button 
              onClick={handleOpenPhoto}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-glow-primary transition-all duration-200 text-sm"
            >
              <Plus size={18} />
              <span>Upload Photo</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading albums...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <AlertCircle size={32} />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : (
        <>
          {/* --- TOPPERS SECTION --- */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-750 pb-3">
              <Award className="text-secondary" />
              <h2 className="font-outfit font-extrabold text-lg">Our Academic Toppers (Topper Wall)</h2>
            </div>

            {toppers.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Toppers wall is currently empty.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                {toppers.map(t => (
                  <div 
                    key={t.id} 
                    className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 rounded-2xl shadow-soft flex gap-4 relative"
                  >
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteTopper(t.id)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-red-500 shadow-sm"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                    
                    <img 
                      src={t.photo} 
                      alt={t.name} 
                      className="w-16 h-16 rounded-xl object-cover shrink-0 ring-2 ring-primary/10"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-base">{t.name}</h4>
                      <p className="text-xs text-primary font-bold mt-0.5">{t.marks} • {t.rank}</p>
                      <p className="text-xs italic text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                        "{t.quote}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- ALBUM GALLERY SECTION --- */}
          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-750 pb-3">
              <ImageIcon className="text-primary" />
              <h2 className="font-outfit font-extrabold text-lg">Institute Album Showcase</h2>
            </div>

            {/* Category tabs filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-200 ${
                    activeCategory === cat 
                      ? 'bg-primary text-white shadow-glow-primary' 
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Visual Masonry Grid */}
            {filteredGallery.length === 0 ? (
              <div className="p-12 text-center text-slate-400">Album is empty for this category.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredGallery.map(img => (
                  <div 
                    key={img.id}
                    className="group relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-soft hover:shadow-premium transition-all duration-350"
                  >
                    {/* Delete button (Admin only) */}
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeletePhoto(img.id)}
                        className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}

                    {/* Image frame */}
                    <div className="aspect-[4/3] overflow-hidden bg-slate-900">
                      <img 
                        src={img.imageUrl.startsWith('http') ? img.imageUrl : `http://localhost:5000${img.imageUrl}`} 
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Caption Overlay */}
                    <div className="p-4 border-t border-slate-50 dark:border-slate-700/30">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light font-bold text-[9px] uppercase">
                        {img.category}
                      </span>
                      <h5 className="font-bold text-sm text-slate-800 dark:text-white mt-2.5 truncate">{img.title}</h5>
                      <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                        <Calendar size={10} />
                        <span>Date: {img.date}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal - Upload Photo */}
      {isPhotoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Upload Gallery Image</h3>
              <button onClick={() => setIsPhotoOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePhotoSubmit(handleAddPhoto)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Image Caption *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Science Fair Exhibition"
                  {...regPhoto('title', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Album Category *</label>
                  <select
                    required
                    {...regPhoto('category', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-700 dark:text-slate-205"
                  >
                    <option value="">Select Album</option>
                    <option value="Events">Events</option>
                    <option value="Seminars">Seminars</option>
                    <option value="Toppers">Toppers</option>
                    <option value="Annual Function">Annual Function</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Event Date</label>
                  <input 
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    {...regPhoto('date')}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-850 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Image File *</label>
                <input 
                  type="file" 
                  required
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="w-full px-4 py-2.5 mt-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl cursor-pointer text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/40">
                <button type="button" onClick={() => setIsPhotoOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 font-semibold text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-glow-primary text-sm">
                  {submitting ? 'Uploading...' : 'Publish Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Add Topper Card */}
      {isTopperOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700/40">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Publish Topper Hall of fame card</h3>
              <button onClick={() => setIsTopperOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTopperSubmit(handleAddTopper)} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Topper Full Name *</label>
                <input 
                  type="text" 
                  required
                  {...regTopper('name', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Marks / Grade *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 99.8 Percentile"
                    {...regTopper('marks', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Rank *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. AIR 124"
                    {...regTopper('rank', { required: true })}
                    className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Motivational Quote *</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="e.g. Consistency is the secret key to NEET ranks..."
                  {...regTopper('quote', { required: true })}
                  className="w-full px-4 py-2.5 mt-1 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl outline-none focus:border-primary text-slate-805 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Topper Photo (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setTopperFile(e.target.files[0])}
                  className="w-full px-4 py-2.5 mt-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-xl cursor-pointer text-slate-550"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/40">
                <button type="button" onClick={() => setIsTopperOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-205 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-505 font-semibold text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-glow-primary text-sm">
                  {submitting ? 'Publishing...' : 'Add To Topper Wall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;
