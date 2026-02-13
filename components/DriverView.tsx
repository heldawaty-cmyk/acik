
import React, { useState, useMemo } from 'react';
import { Trip, TripStatus, Child, User } from '../types';
import { MOCK_DRIVERS } from '../constants';
import { Navigation, CheckCircle2, UserCheck, DollarSign, ArrowRight, Truck, UserMinus, Clock, MapPin, AlertTriangle, XCircle, CheckCircle, MessageSquare, Key } from 'lucide-react';
import LiveMap from './LiveMap';

interface DriverViewProps {
  user: User;
  trips: Trip[];
  childrenList: Child[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

const DriverView: React.FC<DriverViewProps> = ({ user, trips, childrenList, setTrips }) => {
  const activeTrip = useMemo(() => trips.find(t => 
    t.driverId === user.id && 
    t.status !== TripStatus.COMPLETED && 
    t.status !== TripStatus.CANCELLED &&
    t.status !== TripStatus.MATCHING
  ), [trips, user.id]);

  const incomingRequest = useMemo(() => trips.find(t => 
    t.driverId === user.id && 
    t.status === TripStatus.MATCHING
  ), [trips, user.id]);
  
  const currentChild = activeTrip ? childrenList.find(c => c.id === activeTrip.childId) : null;
  const requestChild = incomingRequest ? childrenList.find(c => c.id === incomingRequest.childId) : null;

  const [earnings, setEarnings] = useState({ today: 45.00, week: 320.50 });
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const REJECTION_REASONS = [
    'Too far from current location',
    'Heavy traffic in zone',
    'Ending shift soon',
    'Vehicle maintenance required',
    'Emergency break',
    'Safety concerns in area'
  ];

  const handleStatusUpdate = () => {
    if (!activeTrip) return;
    
    const workflow: Record<TripStatus, TripStatus | null> = {
      [TripStatus.EN_ROUTE_TO_PICKUP]: TripStatus.ARRIVED_AT_PICKUP,
      [TripStatus.ARRIVED_AT_PICKUP]: null, 
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
    const finalReason = reason === 'OTHER' ? customReason : reason;
    
    setTrips(prev => prev.map(t => t.id === incomingRequest.id ? { 
      ...t, 
      driverId: undefined, 
      status: TripStatus.MATCHING, 
      rejectionReason: finalReason 
    } : t));
    
    setShowRejectionModal(false);
    setCustomReason('');
  };

  const confirmCheckIn = () => {
    if (!activeTrip) return;
    
    if (enteredPin === activeTrip.verificationPin) {
      setTrips(prev => prev.map(t => t.id === activeTrip.id ? { ...t, status: TripStatus.CHECKED_IN, lastUpdated: new Date().toISOString() } : t));
      setShowCheckInModal(false);
      setEnteredPin('');
      setPinError(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Driver Portal</h1>
          <p className="text-slate-500 font-medium">{user.name} • Active</p>
        </div>
        <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl flex items-center gap-4 shadow-lg shadow-emerald-100">
           <DollarSign size={20} />
           <p className="font-black text-xl">${earnings.today.toFixed(2)}</p>
        </div>
      </header>

      {incomingRequest && requestChild && !showRejectionModal && (
        <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl animate-in zoom-in-95 duration-500 border-4 border-white/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10"><Truck size={200} /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 p-2 rounded-lg animate-pulse"><Clock size={20} /></div>
              <h2 className="text-xl font-black uppercase tracking-widest">New Ride Request</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-10 items-center mb-10">
              <img src={requestChild.photo} className="w-24 h-32 rounded-2xl border-4 border-white/30 shadow-xl object-cover" />
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-4xl font-black mb-1">{requestChild.name}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-indigo-200 uppercase mb-1 tracking-widest">Pickup From</p>
                    <p className="font-bold text-lg">{requestChild.pickupAddress}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-indigo-200 uppercase mb-1 tracking-widest">Destination</p>
                    <p className="font-bold text-lg">{requestChild.school}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setShowRejectionModal(true)} className="flex-1 py-5 rounded-2xl font-black text-lg uppercase bg-white/10">Reject</button>
              <button onClick={handleAcceptRequest} className="flex-1 py-5 rounded-2xl font-black text-lg uppercase bg-white text-indigo-600">Accept Ride</button>
            </div>
          </div>
        </div>
      )}

      {showRejectionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-lg">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="flex items-center gap-4 mb-8 text-red-600">
               <XCircle size={32} />
               <h2 className="text-2xl font-black tracking-tight">Decline Request?</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
               {REJECTION_REASONS.map(reason => (
                 <button key={reason} onClick={() => handleRejectRequest(reason)} className="p-4 text-left bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 text-sm">{reason}</button>
               ))}
             </div>
             <button onClick={() => setShowRejectionModal(false)} className="w-full py-4 text-slate-400 font-black uppercase text-xs">Cancel</button>
          </div>
        </div>
      )}

      {activeTrip && currentChild ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-xl">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Active Mission</h3>
               </div>
               <div className="p-10 space-y-10">
                  <div className="flex flex-col md:flex-row gap-10 items-center">
                    <img src={currentChild.photo} className="w-24 h-32 rounded-2xl border-4 border-slate-100 shadow-xl object-cover" />
                    <div className="text-center md:text-left">
                       <h2 className="text-4xl font-black text-slate-900 mb-1">{currentChild.name}</h2>
                       <p className="text-indigo-600 font-black uppercase tracking-widest text-sm">{activeTrip.status.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <button onClick={handleStatusUpdate} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-4 active:scale-95">
                      {activeTrip.status === TripStatus.EN_ROUTE_TO_PICKUP && <><ArrowRight /> Arrived</>}
                      {activeTrip.status === TripStatus.ARRIVED_AT_PICKUP && <><UserCheck /> Verify PIN</>}
                      {activeTrip.status === TripStatus.CHECKED_IN && <><Navigation /> Boarding Complete</>}
                      {activeTrip.status === TripStatus.PICKED_UP && <><Navigation /> Start Driving</>}
                      {activeTrip.status === TripStatus.IN_PROGRESS && <><CheckCircle2 /> Drop-off Confirmed</>}
                    </button>
                  </div>
               </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-900 text-lg mb-6 tracking-tight">Map</h3>
                <div className="h-64 rounded-2xl overflow-hidden border border-slate-100">
                  <LiveMap lat={activeTrip.currentLat} lng={activeTrip.currentLng} />
                </div>
             </div>
          </div>
        </div>
      ) : (
        !incomingRequest && (
          <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center opacity-60">
             <Truck className="mx-auto text-slate-300 w-16 h-16 mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for missions</p>
          </div>
        )
      )}

      {showCheckInModal && currentChild && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">Enter 4-Digit PIN</h2>
            <p className="text-center text-slate-500 text-sm mb-8 font-medium">Ask the parent or child for the verification code.</p>
            
            <div className="flex flex-col items-center gap-6 mb-8">
               <div className="relative">
                 <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                 <input 
                   type="text" 
                   maxLength={4}
                   value={enteredPin}
                   onChange={e => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                   className={`w-48 pl-16 pr-6 py-6 bg-slate-50 border-4 rounded-3xl font-black text-4xl tracking-[0.4em] outline-none transition-all ${pinError ? 'border-red-500 bg-red-50 animate-shake' : 'border-slate-100 focus:border-indigo-600'}`}
                   placeholder="----"
                 />
               </div>
               {pinError && <p className="text-red-500 font-black text-xs uppercase animate-in slide-in-from-top-2">Incorrect PIN. Try again.</p>}
            </div>

            <button 
              onClick={confirmCheckIn} 
              disabled={enteredPin.length < 4}
              className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-700 disabled:opacity-30"
            >
              Verify & Start Trip
            </button>
            <button onClick={() => {setShowCheckInModal(false); setEnteredPin('');}} className="w-full mt-4 py-2 text-slate-400 font-bold text-xs uppercase">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverView;
