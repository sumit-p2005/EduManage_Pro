import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Layers, 
  Calendar, 
  FileText, 
  Award, 
  DollarSign, 
  ArrowRight, 
  CheckCircle,
  Menu,
  X,
  Star
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { title: 'Notes & Study Material', desc: 'Organize and distribute PDFs, PPTs, and Assignments by Subject, Chapter, and Topic.', icon: BookOpen, color: 'text-primary bg-primary/10' },
    { title: 'Smart Timetable', desc: 'Schedule classes, post cancellations, or declare holidays instantly. Students see updates in real-time.', icon: Calendar, color: 'text-secondary bg-secondary/10' },
    { title: 'Interactive Homework', desc: 'Teachers upload assignments with file attachments and deadlines. Students download from dashboards.', icon: FileText, color: 'text-success bg-success/10' },
    { title: 'Test Series Management', desc: 'Publish exams, upload question sheets, keys, and grades. Auto-generate percentile ranks.', icon: Award, color: 'text-warning bg-warning/10' },
    { title: 'Simple Fees Tracker', desc: 'Add fee details, track paid installments, calculate pending balance, and display warning alerts.', icon: DollarSign, color: 'text-red-500 bg-red-500/10' },
    { title: 'Student Management', desc: 'Store database records (name, photo, phone, parents details) and initiate Call/WhatsApp actions.', icon: Users, color: 'text-sky-500 bg-sky-500/10' },
  ];

  const benefits = [
    'Complete Dark/Light Mode interface',
    'Mobile-first responsive dashboard layout',
    'No complex APIs: quick-tap WhatsApp integration',
    'Interactive Recharts analytical boards',
    'Secure role-based path protection guards',
  ];

  const testimonials = [
    { name: 'Dr. Ramesh Kumar', role: 'Director, Apex Classes', quote: 'EduManage Pro transformed our workflow. Tracking fee records and sharing lecture notes has never been this smooth and effortless!', rating: 5 },
    { name: 'Priya Sen', role: 'Class 12 Student', quote: 'I love the homework and test solution downloads. The dark mode is extremely comforting during late night revisions.', rating: 5 },
    { name: 'Mrs. Anita Das', role: 'Parent of Kabir Das', quote: 'The transparency in fee collection reports and immediate WhatsApp follow-ups gives me immense peace of mind.', rating: 5 }
  ];



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/20">
              <BookOpen size={22} className="stroke-[2.5]" />
            </div>
            <span className="font-outfit font-extrabold text-xl tracking-wide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EduManage Pro
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light transition-colors">Features</a>
            <a href="#benefits" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light transition-colors">Why Us</a>
            <a href="#testimonials" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light transition-colors">Testimonials</a>
            <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light transition-colors">Pricing</a>
            <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light transition-colors">Contact</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Log In
            </Link>
            <Link to="/login" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark shadow-glow-primary transition-all duration-200">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Icon */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-600 dark:text-slate-300">Features</a>
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-600 dark:text-slate-300">Why Us</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-600 dark:text-slate-300">Testimonials</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-600 dark:text-slate-300">Pricing</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-600 dark:text-slate-300">Contact</a>
            <hr className="border-slate-100 dark:border-slate-800 my-2" />
            <div className="flex flex-col gap-3">
              <Link to="/login" className="w-full text-center py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Log In
              </Link>
              <Link to="/login" className="w-full text-center py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.05),transparent_50%)]" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        
        <div className="max-w-7xl mx-auto px-6 text-center relative">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Empowering Modern Institutes
          </span>
          
          <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Smart Coaching. <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Simplified Management.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
            EduManage Pro is the ultimate educational dashboard built to streamline students management, lecture notes, timetables, test grades, and automated WhatsApp reminders.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-premium transform hover:-translate-y-0.5 transition-all duration-200 shadow-glow-primary"
            >
              <span>Launch Console</span>
              <ArrowRight size={18} />
            </button>
            <a 
              href="#features"
              className="px-8 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            >
              Learn More
            </a>
          </div>

          {/* Desktop Dashboard Preview Image */}
          <div className="mt-16 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-premium max-w-5xl mx-auto bg-slate-900 aspect-[16/9]">
            <img 
              src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&q=80" 
              alt="EduManage Pro Console Dashboard Preview"
              className="w-full h-full object-cover opacity-85"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">Robust Features</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4">
              Everything you need to orchestrate a high-performance educational center under a unified glassmorphism dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div 
                  key={i} 
                  className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us & Benefits */}
      <section id="benefits" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Graphics */}
            <div className="relative rounded-2xl overflow-hidden shadow-premium aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600" 
                alt="Teacher explaining using EduManage app"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Information */}
            <div>
              <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white leading-tight">
                Designed to maximize efficiency and topper ranks
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-6 leading-relaxed">
                By choosing EduManage Pro, you eliminate messy spreadsheet tracking, scattered WhatsApp groups, and lost assignment folders. We supply a professional dashboard that saves you 15+ administrative hours weekly.
              </p>

              <div className="mt-8 space-y-4">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="text-success shrink-0" size={20} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{b}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">Trusted by Thousands</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4">
              See how teachers, students, and parents leverage EduManage Pro to transform learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-4 text-warning">
                    {[...Array(t.rating)].map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
                <div className="mt-6 border-t border-slate-50 dark:border-slate-750 pt-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t.name}</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">1000 Rs Per Month</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4">
              Unlock access for your entire student enrollment list. No surprise add-ons.
            </p>
          </div>

          <div className="max-w-md mx-auto rounded-3xl bg-white dark:bg-slate-800 border-2 border-primary/20 dark:border-primary/40 shadow-premium p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-primary text-white text-[10px] font-bold uppercase rounded-bl-2xl">
              Most Popular
            </div>
            
            <h3 className="font-outfit font-bold text-xl text-slate-800 dark:text-white">Pro Institute</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Unlimited storage & student database</p>
            
            <div className="flex items-baseline gap-2 mt-6">
              <span className="text-4xl font-extrabold text-slate-950 dark:text-white">₹1,000</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">/ month</span>
            </div>

            <hr className="border-slate-100 dark:border-slate-700/60 my-6" />

            <ul className="space-y-3.5 mb-8">
              {['Unlimited Student Profiles', 'Interactive Batches Timetable', '100 GB PDF & PPT Storage', 'Full Fee Collections Ledger', 'Test Performance Ranking', 'WhatsApp Follow-ups Interface'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <CheckCircle size={16} className="text-primary shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">{feat}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => navigate('/login')}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all duration-200"
            >
              Try Out Console
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">Get in touch</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 leading-relaxed max-w-xl mx-auto">
            Have questions about custom migrations or school-wide deployments? Feel free to reach out to our team.
          </p>
          
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300">
              <h4 className="font-bold text-slate-700 dark:text-slate-350 text-sm">Support Email</h4>
              <p className="text-base text-primary dark:text-primary-light font-semibold mt-2">support@edumanagepro.com</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-soft hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300">
              <h4 className="font-bold text-slate-700 dark:text-slate-350 text-sm">Business Inquiries</h4>
              <p className="text-base text-primary dark:text-primary-light font-semibold mt-2">sales@edumanagepro.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
              <BookOpen size={16} />
            </div>
            <span className="font-outfit font-bold text-white text-base">EduManage Pro</span>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} EduManage Pro. All rights reserved. Built for coaching excellence.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
