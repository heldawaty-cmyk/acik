
import React from 'react';
import { UserRole } from '../types';
import { Shield, User, Truck, GraduationCap, ShieldAlert, ChevronRight, Star, MapPin, CheckCircle, Calendar, UserPlus, Navigation, Bell, Search, Zap } from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
  onSignUp: (role: UserRole) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole, onSignUp }) => {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-900">Acik Transporter</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#roles" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Join Network</a>
            <button 
              onClick={() => onSelectRole(UserRole.PARENT)}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
            >
              <Zap size={14} className="fill-white" /> Quick Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Star className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Guardian Mobility Network</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Safe. Verified.<br />
            <span className="text-indigo-600">Child Transport.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            A trusted "guardian mobility network" for school transportation. Real-time tracking, vetted drivers, and intelligent monitoring for peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <button 
              onClick={() => onSignUp(UserRole.PARENT)}
              className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3"
            >
              Get Started <ChevronRight size={20} />
            </button>
            <button 
              onClick={() => onSelectRole(UserRole.PARENT)}
              className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              <Zap size={20} className="text-indigo-600 fill-indigo-600" /> One-Tap Demo
            </button>
          </div>
        </div>
      </section>

      {/* Stats/Proof */}
      <section id="features" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-3xl mb-6">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">100% Vetted Drivers</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">Every driver undergoes deep background checks and vehicle safety inspections.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-3xl mb-6">
              <MapPin size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Live GPS Tracking</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">Real-time location sharing with encrypted links for parents and schools.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-indigo-50 text-indigo-600 p-4 rounded-3xl mb-6">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Safety Monitoring</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">AI-assisted anomaly detection for route deviations and unexpected delays.</p>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section id="roles" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Enter the Network</h2>
            <p className="text-slate-500 font-medium">Select a portal to explore the platform immediately.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                role: UserRole.PARENT, 
                title: 'Parent', 
                desc: 'Schedule rides, track live GPS, and manage child profiles.',
                icon: User,
                color: 'bg-indigo-600',
                lightColor: 'bg-indigo-50',
                textColor: 'text-indigo-600'
              },
              { 
                role: UserRole.DRIVER, 
                title: 'Driver', 
                desc: 'Earn flexible income transporting students in your zone.',
                icon: Truck,
                color: 'bg-emerald-600',
                lightColor: 'bg-emerald-50',
                textColor: 'text-emerald-600'
              },
              { 
                role: UserRole.TEACHER, 
                title: 'Teacher', 
                desc: 'Monitor student arrivals and manage gate rosters.',
                icon: GraduationCap,
                color: 'bg-amber-500',
                lightColor: 'bg-amber-50',
                textColor: 'text-amber-600'
              },
              { 
                role: UserRole.ADMIN, 
                title: 'Admin', 
                desc: 'Ops control, safety audits, and network management.',
                icon: ShieldAlert,
                color: 'bg-slate-900',
                lightColor: 'bg-slate-50',
                textColor: 'text-slate-900'
              }
            ].map((card, idx) => (
              <button 
                key={idx}
                onClick={() => onSelectRole(card.role)}
                className="group relative bg-white p-10 rounded-[3rem] border border-slate-200 text-left hover:border-indigo-600 transition-all hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 flex flex-col h-full overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Zap size={20} className="text-indigo-400 fill-indigo-400" />
                </div>
                <div className={`${card.lightColor} ${card.textColor} p-5 rounded-[2rem] w-fit mb-8 group-hover:scale-110 transition-transform`}>
                  <card.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{card.title}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 flex-1">{card.desc}</p>
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
                  Instant Access <ChevronRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <Shield className="text-indigo-400 w-8 h-8" />
              <span className="font-black text-3xl tracking-tighter">Acik</span>
            </div>
            <p className="text-slate-400 font-medium max-w-sm">
              Securing the journey of tomorrow's leaders through verified mobility and intelligent oversight.
            </p>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-8 text-indigo-400">Company</h4>
            <ul className="space-y-4 text-slate-400 font-medium text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-8 text-indigo-400">Support</h4>
            <ul className="space-y-4 text-slate-400 font-medium text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Driver Help</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Parent Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety Protocol</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 text-center">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">© 2025 Acik Transporter Network • All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
