
import React, { useState } from 'react';
import { MOCK_DRIVERS, SIMULATED_ALERTS } from '../constants';
import { Trip, TripStatus, Child } from '../types';
import { 
  Activity, ShieldAlert, Users, Truck, Search, Filter, 
  MoreHorizontal, Bell, CheckCircle, Clock, AlertTriangle, ChevronRight, Check, X, Siren, UserCheck, Map as MapIcon
} from 'lucide-react';
import LiveMap from './LiveMap';

interface AdminViewProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  childrenList: Child[];
}

const AdminView: React.FC<AdminViewProps> = ({ trips, setTrips, childrenList }) => {
  const [activeTab, setActiveTab] = useState<'FLEET' | 'INCIDENTS' | 'REQUESTS' | 'MAP'>('MAP');

  const pendingRequests = trips.filter(t => t.status === TripStatus.MATCHING);
  const activeTrips = trips.filter(t => t.status !== TripStatus.COMPLETED && t.status !== TripStatus.MATCHING);

  const handleApproveRequest = (tripId: string) => {
    const availableDrivers = MOCK_DRIVERS.filter(d => d.onboardingStatus === 'APPROVED');
    const randomDriver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];

    setTrips(prev => prev.map(t => 
      t.id === tripId 
        ? { 
            ...t, 
            status: TripStatus.EN_ROUTE_TO_PICKUP, 
            driverId: randomDriver.id,
            estimatedArrival: new Date(Date.now() + 15 * 60000).toISOString()
          } 
        : t
    ));
  };

  const handleRejectRequest = (tripId: string) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
  };

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-16">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Operations <span className="text-indigo-600">HQ</span></h1>
          <p className="text-slate-500 font-medium">Guardian Oversight Panel.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
            <input className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all w-64 shadow-sm" placeholder="Search system logs..." />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 shadow-sm">
            <Filter size={24} className="text-slate-600" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Fleet Active', val: String(activeTrips.length), change: '+12%', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Pending Approval', val: String(pendingRequests.length), change: 'New', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Critical Risk', val: String(SIMULATED_ALERTS.length), change: '-40%', icon: Siren, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Safety Index', val: '99%', change: 'Target', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-[1.5rem] group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${stat.change.startsWith('+') || stat.change === 'New' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-4xl font-black text-slate-900 mt-2">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-slate-100">
               <div className="flex gap-8 overflow-x-auto no-scrollbar">
                 <button onClick={() => setActiveTab('MAP')} className={`text-xl font-black transition-colors whitespace-nowrap ${activeTab === 'MAP' ? 'text-slate-900 underline underline-offset-8 decoration-emerald-500 decoration-4' : 'text-slate-300'}`}>Live Fleet Map</button>
                 <button onClick={() => setActiveTab('REQUESTS')} className={`text-xl font-black transition-colors whitespace-nowrap ${activeTab === 'REQUESTS' ? 'text-slate-900 underline underline-offset-8 decoration-amber-500 decoration-4' : 'text-slate-300'}`}>
                   Pending Requests {pendingRequests.length > 0 && <span className="ml-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px]">{pendingRequests.length}</span>}
                 </button>
                 <button onClick={() => setActiveTab('FLEET')} className={`text-xl font-black transition-colors whitespace-nowrap ${activeTab === 'FLEET' ? 'text-slate-900 underline underline-offset-8 decoration-indigo-600 decoration-4' : 'text-slate-300'}`}>Asset Roster</button>
               </div>
            </div>
            <div className="p-4">
              {activeTab === 'MAP' ? (
                <div className="p-4 h-[600px]">
                  {activeTrips.length > 0 ? (
                    <LiveMap lat={activeTrips[0].currentLat} lng={activeTrips[0].currentLng} zoom={13} title="Global Fleet Tracking" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center border-4 border-dashed border-slate-100 rounded-[2.5rem]">
                      <div className="text-center">
                        <MapIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Active Trips to Plot</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === 'REQUESTS' ? (
                <div className="space-y-4 p-4">
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-20">
                      <CheckCircle className="mx-auto text-slate-200 w-16 h-16 mb-4" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">All requests processed</p>
                    </div>
                  ) : (
                    pendingRequests.map(req => {
                      // Fix: Use the childrenList from state instead of constant mock data
                      const child = childrenList.find(c => c.id === req.childId);
                      return (
                        <div key={req.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all">
                          <div className="flex items-center gap-6">
                            <img src={child?.photo} className="w-16 h-20 rounded-xl object-cover shadow-md" />
                            <div>
                               <h4 className="text-xl font-black text-slate-900">{child?.name}</h4>
                               <p className="text-sm text-slate-500 font-bold">{child?.school}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => handleRejectRequest(req.id)} className="px-6 py-3 bg-white text-slate-400 border border-slate-200 rounded-xl font-black text-xs uppercase hover:bg-red-50 hover:text-red-500 transition-all">Reject</button>
                            <button onClick={() => handleApproveRequest(req.id)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                              <UserCheck size={16} /> Approve & Match
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              ) : activeTab === 'FLEET' ? (
                <table className="w-full text-left font-bold">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                      <th className="px-6 py-5">Driver Entity</th>
                      <th className="px-6 py-5">Vehicle/Plate</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5">Safety Score</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {MOCK_DRIVERS.map((driver, idx) => {
                      const activeTrip = trips.find(t => t.driverId === driver.id && t.status !== TripStatus.COMPLETED);
                      return (
                        <tr key={idx} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-6 flex items-center gap-4">
                            <img src={`https://i.pravatar.cc/150?u=${driver.id}`} className="w-12 h-12 rounded-[1.5rem] bg-slate-100 shadow-sm" />
                            <div>
                              <p className="text-slate-900 leading-tight">{driver.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-slate-600 uppercase font-mono text-xs">{driver.vehicle}<br/>{driver.plate}</td>
                          <td className="px-6 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${activeTrip ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                              {activeTrip ? 'ON TRIP' : 'IDLE'}
                            </span>
                          </td>
                          <td className="px-6 py-6">★ {driver.rating}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 text-center text-slate-400 italic">Logs View</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="absolute -top-6 -left-6 opacity-20">
               <Siren size={100} className="text-red-500" />
             </div>
             <div className="relative z-10">
               <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black">Live Alerts</h3>
                 <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">Critical</span>
               </div>
               <div className="space-y-6">
                  {SIMULATED_ALERTS.map(alert => {
                    const trip = trips.find(t => t.id === alert.tripId);
                    // Fix: Use the childrenList from state instead of constant mock data
                    const student = trip ? childrenList.find(c => c.id === trip.childId) : null;
                    return (
                      <div key={alert.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] group hover:bg-red-500/20 transition-all cursor-pointer">
                        <p className={`font-bold text-lg mb-1 text-white`}>{student?.name || 'Unknown'}</p>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">{alert.message}</p>
                      </div>
                    );
                  })}
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
