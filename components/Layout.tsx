
import React from 'react';
import { UserRole, Trip, TripStatus, User as UserType } from '../types';
import { Shield, User, Settings, LayoutDashboard, Truck, ShieldAlert, GraduationCap, Home, LogOut, Clock, Smartphone } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeRole: UserRole;
  onRoleChange: (role: UserRole, signUp?: boolean) => void;
  trips?: Trip[];
  user: UserType;
  onLogout: () => void;
  onNavigateSettings: () => void;
  onNavigateDashboard: () => void;
  currentView: 'DASHBOARD' | 'SETTINGS';
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeRole, 
  onRoleChange, 
  trips = [], 
  user, 
  onLogout, 
  onNavigateSettings, 
  onNavigateDashboard,
  currentView
}) => {
  const pendingCount = trips.filter(t => t.status === TripStatus.MATCHING).length;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-100">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Acik</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <p className="px-2 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigation</p>
          <button 
            onClick={onNavigateDashboard}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${currentView === 'DASHBOARD' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          
          <button 
            onClick={onNavigateSettings}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${currentView === 'SETTINGS' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Smartphone className="w-5 h-5" /> Account Profile
          </button>

          <div className="pt-8 opacity-40">
            <p className="px-2 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Node</p>
            <div className="px-3 py-2 text-xs font-bold text-slate-400 bg-slate-50 rounded-lg italic">
              {activeRole} PORTAL
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-2xl border border-slate-100 relative group cursor-pointer" onClick={onNavigateSettings}>
            <img src={user.avatar} className="w-9 h-9 rounded-xl border-2 border-white shadow-sm" alt="User" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate">
                {user.verificationStatus === 'PENDING' ? 'VERIFICATION PENDING' : activeRole.toLowerCase()}
              </p>
            </div>
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="bg-indigo-600 text-white p-1 rounded-full shadow-lg"><Settings size={12}/></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header/Nav */}
      <div className="md:hidden flex flex-col bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
         <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2" onClick={onNavigateDashboard}>
               <Shield className="text-indigo-600 w-6 h-6" />
               <span className="font-bold text-lg">Acik</span>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={onNavigateSettings} className="text-slate-400"><Settings size={22} /></button>
               <button onClick={onLogout} className="text-slate-400"><LogOut size={22} /></button>
            </div>
         </div>
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
