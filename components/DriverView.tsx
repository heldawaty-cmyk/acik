
import React, { useState, useMemo } from 'react';
import { Trip, TripStatus, Child, User } from '../types';
import { MOCK_DRIVERS } from '../constants';
import { Navigation, CheckCircle2, UserCheck, DollarSign, ArrowRight, Truck, UserMinus, Clock, MapPin, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import LiveMap from './LiveMap';

interface DriverViewProps {
  user: User;
  trips: Trip[];
  childrenList: Child[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

const DriverView: React.FC<DriverViewProps> = ({ user, trips, childrenList, setTrips }) => {
  // Use current user as the driver for this view
  const activeTrip = useMemo(() => trips.find(t => 
    t.driverId === user.id && 
    t.status !== TripStatus.COMPLETED && 
    t.status !== TripStatus.CANCELLED &&
    t.status !== TripStatus.MATCHING
  ), [trips, user.id]);

  // Find incoming requests for this driver
  const incomingRequest = useMemo(() => trips.find(t => 
    t.driverId === user.id && 
    t.status === TripStatus.MATCHING
  ), [trips, user.id]);
  
  const currentChild = activeTrip ? childrenList.find(c => c.id === activeTrip.childId) : null;
  const requestChild = incomingRequest ? childrenList.find(c => c.id === incomingRequest.childId) : null;

  const [earnings, setEarnings] = useState({ today: 45.00, week: 320.50 });
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const handleStatusUpdate = () => {
    if (!activeTrip) return;
    
    const workflow: Record<TripStatus, TripStatus | null> = {
      [TripStatus.EN_ROUTE_TO_PICKUP]: TripStatus.ARRIVED_AT_PICKUP,
      [TripStatus.ARRIVED_AT_PICKUP]: null, // Trigger ID Modal
      [TripStatus.CHECKED_IN]: TripStatus.PICKED_UP,
      [TripStatus.PICKED_UP]: TripStatus.IN_PROGRESS,
      [TripStatus.IN_PROGRESS]: TripStatus.COMPLETED,
      [TripStatus.MATCHING]: null,
      [TripStatus.COMPLETED]: null,
      [TripStatus.CANCELLED]: null,
      [TripStatus.SCHEDULED]: null,
    };

    if (activeTrip.status === TripStatus.ARRIVED_AT_PICKUP) {
      setShowCheckInModal(true);
      return;
    }

    const nextStatus = workflow[activeTrip.status];
    if (nextStatus) {
      setTrips(prev => prev.map(t => t.id === activeTrip.id ? { ...t, status: nextStatus, lastUpdated: new Date().toISOString() } : t));
    }
  };

  const handleAcceptRequest = () => {
    if (!incomingRequest) return;
    setTrips(prev => prev.map(t => t.id === incomingRequest.id ? { 
      ...t, 
      status: TripStatus.EN_ROUTE_TO_PICKUP, 
      lastUpdated: new Date().toISOString() 
    } : t));
  };

  const handleRejectRequest = (reason: string) => {
    if (!incomingRequest) return;
    // In a real app, this would send the reason to the backend to improve matching logic
    console.log(`Trip rejected. Reason: ${reason}`);
    setTrips(prev => prev.map(t => t.id === incomingRequest.id ? { 
      ...t, 
      driverId: undefined, // Unassign driver
      status: TripStatus.MATCHING // Put back to matching pool
    } : t));
    setRejectionReason(null);
  };

  const toggleCoordinationSignal = (signal: 'CHILD_NOT_FOUND' | 'DRIVER_WAITING' | 'TRAFFIC_DELAY') => {
    if (!activeTrip) return;
    setTrips(prev => prev.map(t => t.id === activeTrip.id ? { 
      ...t, 
      coordinationSignal: t.coordinationSignal === signal ? undefined : signal 
    } : t));
  };

  const confirmCheckIn = () => {
    if (activeTrip) {
      setTrips(prev => prev.map(t => t.id === activeTrip.id ? { ...t, status: TripStatus.CHECKED_IN, lastUpdated: new Date().toISOString() } : t));
      setShowCheckInModal(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Driver Portal</h1>
          <p className="text-slate-500 font-medium">{user.name} • {user.verificationStatus === 'APPROVED' ? 'Active' : 'Awaiting Review'}</p>
        </div>
        <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl flex items-center gap-4 shadow-lg shadow-emerald-100">
           <DollarSign size={20} />
           <p className="font-black text-xl">${earnings.today.toFixed(2)}</p>
        </div>
      </header>

      {/* Incoming Request Notification */}
      {incomingRequest && requestChild && !rejectionReason && (
        <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl animate-in zoom-in-95 duration-500 border-4 border-white/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10">
            <Truck size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 p-2 rounded-lg animate-pulse">
                <Clock size={20} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest">New Ride Request</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-10 items-center mb-10">
              <img src={requestChild.photo} className="w-24 h-32 rounded-2xl border-4 border-white/30 shadow-xl object-cover" />
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-4xl font-black mb-1">{requestChild.name}</h3>
                  <p className="text-indigo-200 font-bold uppercase tracking-widest text-sm">Guardian: {requestChild.parentId}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                    <p className="text-[10px] font-black text-indigo-200 uppercase mb-1 tracking-widest">Pickup From</p>
                    <p className="font-bold text-lg flex items-center gap-2"><MapPin size={16}/> {requestChild.pickupAddress}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                    <p className="text-[10px] font-black text-indigo-200 uppercase mb-1 tracking-widest">Destination</p>
                    <p className="font-bold text-lg flex items-center gap-2"><Navigation size={16}/> {requestChild.school}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setRejectionReason('pending')}
                className="flex-1 py-5 rounded-2xl font-black text-lg uppercase tracking-widest bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-3"
              >
                <XCircle size={24} /> Reject
              </button>
              <button 
                onClick={handleAcceptRequest}
                className="flex-1 py-5 rounded-2xl font-black text-lg uppercase tracking-widest bg-white text-indigo-600 shadow-xl shadow-indigo-900/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <CheckCircle size={24} /> Accept Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionReason && (
        <div className="bg-white rounded-[3rem] p-10 border-2 border-slate-100 shadow-xl animate-in slide-in-from-bottom-4">
           <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><XCircle size={24}/></div>
              <h2 className="text-2xl font-black text-slate-900">Decline Request?</h2>
           </div>
           <p className="text-slate-500 font-medium mb-6">Select a reason to help our matching engine find a better guardian for this child.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {['Too far from location', 'Heavy traffic zone', 'Ending my shift', 'Vehicle maintenance', 'Personal emergency'].map(reason => (
                <button 
                  key={reason}
                  onClick={() => handleRejectRequest(reason)}
                  className="p-4 text-left bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all text-sm"
                >
                  {reason}
                </button>
              ))}
           </div>
           
           <button 
             onClick={() => setRejectionReason(null)}
             className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-widest"
           >
             Go back
           </button>
        </div>
      )}

      {activeTrip && currentChild ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-xl">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Active Mission</h3>
                 {activeTrip.coordinationSignal === 'PARENT_LATE' && (
                    <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-amber-200 animate-pulse">
                      Parent is running late
                    </span>
                 )}
               </div>
               <div className="p-10 space-y-10">
                  <div className="flex flex-col md:flex-row gap-10 items-center">
                    <img src={currentChild.photo} className="w-24 h-32 rounded-2xl border-4 border-slate-100 shadow-xl object-cover" />
                    <div className="text-center md:text-left">
                       <h2 className="text-4xl font-black text-slate-900 mb-1">{currentChild.name}</h2>
                       <p className="text-indigo-600 font-black uppercase tracking-widest text-sm">{activeTrip.status.replace(/_/g, ' ')}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Destination</p>
                     <p className="text-lg font-bold text-slate-900">{currentChild.school}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <button onClick={handleStatusUpdate} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-4 transition-transform active:scale-95">
                      {activeTrip.status === TripStatus.EN_ROUTE_TO_PICKUP && <><ArrowRight /> Arrived</>}
                      {activeTrip.status === TripStatus.ARRIVED_AT_PICKUP && <><UserCheck /> Verify ID</>}
                      {activeTrip.status === TripStatus.CHECKED_IN && <><Navigation /> Boarding Complete</>}
                      {activeTrip.status === TripStatus.PICKED_UP && <><Navigation /> Start Driving</>}
                      {activeTrip.status === TripStatus.IN_PROGRESS && <><CheckCircle2 /> Drop-off Confirmed</>}
                    </button>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                       <button 
                         onClick={() => toggleCoordinationSignal('DRIVER_WAITING')}
                         className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${activeTrip.coordinationSignal === 'DRIVER_WAITING' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                       >
                         <MapPin size={16} /> Waiting
                       </button>
                       <button 
                         onClick={() => toggleCoordinationSignal('TRAFFIC_DELAY')}
                         className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${activeTrip.coordinationSignal === 'TRAFFIC_DELAY' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                       >
                         <AlertTriangle size={16} /> Traffic
                       </button>
                       <button 
                         onClick={() => toggleCoordinationSignal('CHILD_NOT_FOUND')}
                         className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border col-span-2 md:col-span-1 ${activeTrip.coordinationSignal === 'CHILD_NOT_FOUND' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-100 hover:bg-red-50'}`}
                       >
                         <UserMinus size={16} /> No Child
                       </button>
                    </div>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-900 text-lg mb-6 tracking-tight">Active Map</h3>
                <div className="h-64 rounded-2xl overflow-hidden border border-slate-100">
                  <LiveMap 
                    lat={activeTrip.currentLat} 
                    lng={activeTrip.currentLng} 
                    coordinationSignal={activeTrip.coordinationSignal}
                  />
                </div>
                <div className="mt-6 flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                   <span>GPS Sync: Stable</span>
                   <span className="text-indigo-600">Updated Now</span>
                </div>
             </div>
          </div>
        </div>
      ) : (
        !incomingRequest && (
          <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center opacity-60">
             <Truck className="mx-auto text-slate-300 w-16 h-16 mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for transport missions</p>
          </div>
        )
      )}

      {/* Verification Modal */}
      {showCheckInModal && currentChild && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCheckInModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">Safety Match</h2>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-5 mb-8">
               <img src={currentChild.photo} className="w-32 h-40 rounded-lg shadow-xl object-cover border-4 border-white" />
               <div className="text-center">
                  <p className="font-black text-xl text-slate-900">{currentChild.name}</p>
                  <p className="text-[10px] font-black text-indigo-600 uppercase">Match Passport Portrait</p>
               </div>
            </div>
            <button onClick={confirmCheckIn} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-700">
              Confirm Identity & Start
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverView;
