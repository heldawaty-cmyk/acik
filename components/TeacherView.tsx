
import React, { useState, useMemo } from 'react';
import { Trip, TripStatus, User, Child } from '../types';
import { MOCK_DRIVERS } from '../constants';
import { Siren, GraduationCap, Map as MapIcon, UserCheck, CheckCircle, Clock, Search, Navigation } from 'lucide-react';
import LiveMap from './LiveMap';

interface TeacherViewProps {
  user: User;
  trips: Trip[];
  childrenList: Child[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

const TeacherView: React.FC<TeacherViewProps> = ({ user, trips, childrenList, setTrips }) => {
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'ROSTER' | 'MAP'>('MAP');
  const [searchTerm, setSearchTerm] = useState('');

  const schoolName = user.schoolId || 'Bangsar Hub';

  // Filter students based on teacher's school
  const schoolStudents = useMemo(() => 
    childrenList.filter(c => c.school.includes(schoolName)), 
    [childrenList, schoolName]
  );

  // Filter trips destined for this school
  const activeTrips = useMemo(() => 
    trips.filter(t => {
      const student = childrenList.find(c => c.id === t.childId);
      return student && student.school.includes(schoolName) && t.status !== TripStatus.COMPLETED && t.status !== TripStatus.MATCHING;
    }),
    [trips, childrenList, schoolName]
  );

  const handleStudentReceived = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    const student = childrenList.find(c => c.id === trip?.childId);
    
    setTrips(prev => prev.map(t => t.id === tripId ? { 
      ...t, 
      status: TripStatus.COMPLETED, 
      coordinationSignal: 'TEACHER_RECEIVED', 
      endTime: new Date().toISOString() 
    } : t));
    
    // Simulate notification to parent
    alert(`ARRIVAL VERIFIED: ${student?.name} has been safely received by ${user.name}. Parent has been notified via push notification.`);
  };

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case TripStatus.IN_PROGRESS: return 'bg-emerald-50 text-emerald-600';
      case TripStatus.PICKED_UP: return 'bg-indigo-50 text-indigo-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };
  
  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Staff <span className="text-indigo-600">Console</span></h1>
          <p className="text-slate-500 font-medium">Monitoring arrivals for {schoolName} • Gate: {user.gate || 'All Gates'}</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-red-600 text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase flex items-center gap-3 shadow-xl hover:bg-red-700 transition-all active:scale-95">
             <Siren size={20} /> Zone Emergency
           </button>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px]">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 md:items-center justify-between bg-slate-50/30">
           <div className="flex gap-10 overflow-x-auto no-scrollbar">
             <button onClick={() => setActiveTab('MAP')} className={`text-xl font-black transition-all whitespace-nowrap pb-2 ${activeTab === 'MAP' ? 'text-slate-900 border-b-4 border-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}>Arrival Radar</button>
             <button onClick={() => setActiveTab('MONITOR')} className={`text-xl font-black transition-all whitespace-nowrap pb-2 ${activeTab === 'MONITOR' ? 'text-slate-900 border-b-4 border-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}>Active Fleet ({activeTrips.length})</button>
             <button onClick={() => setActiveTab('ROSTER')} className={`text-xl font-black transition-all whitespace-nowrap pb-2 ${activeTab === 'ROSTER' ? 'text-slate-900 border-b-4 border-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}>School Roster</button>
           </div>
           
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search students..."
                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="p-0">
           {activeTab === 'MAP' ? (
             <div className="relative h-[700px]">
                <LiveMap lat={3.1326} lng={101.6651} zoom={15} title="School Hub Monitor" />
                
                {/* Floating Arrival List */}
                <div className="absolute top-6 right-6 w-80 bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-white shadow-2xl p-6 hidden lg:block overflow-hidden">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Clock size={16} className="text-indigo-600" /> Arriving Soon
                   </h3>
                   <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
                      {activeTrips.length > 0 ? activeTrips.map(trip => {
                        const student = childrenList.find(c => c.id === trip.childId);
                        if (!student) return null;
                        return (
                          <div key={trip.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 hover:border-indigo-200 transition-all group">
                             <div className="flex items-center gap-3">
                                <img src={student.photo} className="w-10 h-10 rounded-xl object-cover" />
                                <div className="flex-1 min-w-0">
                                   <p className="font-black text-slate-900 text-sm truncate">{student.name}</p>
                                   <p className="text-[9px] font-black text-indigo-600 uppercase">ETA {new Date(trip.estimatedArrival || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                             </div>
                             <button 
                                onClick={() => handleStudentReceived(trip.id)}
                                className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors"
                             >
                                <UserCheck size={14} /> Verify Arrival
                             </button>
                          </div>
                        );
                      }) : (
                        <p className="text-[10px] font-bold text-slate-400 text-center py-10 uppercase tracking-widest">No Incoming Missions</p>
                      )}
                   </div>
                </div>
             </div>
           ) : activeTab === 'MONITOR' ? (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
               {activeTrips.length > 0 ? activeTrips.map(trip => {
                 const student = childrenList.find(c => c.id === trip.childId);
                 const driver = MOCK_DRIVERS.find(d => d.id === trip.driverId);
                 if (!student) return null;

                 return (
                   <div key={trip.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-indigo-300 transition-all flex flex-col md:flex-row items-center justify-between gap-8 group bg-white hover:shadow-2xl hover:shadow-indigo-50">
                      <div className="flex items-center gap-6">
                         <div className="relative">
                            <img src={student.photo} className="w-20 h-24 rounded-2xl object-cover shadow-xl border-4 border-white group-hover:scale-105 transition-transform" />
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg">
                               <Navigation size={12} />
                            </div>
                         </div>
                         <div>
                            <h4 className="font-black text-2xl text-slate-900 leading-tight">{student.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(trip.status)}`}>
                                 {trip.status.replace(/_/g, ' ')}
                               </span>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">with {driver?.name || 'Vetted Guardian'}</p>
                            </div>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleStudentReceived(trip.id)} 
                        className="w-full md:w-auto bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black text-sm uppercase shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        <UserCheck size={20} /> Verify Arrival
                      </button>
                   </div>
                 );
               }) : (
                 <div className="col-span-full py-40 text-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
                       <Clock size={40} />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active trips en route to this school hub</p>
                 </div>
               )}
             </div>
           ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 p-10">
                {schoolStudents.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? schoolStudents.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(student => (
                  <div key={student.id} className="p-5 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center hover:border-indigo-300 transition-all group">
                    <img src={student.photo} className="w-24 h-32 rounded-2xl border-4 border-slate-50 shadow-md mb-4 group-hover:scale-105 transition-transform" />
                    <h5 className="font-black text-slate-900 text-sm tracking-tight">{student.name}</h5>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified Passenger</p>
                  </div>
                )) : (
                  <div className="col-span-full py-40 text-center">
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching students found for this hub</p>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
      
      {/* Quick Summary Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex items-center gap-6 shadow-sm">
            <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
               <GraduationCap size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roster Size</p>
               <p className="text-2xl font-black text-slate-900">{schoolStudents.length}</p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex items-center gap-6 shadow-sm">
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
               <CheckCircle size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrivals Today</p>
               <p className="text-2xl font-black text-slate-900">
                  {trips.filter(t => t.status === TripStatus.COMPLETED && childrenList.find(c => c.id === t.childId)?.school.includes(schoolName)).length}
               </p>
            </div>
         </div>
         <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] border border-slate-800 flex items-center gap-6 shadow-2xl shadow-indigo-100">
            <div className="bg-white/10 p-4 rounded-2xl text-indigo-400">
               <Navigation size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Transit</p>
               <p className="text-2xl font-black">{activeTrips.length}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TeacherView;
