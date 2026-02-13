
import React, { useState, useMemo, useEffect } from 'react';
import { Child, Trip, TripStatus, User } from '../types';
import { MOCK_DRIVERS, SCHOOLS_LIST } from '../constants';
import { generateSmartReply } from '../services/geminiService';
import { 
  MapPin, Clock, Phone, MessageSquare, 
  ShieldCheck, Bell, AlertCircle, Siren, AlertTriangle, Navigation, WifiOff, CheckCircle, Smartphone, Plus, Edit3, X, Calendar, ArrowRight, Truck,
  Search, Key, Zap, Map as MapIcon, ChevronDown
} from 'lucide-react';
import LiveMap from './LiveMap';

interface ParentViewProps {
  user: User;
  trips: Trip[];
  childrenList: Child[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

const ParentView: React.FC<ParentViewProps> = ({ user, trips, childrenList, setTrips }) => {
  const myChildren = useMemo(() => childrenList.filter(c => c.parentId === user.id), [childrenList, user.id]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [sosStage, setSosStage] = useState<'IDLE' | 'CONFIRMING'>('IDLE');
  const [showCoordinationMenu, setShowCoordinationMenu] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  
  // New Booking State
  const [bookingStep, setBookingStep] = useState(1);
  const [newBooking, setNewBooking] = useState<{
    childId: string;
    type: 'DAILY' | 'ADHOC';
    time: string;
    pickup: string;
    destination: string;
  }>({
    childId: myChildren[0]?.id || '',
    type: 'ADHOC',
    time: '07:30',
    pickup: user.homeAddress || 'My Home Address',
    destination: ''
  });

  // Effect to update destination default when child changes
  useEffect(() => {
    const selectedChild = myChildren.find(c => c.id === newBooking.childId);
    if (selectedChild) {
      setNewBooking(prev => ({ ...prev, destination: selectedChild.school }));
    }
  }, [newBooking.childId, myChildren]);

  const activeTrip = useMemo(() => trips.find(t => 
    myChildren.some(c => c.id === t.childId) &&
    t.status !== TripStatus.COMPLETED && 
    t.status !== TripStatus.MATCHING && 
    t.status !== TripStatus.CANCELLED
  ), [trips, myChildren]);

  const pendingTrip = useMemo(() => trips.find(t => 
    myChildren.some(c => c.id === t.childId) &&
    t.status === TripStatus.MATCHING
  ), [trips, myChildren]);
  
  const currentChild = activeTrip ? myChildren.find(c => c.id === activeTrip.childId) : null;
  const currentDriver = activeTrip ? MOCK_DRIVERS.find(d => d.id === activeTrip.driverId) : null;

  // AI Smart Replies Effect
  useEffect(() => {
    if (activeTrip && currentChild) {
      generateSmartReply(activeTrip, currentChild.name).then(setSmartReplies);
    } else {
      setSmartReplies([]);
    }
  }, [activeTrip?.status, activeTrip?.coordinationSignal, currentChild?.name]);

  const formatTime = (iso: string | undefined) => {
    if (!iso) return "--:--";
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRelativeMins = (iso: string | undefined) => {
    if (!iso) return 0;
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.round(diff / 60000));
  };

  const handleCreateBooking = () => {
    const child = myChildren.find(c => c.id === newBooking.childId);
    if (!child) return;

    const trip: Trip = {
      id: `T_REQ_${Math.random().toString(36).substr(2, 9)}`,
      childId: child.id,
      status: TripStatus.MATCHING,
      startTime: new Date().toISOString(),
      currentLat: 3.1390,
      currentLng: 101.6869,
      routeDeviation: false,
      alerts: [],
      isRecurring: newBooking.type === 'DAILY',
      frequency: newBooking.type === 'DAILY' ? 'DAILY' : 'ADHOC',
      trackingHealth: 'OPTIMAL',
      driverLocationAuthorized: true,
      lastUpdated: new Date().toISOString(),
      verificationPin: Math.floor(1000 + Math.random() * 9000).toString()
    };

    setTrips(prev => [trip, ...prev]);
    setIsBookingModalOpen(false);
    setBookingStep(1);
    
    // Automatic match after simulation
    setTimeout(() => {
      setTrips(current => current.map(t => {
        if (t.id === trip.id) {
          const availableDriver = MOCK_DRIVERS[0];
          return {
            ...t,
            driverId: availableDriver.id,
            status: TripStatus.EN_ROUTE_TO_PICKUP,
            estimatedArrival: new Date(Date.now() + 12 * 60000).toISOString()
          };
        }
        return t;
      }));
    }, 5000);
  };

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

    switch (activeTrip.status) {
      case TripStatus.EN_ROUTE_TO_PICKUP:
        return { label: 'SAFE', message: minsLeft <= 2 ? 'Driver is turning into your street' : `Driver arriving in ${minsLeft} min`, color: 'bg-emerald-600', icon: ShieldCheck };
      case TripStatus.ARRIVED_AT_PICKUP:
        return { label: 'SAFE', message: 'Provide PIN to driver for boarding', color: 'bg-indigo-600', icon: Key };
      case TripStatus.CHECKED_IN:
        return { label: 'SAFE', message: `${currentChild.name} identity verified. boarding...`, color: 'bg-indigo-600', icon: CheckCircle };
      case TripStatus.PICKED_UP:
        return { label: 'SAFE', message: `${currentChild.name} is safely in the vehicle`, color: 'bg-emerald-600', icon: ShieldCheck };
      case TripStatus.IN_PROGRESS:
        return { label: 'SAFE', message: `En route to ${currentChild.school}`, color: 'bg-emerald-600', icon: Navigation };
      default:
        return { label: 'SAFE', message: 'Active Monitoring Enabled', color: 'bg-emerald-600', icon: ShieldCheck };
    }
  }, [activeTrip, currentChild]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Acik Parent</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-tight">Guardian: {user.name}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setIsBookingModalOpen(true); setBookingStep(1); }}
            className="p-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Plus size={18} /> New Ride
          </button>
          {sosStage === 'IDLE' ? (
            <button onClick={() => setSosStage('CONFIRMING')} className="p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-black text-xs uppercase flex items-center gap-2">
              <Siren size={18} /> SOS
            </button>
          ) : (
            <div className="flex gap-2 animate-in slide-in-from-right-2">
              <button onClick={() => setSosStage('IDLE')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase">Cancel</button>
              <button onClick={() => alert('SOS NOTIFIED')} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-red-200">Confirm SOS</button>
            </div>
          )}
        </div>
      </header>

      {/* Matching Screen */}
      {pendingTrip && !activeTrip && (
        <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden text-center">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent animate-pulse" />
           <div className="relative z-10 space-y-8">
              <div className="relative inline-block">
                 <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20" />
                 <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center relative z-10 mx-auto">
                    <Search size={44} className="text-white" />
                 </div>
              </div>
              <div>
                 <h2 className="text-3xl font-black mb-2">Finding Your Guardian</h2>
                 <p className="text-slate-400 font-medium">Scanning for vetted transporters in your local zone...</p>
              </div>
           </div>
        </div>
      )}

      {activeTrip && currentChild ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {statusInfo && (
              <div className={`${statusInfo.color} text-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border-4 border-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-10"><statusInfo.icon size={120} /></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="bg-white/20 p-5 rounded-[2rem] backdrop-blur-md">
                    <statusInfo.icon size={48} strokeWidth={2.5} />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-4xl font-black tracking-tight mb-1">{statusInfo.label}</h2>
                    <p className="text-xl font-bold opacity-90">{statusInfo.message}</p>
                    {activeTrip.status === TripStatus.ARRIVED_AT_PICKUP && (
                       <div className="mt-4 inline-flex items-center gap-4 bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                          <p className="text-xs font-black uppercase tracking-widest text-indigo-100">Verification PIN</p>
                          <p className="text-3xl font-black tracking-[0.2em]">{activeTrip.verificationPin}</p>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {smartReplies.length > 0 && (
               <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                  <div className="flex items-center gap-2 bg-indigo-50 px-4 rounded-2xl mr-2">
                     <Zap size={14} className="text-indigo-600 fill-indigo-600" />
                     <span className="text-[10px] font-black uppercase text-indigo-600">Smart Replies</span>
                  </div>
                  {smartReplies.map((reply, i) => (
                    <button key={i} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-xs font-black text-slate-700 whitespace-nowrap shadow-sm hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95">{reply}</button>
                  ))}
               </div>
            )}

            <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-200 shadow-xl relative">
              <div className="h-[450px] relative">
                <LiveMap lat={activeTrip.currentLat} lng={activeTrip.currentLng} coordinationSignal={activeTrip.coordinationSignal} />
              </div>
              <div className="p-8 flex items-center justify-between border-t border-slate-100">
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
                <button className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all"><MessageSquare size={24} /></button>
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
                    <Phone size={20} /> Call Driver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        !pendingTrip && (
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm text-center">
            <div className="bg-indigo-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-indigo-600">
              {myChildren.length === 0 ? <Plus size={44} /> : <MapIcon size={44} />}
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">No Active Missions</h2>
            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Your children are currently offline. Schedule a ride to activate live tracking.</p>
            <button onClick={() => { setIsBookingModalOpen(true); setBookingStep(1); }} className="bg-indigo-600 text-white px-12 py-5 rounded-3xl font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Book New Ride</button>
          </div>
        )
      )}

      {/* FIXED BOOKING MODAL WITH DROPDOWNS */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-hidden">
           <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center flex-shrink-0">
                 <div>
                    <h2 className="text-2xl font-black tracking-tight">New Booking</h2>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Acik Network Protocol</p>
                 </div>
                 <button onClick={() => setIsBookingModalOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"><X size={24} /></button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto no-scrollbar flex-grow">
                {bookingStep === 1 ? (
                  <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Select Passenger</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {myChildren.map(child => (
                          <button key={child.id} onClick={() => setNewBooking({...newBooking, childId: child.id})} className={`p-5 rounded-[2.5rem] border-4 transition-all text-center flex flex-col items-center group ${newBooking.childId === child.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}>
                            <div className="w-16 h-20 rounded-2xl bg-slate-200 overflow-hidden mb-3 shadow-md border-2 border-white group-hover:scale-105 transition-transform">
                               <img src={child.photo} className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${child.name}&background=6366f1&color=fff&size=128` }} />
                            </div>
                            <p className="font-black text-xs text-slate-900 truncate w-full">{child.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Frequency</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => setNewBooking({...newBooking, type: 'ADHOC'})} className={`p-8 rounded-[2.5rem] border-4 text-left transition-all ${newBooking.type === 'ADHOC' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}>
                             <Calendar className={`mb-4 ${newBooking.type === 'ADHOC' ? 'text-indigo-600' : 'text-slate-400'}`} size={28} />
                             <p className="font-black text-slate-900">One-off</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Single Mission</p>
                          </button>
                          <button onClick={() => setNewBooking({...newBooking, type: 'DAILY'})} className={`p-8 rounded-[2.5rem] border-4 text-left transition-all ${newBooking.type === 'DAILY' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}>
                             <Clock className={`mb-4 ${newBooking.type === 'DAILY' ? 'text-indigo-600' : 'text-slate-400'}`} size={28} />
                             <p className="font-black text-slate-900">Recurring</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Daily Routine</p>
                          </button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in slide-in-from-right-4 pb-4">
                    {/* Pickup Selector */}
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pickup Location</label>
                       <div className="relative group">
                          <MapPin size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" />
                          <select 
                            value={newBooking.pickup}
                            onChange={(e) => setNewBooking({...newBooking, pickup: e.target.value})}
                            className="w-full pl-16 pr-10 py-5 bg-slate-50 border-4 border-slate-50 rounded-[2rem] font-black text-sm appearance-none outline-none focus:border-indigo-600 transition-all cursor-pointer"
                          >
                             <option value={user.homeAddress || "Home"}>Home: {user.homeAddress || "Bangsar"}</option>
                             <option value="Current GPS Location">Use Current Location</option>
                             <option value="Other / Custom">Specify Custom Location...</option>
                          </select>
                          <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                       </div>
                    </div>

                    {/* Destination Hub Dropdown */}
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Destination Hub</label>
                       <div className="relative group">
                          <Navigation size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                          <select 
                            value={newBooking.destination}
                            onChange={(e) => setNewBooking({...newBooking, destination: e.target.value})}
                            className="w-full pl-16 pr-10 py-5 bg-slate-50 border-4 border-slate-50 rounded-[2rem] font-black text-sm appearance-none outline-none focus:border-indigo-600 transition-all cursor-pointer"
                          >
                             <option value="">Select School / Activity Center</option>
                             {SCHOOLS_LIST.map(school => (
                               <option key={school} value={school}>{school}</option>
                             ))}
                          </select>
                          <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                       </div>
                    </div>

                    {/* Time Picker */}
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Departure Time</label>
                       <div className="relative">
                          <Clock size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="time" 
                            value={newBooking.time} 
                            onChange={e => setNewBooking({...newBooking, time: e.target.value})} 
                            className="w-full pl-16 pr-6 py-5 bg-slate-50 border-4 border-slate-50 rounded-[2rem] font-black text-2xl outline-none focus:border-indigo-600 transition-all text-center" 
                          />
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-white border-t border-slate-50 flex-shrink-0">
                {bookingStep === 1 ? (
                  <button onClick={() => setBookingStep(2)} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4">
                    Continue <ArrowRight size={24} />
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button onClick={() => setBookingStep(1)} className="flex-1 py-6 rounded-3xl font-black text-sm uppercase text-slate-400 hover:bg-slate-50 transition-all">Back</button>
                    <button 
                      onClick={handleCreateBooking} 
                      disabled={!newBooking.destination}
                      className="flex-[2] bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600"
                    >
                      Initiate Matching
                    </button>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ParentView;
