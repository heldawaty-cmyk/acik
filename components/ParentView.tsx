
import React, { useState, useMemo } from 'react';
import { Child, Trip, TripStatus, User } from '../types';
import { MOCK_DRIVERS } from '../constants';
import { 
  MapPin, Clock, Phone, MessageSquare, 
  ShieldCheck, Bell, AlertCircle, Siren, AlertTriangle, Navigation, WifiOff, CheckCircle, Smartphone, Plus, Edit3
} from 'lucide-react';
import LiveMap from './LiveMap';

interface ParentViewProps {
  user: User;
  trips: Trip[];
  childrenList: Child[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

const ParentView: React.FC<ParentViewProps> = ({ user, trips, childrenList, setTrips }) => {
  // Filter children to only those belonging to this parent
  const myChildren = useMemo(() => childrenList.filter(c => c.parentId === user.id), [childrenList, user.id]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [sosStage, setSosStage] = useState<'IDLE' | 'CONFIRMING'>('IDLE');
  const [showCoordinationMenu, setShowCoordinationMenu] = useState(false);
  
  const activeTrip = useMemo(() => trips.find(t => 
    myChildren.some(c => c.id === t.childId) &&
    t.status !== TripStatus.COMPLETED && 
    t.status !== TripStatus.MATCHING && 
    t.status !== TripStatus.CANCELLED
  ), [trips, myChildren]);
  
  const currentChild = activeTrip ? myChildren.find(c => c.id === activeTrip.childId) : null;
  const currentDriver = activeTrip ? MOCK_DRIVERS.find(d => d.id === activeTrip.driverId) : null;

  // Formatting Helpers
  const formatTime = (iso: string | undefined) => {
    if (!iso) return "--:--";
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRelativeMins = (iso: string | undefined) => {
    if (!iso) return 0;
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.round(diff / 60000));
  };

  // Status Card Narrative Logic
  const statusInfo = useMemo(() => {
    if (!activeTrip || !currentChild) return null;

    const minsLeft = getRelativeMins(activeTrip.estimatedArrival);
    const hasCriticalAlert = activeTrip.alerts.some(a => !a.resolved);
    const isStale = !activeTrip.driverLocationAuthorized;

    if (activeTrip.coordinationSignal === 'CHILD_NOT_FOUND') {
      return { label: 'ACTION NEEDED', message: 'Driver cannot locate child. Please call immediately.', color: 'bg-red-600', icon: AlertCircle };
    }
    if (isStale) {
      return { label: 'ACTION NEEDED', message: 'Driver signal lost. Tracking protocol active.', color: 'bg-red-600', icon: WifiOff };
    }
    if (hasCriticalAlert) {
      return { label: 'ACTION NEEDED', message: activeTrip.alerts.find(a => !a.resolved)?.message, color: 'bg-red-600', icon: AlertTriangle };
    }
    if (activeTrip.routeDeviation) {
      return { label: 'DELAYED', message: `Heavy traffic, new ETA ${formatTime(activeTrip.estimatedArrival)}`, color: 'bg-amber-500', icon: Clock };
    }

    // Happy Path Narratives
    switch (activeTrip.status) {
      case TripStatus.EN_ROUTE_TO_PICKUP:
        return { label: 'SAFE', message: minsLeft <= 2 ? 'Driver is turning into your street' : `Driver arriving in ${minsLeft} min`, color: 'bg-emerald-600', icon: ShieldCheck };
      case TripStatus.ARRIVED_AT_PICKUP:
        return { label: 'SAFE', message: 'Driver waiting outside pickup point', color: 'bg-emerald-600', icon: MapPin };
      case TripStatus.CHECKED_IN:
        return { label: 'SAFE', message: `${currentChild.name} is verifying ID with driver`, color: 'bg-indigo-600', icon: CheckCircle };
      case TripStatus.PICKED_UP:
        return { label: 'SAFE', message: `${currentChild.name} is safely in the vehicle`, color: 'bg-emerald-600', icon: ShieldCheck };
      case TripStatus.IN_PROGRESS:
        return { label: 'SAFE', message: `En route to ${currentChild.school}. ETA ${formatTime(activeTrip.estimatedArrival)}`, color: 'bg-emerald-600', icon: Navigation };
      default:
        return { label: 'SAFE', message: 'Active Monitoring Enabled', color: 'bg-emerald-600', icon: ShieldCheck };
    }
  }, [activeTrip, currentChild]);

  const setCoordinationSignal = (signal: 'PARENT_LATE' | 'CHANGE_PICKUP' | null) => {
    if (!activeTrip) return;
    setTrips(prev => prev.map(t => t.id === activeTrip.id ? { 
      ...t, 
      coordinationSignal: signal === t.coordinationSignal ? undefined : signal 
    } : t));
    setShowCoordinationMenu(false);
  };

  const triggerSOS = () => {
    setSosStage('IDLE');
    alert("EMERGENCY: Operator and School Security have been patched in. Local emergency services notified.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Acik Parent</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-tight">Guardian: {user.name}</p>
        </div>
        <div className="flex gap-2">
          {sosStage === 'IDLE' ? (
            <button onClick={() => setSosStage('CONFIRMING')} className="p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-black text-xs uppercase flex items-center gap-2">
              <Siren size={18} /> SOS
            </button>
          ) : (
            <div className="flex gap-2 animate-in slide-in-from-right-2">
              <button onClick={() => setSosStage('IDLE')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase">Cancel</button>
              <button onClick={triggerSOS} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-red-200">Confirm SOS</button>
            </div>
          )}
          <button onClick={() => setIsNotificationsOpen(true)} className="p-2.5 bg-white border border-slate-200 rounded-xl relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </header>

      {activeTrip && currentChild ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {statusInfo && (
              <div className={`${statusInfo.color} text-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-top-4 duration-500 border-4 border-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-10"><statusInfo.icon size={120} /></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="bg-white/20 p-5 rounded-[2rem] backdrop-blur-md">
                    <statusInfo.icon size={48} strokeWidth={2.5} />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-4xl font-black tracking-tight mb-1">{statusInfo.label}</h2>
                    <p className="text-xl font-bold opacity-90">{statusInfo.message}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-200 shadow-xl relative">
              <div className="h-[450px] relative">
                <LiveMap 
                  lat={activeTrip.currentLat} 
                  lng={activeTrip.currentLng} 
                  coordinationSignal={activeTrip.coordinationSignal} 
                />
                
                {/* Floating Map Actions */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
                   <div className="flex gap-3">
                      <button 
                        onClick={() => setShowCoordinationMenu(!showCoordinationMenu)}
                        className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-white shadow-lg flex items-center gap-3 font-black text-xs uppercase tracking-widest text-slate-900 active:scale-95 transition-all"
                      >
                         <Edit3 size={18} className="text-indigo-600" />
                         Coordination
                      </button>
                   </div>
                   
                   {showCoordinationMenu && (
                     <div className="bg-white/90 backdrop-blur-md p-2 rounded-[2rem] border border-white shadow-2xl animate-in slide-in-from-bottom-2 flex gap-2">
                        <button 
                          onClick={() => setCoordinationSignal('PARENT_LATE')}
                          className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-tighter flex items-center justify-center gap-2 transition-all ${activeTrip.coordinationSignal === 'PARENT_LATE' ? 'bg-amber-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                          <Clock size={16} /> I'm Late
                        </button>
                        <button 
                          onClick={() => setCoordinationSignal('CHANGE_PICKUP')}
                          className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-tighter flex items-center justify-center gap-2 transition-all ${activeTrip.coordinationSignal === 'CHANGE_PICKUP' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                          <MapPin size={16} /> New Pickup
                        </button>
                     </div>
                   )}
                </div>
              </div>

              <div className="p-8 flex flex-col md:flex-row gap-8 items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-6">
                  <img src={currentChild.photo} className="w-20 h-28 rounded-2xl object-cover border-4 border-slate-50 shadow-xl" />
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{currentChild.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                       <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{activeTrip.status.replace(/_/g, ' ')}</span>
                       <p className="text-sm font-bold text-slate-400">ETA: {formatTime(activeTrip.estimatedArrival)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                   <button className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all">
                     <MessageSquare size={24} />
                   </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Your Guardian</h3>
              {currentDriver && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <img src={`https://i.pravatar.cc/150?u=${currentDriver.id}`} className="w-16 h-16 rounded-2xl border-4 border-slate-50 shadow-lg" />
                    <div>
                      <p className="font-black text-xl text-slate-900">{currentDriver.name}</p>
                      <p className="text-xs font-bold text-slate-400">{currentDriver.vehicle} • {currentDriver.plate}</p>
                    </div>
                  </div>
                  <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg">
                    <Phone size={20} />
                    {activeTrip.status === TripStatus.ARRIVED_AT_PICKUP ? 'Call Driver (Outside)' : 'Call Driver'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors pointer-events-none" />
               <div className="flex items-center gap-3 mb-4">
                 <Smartphone size={24} className="text-indigo-200" />
                 <h4 className="font-black text-lg">Guardian Status</h4>
               </div>
               <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                 You are currently monitoring {myChildren.length} registered child{myChildren.length !== 1 ? 'ren' : ''}.
               </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm text-center">
           <div className="bg-indigo-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-indigo-600">
             {myChildren.length === 0 ? <Plus size={40} /> : <Clock size={40} />}
           </div>
           <h2 className="text-3xl font-black text-slate-900 mb-2">
             {myChildren.length === 0 ? 'Welcome to Acik' : 'No Active Rides'}
           </h2>
           <p className="text-slate-500 font-medium mb-8">
             {myChildren.length === 0 
               ? 'Register your children to start using the safe mobility network.' 
               : 'Schedule your next school transport with a verified guardian.'}
           </p>
           <button className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
             {myChildren.length === 0 ? 'Add First Child' : 'Book New Ride'}
           </button>
        </div>
      )}
      
      <section className="mt-12">
        <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Your Registered Passengers</h2>
        {myChildren.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {myChildren.map(c => (
              <div key={c.id} className="bg-white p-4 rounded-3xl border border-slate-100 text-center flex flex-col items-center group hover:border-indigo-600 transition-colors">
                  <img src={c.photo} className="w-16 h-20 rounded-xl object-cover mb-3 shadow-md border-2 border-white group-hover:scale-105 transition-transform" />
                  <p className="font-black text-slate-900 text-xs">{c.name}</p>
                  <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase truncate w-full px-2">{c.school}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 italic text-sm font-bold">No children registered yet.</p>
        )}
      </section>
    </div>
  );
};

export default ParentView;
