
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Shield, ArrowLeft, Mail, Lock, Phone, User as UserIcon, Zap } from 'lucide-react';

interface AuthViewProps {
  role: UserRole;
  isSignUp: boolean;
  onBack: () => void;
  onSuccess: (user: User) => void;
  onQuickLogin?: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ role, isSignUp, onBack, onSuccess, onQuickLogin }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockUser: User = {
        id: `USR-${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name || (isSignUp ? 'New User' : 'Demo User'),
        email: formData.email,
        phone: formData.phone || '012-3456789',
        role: role,
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
        profileComplete: false // New users need setup
      };
      
      setLoading(false);
      onSuccess(mockUser);
    }, 1500);
  };

  const getRoleLabel = () => {
    switch(role) {
      case UserRole.PARENT: return 'Guardian';
      case UserRole.DRIVER: return 'Transporter';
      case UserRole.TEACHER: return 'Staff';
      default: return 'Admin';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="bg-indigo-600 p-8 text-white relative">
          <button onClick={onBack} className="absolute top-8 left-8 p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col items-center">
            <div className="bg-white/20 p-3 rounded-2xl mb-4 backdrop-blur-md">
              <Shield size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">{isSignUp ? 'Join' : 'Sign In'} as {getRoleLabel()}</h1>
            <p className="text-indigo-100 text-sm font-medium mt-1">Acik Guardian Network</p>
          </div>
        </div>

        <div className="p-10 space-y-8">
          {onQuickLogin && (
            <button 
              onClick={onQuickLogin}
              className="w-full bg-indigo-50 text-indigo-700 py-4 rounded-2xl font-black text-sm uppercase tracking-widest border-2 border-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all"
            >
              <Zap size={18} className="fill-indigo-700" /> Use Demo Account
            </button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-slate-300">Or Manual Entry</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Full Name" 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" 
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com" 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>

            <p className="text-center text-xs font-bold text-slate-400 mt-4">
              By continuing, you agree to our <span className="text-slate-900 underline">Terms of Service</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
