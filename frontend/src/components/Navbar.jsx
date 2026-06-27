import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  ChevronDown, 
  LogOut, 
  User, 
  X,
  FileText,
  BookOpen,
  Award,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar, title = "Dashboard" }) => {
  const { user, logout, updateProfilePicture } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG)');
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await api.put('/auth/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data?.success && response.data?.photo) {
        updateProfilePicture(response.data.photo);
      }
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      alert('Error updating profile picture: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingPhoto(false);
    }
  };
  
  // Global search states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    students: [],
    notes: [],
    tests: [],
    homework: [],
    announcements: []
  });
  const [isSearching, setIsSearching] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/announcements');
        const list = response.data.announcements || [];
        setNotifications(list.slice(0, 5)); // Show latest 5
        setUnreadCount(list.filter(item => {
          // Unread if created in the last 2 days
          const diffTime = Math.abs(new Date() - new Date(item.createdAt));
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 2;
        }).length);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    if (user) {
      fetchNotifications();
      // Poll every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Handle global search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ students: [], notes: [], tests: [], homework: [], announcements: [] });
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Simple search query client filter logic
        const q = searchQuery.toLowerCase();
        
        // Parallel fetching
        const [notesRes, testsRes, homeworkRes, annRes] = await Promise.all([
          api.get('/notes'),
          api.get('/tests'),
          api.get('/homework'),
          api.get('/announcements')
        ]);

        const filteredNotes = (notesRes.data.notes || []).filter(n => 
          n.title.toLowerCase().includes(q) || n.subject.toLowerCase().includes(q)
        );
        const filteredTests = (testsRes.data.tests || []).filter(t => 
          t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)
        );
        const filteredHW = (homeworkRes.data.homework || []).filter(h => 
          h.title.toLowerCase().includes(q) || h.subject.toLowerCase().includes(q)
        );
        const filteredAnn = (annRes.data.announcements || []).filter(a => 
          a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
        );

        let filteredStudents = [];
        if (user.role === 'admin') {
          const studentsRes = await api.get('/students');
          filteredStudents = (studentsRes.data.students || []).filter(s => 
            s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q)
          );
        }

        setSearchResults({
          students: filteredStudents.slice(0, 3),
          notes: filteredNotes.slice(0, 3),
          tests: filteredTests.slice(0, 3),
          homework: filteredHW.slice(0, 3),
          announcements: filteredAnn.slice(0, 3)
        });
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user]);

  const handleSearchResultClick = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const hasSearchResults = Object.values(searchResults).some(arr => arr.length > 0);

  return (
    <>
      <header className="sticky top-0 right-0 z-30 flex items-center justify-between h-20 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/60">
        
        {/* Left Side: Sidebar Toggle & Page Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-xl lg:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
          >
            <Menu size={22} />
          </button>
          <h2 className="font-outfit font-bold text-xl text-slate-800 dark:text-white">{title}</h2>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          
          {/* Global Search Button */}
          <button 
            onClick={() => setSearchOpen(true)}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary transition-all duration-200"
            title="Global Search"
          >
            <Search size={20} />
          </button>

          {/* Theme Toggler */}
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary transition-all duration-200"
          >
            {darkMode ? <Sun size={20} className="stroke-[2]" /> : <Moon size={20} className="stroke-[2]" />}
          </button>

          {/* Notification Center */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setUnreadCount(0);
              }}
              className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary transition-all duration-200"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 py-2 origin-top-right overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-50 dark:border-slate-700/40">
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Recent Announcements</span>
                  <Link to="/announcements" onClick={() => setShowNotifications(false)} className="text-xs text-primary dark:text-primary-light hover:underline font-medium">View All</Link>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/30">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                      <AlertCircle size={28} className="text-slate-300 dark:text-slate-600 mb-2" />
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">No recent announcements</span>
                    </div>
                  ) : (
                    notifications.map(item => (
                      <Link 
                        to="/announcements" 
                        key={item.id} 
                        onClick={() => setShowNotifications(false)}
                        className="flex flex-col gap-1 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.title}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{item.content}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 self-end mt-1">{item.date}</span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <img 
                src={user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                alt={user?.name}
                className="w-9 h-9 rounded-xl object-cover"
              />
              <ChevronDown size={16} className="text-slate-400 dark:text-slate-500 hidden sm:block" />
            </button>

            {/* Profile Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 py-2 origin-top-right overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700/40 flex flex-col items-center text-center">
                  <div className="relative group mb-2 mt-1">
                    <img 
                      src={user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                      alt={user?.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 dark:border-primary/40 shadow-sm"
                    />
                    <label 
                      className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
                      htmlFor="profile-upload"
                    >
                      <User size={16} className="text-white" />
                    </label>
                    <input 
                      type="file" 
                      id="profile-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handlePhotoUpload} 
                      disabled={uploadingPhoto}
                    />
                  </div>
                  {uploadingPhoto ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-primary animate-pulse font-medium">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => document.getElementById('profile-upload')?.click()}
                      className="text-[11px] text-primary hover:text-primary-dark dark:text-primary-light hover:underline font-semibold"
                    >
                      Change Photo
                    </button>
                  )}
                  
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase mt-2">Signed In As</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate w-full mt-0.5">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-full">{user?.email}</p>
                </div>
                
                <div className="py-1">
                  <button 
                    onClick={() => {
                      setShowProfileDropdown(false);
                      // In a real app we might redirect to a profile component
                      navigate('/dashboard');
                    }}
                    className="flex items-center w-full gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <User size={16} className="text-slate-400" />
                    <span>My Profile</span>
                  </button>
                </div>

                <div className="border-t border-slate-50 dark:border-slate-700/40 pt-1">
                  <button 
                    onClick={logout}
                    className="flex items-center w-full gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-semibold"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Search Input Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-3 flex-1">
                <Search className="text-slate-400 dark:text-slate-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Search students, notes, test papers, homework, announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full text-base bg-transparent border-0 outline-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
              <button 
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Results Content */}
            <div className="max-h-[28rem] overflow-y-auto p-5">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Searching resources...</span>
                </div>
              ) : !searchQuery.trim() ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <p className="text-sm font-semibold">Global Workspace Search</p>
                  <p className="text-xs mt-1">Type something to scan all coaching resources instantly.</p>
                </div>
              ) : !hasSearchResults ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <p className="text-sm font-semibold">No results match your search</p>
                  <p className="text-xs mt-1">Double check spellings or try entering broader terms.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Category: Students */}
                  {searchResults.students.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Students</h4>
                      <div className="space-y-1.5">
                        {searchResults.students.map(s => (
                          <div 
                            key={s.id}
                            onClick={() => handleSearchResultClick(`/students`)}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors"
                          >
                            <img src={s.photo} alt={s.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{s.batchName} • {s.phone}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Notes */}
                  {searchResults.notes.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Study Notes</h4>
                      <div className="space-y-1">
                        {searchResults.notes.map(n => (
                          <div 
                            key={n.id}
                            onClick={() => handleSearchResultClick('/notes')}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors"
                          >
                            <BookOpen size={16} className="text-primary" />
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{n.subject} • Chapter: {n.chapter}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Tests */}
                  {searchResults.tests.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Tests & Exams</h4>
                      <div className="space-y-1">
                        {searchResults.tests.map(t => (
                          <div 
                            key={t.id}
                            onClick={() => handleSearchResultClick('/tests')}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors"
                          >
                            <Award size={16} className="text-secondary" />
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{t.subject} • Date: {t.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Homework */}
                  {searchResults.homework.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Homework assignments</h4>
                      <div className="space-y-1">
                        {searchResults.homework.map(h => (
                          <div 
                            key={h.id}
                            onClick={() => handleSearchResultClick('/homework')}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors"
                          >
                            <FileText size={16} className="text-success" />
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{h.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{h.subject} • Due: {h.dueDate}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Announcements */}
                  {searchResults.announcements.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Announcements</h4>
                      <div className="space-y-1">
                        {searchResults.announcements.map(a => (
                          <div 
                            key={a.id}
                            onClick={() => handleSearchResultClick('/announcements')}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors"
                          >
                            <Bell size={16} className="text-warning" />
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{a.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
