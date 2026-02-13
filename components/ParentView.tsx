
import React, { useState, useMemo, useEffect } from 'react';
import { Child, Trip, TripStatus, User } from '../types';
import { MOCK_DRIVERS, SCHOOLS_LIST } from '../constants';
import { generateSmartReply } from '../services/geminiService';
import { 
  MapPin, Clock, Phone, MessageSquare, 
  ShieldCheck, Bell, AlertCircle, Siren, AlertTriangle, Navigation, WifiOff, CheckCircle, Smartphone, Plus, Edit3, X, Calendar, ArrowRight, Truck,
  Search, Key, Zap
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
  }>({
    childId: myChildren[0]?.id || '',
    type: 'ADHOC',
    time: '07:30'
  });

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
    alert("EMERGENCY: SOS Triggered. Dispatching nearest unit and alerting school admin.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Acik Parent</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-tight">Guardian: {user.name}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsBookingModalOpen(true)}
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
              <button onClick={triggerSOS} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-red-200">Confirm SOS</button>
            </div>
          )}
        </div>
      </header>

      {pendingTrip && !activeTrip && (
        <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
           <div className="absolute -right-10 -top-10 opacity-10"><Truck size={200} /></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="w-20 h-20 rounded-[2rem] bg-indigo-500 flex items-center justify-center animate-pulse">
                 <Search size={40} className="text-white" />
              </div>
              <div>
                 <h2 className="text-3xl font-black mb-1">Matching Guardian</h2>
                 <p className="text-slate-400 font-medium">Scanning for the nearest vetted transporter...</p>
              </div>
           </div>
        </div>
      )}

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

            {/* Smart Replies Bar */}
            {smartReplies.length > 0 && (
               <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                  <div className="flex items-center gap-2 bg-indigo-50 px-4 rounded-2xl mr-2">
                     <Zap size={14} className="text-indigo-600 fill-indigo-600" />
                     <span className="text-[10px] font-black uppercase text-indigo-600">Smart Replies</span>
                  </div>
                  {smartReplies.map((reply, i) => (
                    <button 
                      key={i} 
                      className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-xs font-black text-slate-700 whitespace-nowrap shadow-sm hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95"
                    >
                      {reply}
                    </button>
                  ))}
               </div>
            )}

            <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-200 shadow-xl relative">
              <div className="h-[450px] relative">
                <LiveMap 
                  lat={activeTrip.currentLat} 
                  lng={activeTrip.currentLng} 
                  coordinationSignal={activeTrip.coordinationSignal} 
                />
                
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
                 <ShieldCheck size={24} className="text-indigo-200" />
                 <h4 className="font-black text-lg">Safety Vault</h4>
               </div>
               <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                 Every ride is monitored by our dispatch center. For assistance, use the SOS button.
               </p>
            </div>
          </div>
        </div>
      ) : (
        !pendingTrip && (
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
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              {myChildren.length === 0 ? 'Add First Child' : 'Book New Ride'}
            </button>
          </div>
        )
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

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
                 <div>
                    <h2 className="text-3xl font-black tracking-tight">New Booking</h2>
                    <p className="text-slate-400 font-medium uppercase text-[10px] tracking-widest mt-1">Guardian Mobility Service</p>
                 </div>
                 <button onClick={() => setIsBookingModalOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <div className="p-10 space-y-8">
                {bookingStep === 1 ? (
                  <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Passenger</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {myChildren.map(child => (
                          <button 
                            key={child.id}
                            onClick={() => setNewBooking({...newBooking, childId: child.id})}
                            className={`p-4 rounded-[2rem] border-2 transition-all text-center flex flex-col items-center group ${newBooking.childId === child.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                          >
                            <img src={child.photo} className="w-12 h-16 rounded-xl object-cover mb-2 border-2 border-white shadow-sm group-hover:scale-105 transition-transform" />
                            <p className="font-black text-xs text-slate-900 truncate w-full">{child.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Frequency</h3>
                       <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => setNewBooking({...newBooking, type: 'ADHOC'})}
                            className={`p-6 rounded-[2rem] border-2 text-left transition-all ${newBooking.type === 'ADHOC' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                          >
                             <Calendar className={`mb-3 ${newBooking.type === 'ADHOC' ? 'text-indigo-600' : 'text-slate-400'}`} />
                             <p className="font-black text-slate-900">One-off</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Single Mission</p>
                          </button>
                          <button 
                            onClick={() => setNewBooking({...newBooking, type: 'DAILY'})}
                            className={`p-6 rounded-[2rem] border-2 text-left transition-all ${newBooking.type === 'DAILY' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                          >
                             <Clock className={`mb-3 ${newBooking.type === 'DAILY' ? 'text-indigo-600' : 'text-slate-400'}`} />
                             <p className="font-black text-slate-900">Recurring</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Daily Routine</p>
                          </button>
                       </div>
                    </div>

                    <button 
                      onClick={() => setBookingStep(2)}
                      className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
                    >
                      Continue <ArrowRight size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-4">
                       <div className="flex items-center gap-3">
                          <MapPin size={20} className="text-indigo-600" />
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase">Pickup</p>
                             <p className="text-sm font-black text-slate-900">{user.homeAddress || 'Your Registered Home'}</p>
                          </div>
                       </div>
                       <div className="h-4 w-px bg-slate-200 ml-2" />
                       <div className="flex items-center gap-3">
                          <Navigation size={20} className="text-emerald-600" />
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase">Destination</p>
                             <p className="text-sm font-black text-slate-900">{myChildren.find(c => c.id === newBooking.childId)?.school}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Pickup Time</label>
                       <input 
                         type="time" 
                         value={newBooking.time}
                         onChange={e => setNewBooking({...newBooking, time: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-2xl outline-none focus:border-indigo-600 transition-all text-center"
                       />
                    </div>

                    <div className="flex gap-3">
                       <button onClick={() => setBookingStep(1)} className="flex-1 py-5 rounded-2xl font-black text-sm uppercase text-slate-400 hover:bg-slate-50 transition-colors">Go Back</button>
                       <button 
                         onClick={handleCreateBooking}
                         className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all"
                       >
                         Initiate Match
                       </button>
                    </div>
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
