
import React from 'react';
import { AlertCircle, Clock, MapPin, UserCheck, AlertTriangle } from 'lucide-react';

interface LiveMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  title?: string;
  className?: string;
  coordinationSignal?: string;
}

const LiveMap: React.FC<LiveMapProps> = ({ 
  lat, 
  lng, 
  zoom = 15, 
  title = "Live Tracking", 
  className = "",
  coordinationSignal
}) => {
  // Using Google Maps Embed API
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed&t=m`;

  const renderSignalOverlay = () => {
    if (!coordinationSignal) return null;

    const signalConfigs: Record<string, { icon: any, color: string, label: string, sub: string }> = {
      'PARENT_LATE': { 
        icon: Clock, 
        color: 'bg-amber-600', 
        label: 'Parent Running Late', 
        sub: 'Awaiting updated arrival' 
      },
      'CHILD_NOT_FOUND': { 
        icon: AlertCircle, 
        color: 'bg-red-600', 
        label: 'Child Not Found', 
        sub: 'Driver at pickup location' 
      },
      'DRIVER_WAITING': { 
        icon: MapPin, 
        color: 'bg-indigo-600', 
        label: 'Driver Waiting', 
        sub: 'At designated pickup point' 
      },
      'CHANGE_PICKUP': { 
        icon: MapPin, 
        color: 'bg-blue-600', 
        label: 'Pickup Changed', 
        sub: 'New coordinates applied' 
      },
      'TRAFFIC_DELAY': { 
        icon: AlertTriangle, 
        color: 'bg-orange-600', 
        label: 'Heavy Traffic', 
        sub: 'ETA may vary slightly' 
      }
    };

    const config = signalConfigs[coordinationSignal];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <div className="absolute top-16 left-4 right-4 animate-in slide-in-from-top-4 duration-300">
        <div className={`${config.color} text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border-2 border-white/20 backdrop-blur-md`}>
          <div className="bg-white/20 p-2 rounded-xl">
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-widest">{config.label}</p>
            <p className="text-[10px] font-bold opacity-80">{config.sub}</p>
          </div>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse [animation-delay:200ms]" />
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse [animation-delay:400ms]" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-[2.5rem] bg-slate-100 border border-slate-200 shadow-inner ${className}`}>
      <iframe
        title={title}
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={mapUrl}
        allowFullScreen
      ></iframe>
      
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white shadow-sm flex items-center gap-2 pointer-events-none z-10">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Live GPS Feed</span>
      </div>

      {renderSignalOverlay()}
    </div>
  );
};

export default LiveMap;
