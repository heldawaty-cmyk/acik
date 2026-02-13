
import React, { useState } from 'react';
import { User, UserRole, Child } from '../types';
import { SCHOOLS_LIST } from '../constants';
import { Shield, Plus, X, Upload, CheckCircle, GraduationCap, Truck, Smartphone, User as UserIcon, Home, ArrowRight, ArrowLeft } from 'lucide-react';

interface ProfileSetupProps {
  user: User;
  onComplete: (user: User, newChildren?: Child[]) => void;
  onLogout: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ user, onComplete, onLogout }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Parent Setup State
  const [parentDetails, setParentDetails] = useState({
    homeAddress: '',
    emergencyName: '',
    emergencyPhone: ''
  });
  const [childrenList, setChildrenList] = useState<Partial<Child>[]>([]);
  
  // Driver Setup State
  const [driverInfo, setDriverInfo] = useState({
    vehicle: '',
    plate: '',
    license: '',
    idNumber: ''
  });

  // Teacher Setup State
  const [teacherInfo, setTeacherInfo] = useState({
    school: '',
    gate: 'Gate A'
  });

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      const updatedUser: User = { 
        ...user, 
        profileComplete: true,
        homeAddress: parentDetails.homeAddress,
        emergencyContact: parentDetails.emergencyName ? {
          name: parentDetails.emergencyName,
          phone: parentDetails.emergencyPhone
        } : undefined,
        schoolId: teacherInfo.school,
        gate: teacherInfo.gate,
        verificationStatus: user.role === UserRole.DRIVER ? 'PENDING' : 'APPROVED'
      };

      const finalChildren: Child[] = childrenList.map((c, i) => ({
        id: `C_${Math.random().toString(36).substr(2, 9)}`,
        parentId: user.id,
        name: c.name || `Child ${i+1}`,
        age: 7,
        school: c.school || 'Unassigned School',
        pickupAddress: parentDetails.homeAddress,
        dropAddress: c.school || 'Drop-off',
        photo: 'https://images.unsplash.com/photo-1544717297-fa2319ee8ee0?w=200&h=250&fit=crop&q=80'
      }));

      onComplete(updatedUser, finalChildren);
      setLoading(false);
    }, 2000);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const renderParentSetup = () => {
    if (step === 1) {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Guardian Profile</h2>
            <p className="text-slate-500 font-medium">Basic safety and contact information.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Home Address (Primary Pickup)</label>
              <div className="relative">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  value={parentDetails.homeAddress}
                  onChange={e => setParentDetails({...parentDetails, homeAddress: e.target.value})}
                  placeholder="e.g. 15 Jalan Maarof, Bangsar" 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Contact Name</label>
                <input 
                  type="text" 
                  value={parentDetails.emergencyName}
                  onChange={e => setParentDetails({...parentDetails, emergencyName: e.target.value})}
                  placeholder="Full Name" 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Contact Phone</label>
                <input 
                  type="text" 
                  value={parentDetails.emergencyPhone}
                  onChange={e => setParentDetails({...parentDetails, emergencyPhone: e.target.value})}
                  placeholder="01X-XXXXXXX" 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" 
                />
              </div>
            </div>
            <button 
              disabled={!parentDetails.homeAddress || !parentDetails.emergencyName}
              onClick={nextStep} 
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Next: Add Children <ArrowRight size={20} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Add Your Children</h2>
          <p className="text-slate-500 font-medium">Link passengers to your account.</p>
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
          {childrenList.map((child, idx) => (
            <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-indigo-600 uppercase">Child #{idx + 1}</span>
                <button onClick={() => setChildrenList(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="Child Name"
                  className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm"
                  value={child.name}
                  onChange={e => {
                    const newList = [...childrenList];
                    newList[idx].name = e.target.value;
                    setChildrenList(newList);
                  }}
                />
                <select 
                  className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm"
                  value={child.school}
                  onChange={e => {
                    const newList = [...childrenList];
                    newList[idx].school = e.target.value;
                    setChildrenList(newList);
                  }}
                >
                  <option value="">Select School</option>
                  {SCHOOLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}

          <button 
            onClick={() => setChildrenList([...childrenList, { name: '', school: '', pickupAddress: parentDetails.homeAddress }])}
            className="w-full py-8 border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 hover:text-indigo-600 hover:border-indigo-100 transition-all group"
          >
            <Plus size={32} className="group-hover:scale-110 transition-transform mb-2" />
            <span className="text-xs font-black uppercase tracking-widest">Add Passenger</span>
          </button>
        </div>

        <div className="flex gap-4">
          <button onClick={prevStep} className="p-5 bg-slate-100 text-slate-600 rounded-2xl"><ArrowLeft /></button>
          <button 
            disabled={childrenList.length === 0 || childrenList.some(c => !c.name || !c.school)}
            onClick={handleFinish} 
            className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl disabled:opacity-50"
          >
            Finish Setup
          </button>
        </div>
      </div>
    );
  };

  const renderDriverSetup = () => {
    if (step === 1) {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Driver Verification</h2>
            <p className="text-slate-500 font-medium">Verify your identity as a safe transporter.</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MyKad / Passport Number</label>
              <input 
                type="text" 
                placeholder="XXXXXX-XX-XXXX"
                value={driverInfo.idNumber}
                onChange={e => setDriverInfo({...driverInfo, idNumber: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Driver's License ID</label>
              <input 
                type="text" 
                placeholder="License Reference"
                value={driverInfo.license}
                onChange={e => setDriverInfo({...driverInfo, license: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-center flex flex-col items-center gap-2 hover:border-indigo-400 cursor-pointer">
                  <Upload size={24} className="text-slate-300" />
                  <span className="text-[9px] font-black uppercase">Upload License</span>
               </div>
               <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-center flex flex-col items-center gap-2 hover:border-indigo-400 cursor-pointer">
                  <Smartphone size={24} className="text-slate-300" />
                  <span className="text-[9px] font-black uppercase">Take Selfie</span>
               </div>
            </div>
            <button 
              disabled={!driverInfo.idNumber || !driverInfo.license}
              onClick={nextStep} 
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl mt-6 disabled:opacity-50"
            >
              Next: Vehicle Details
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Vehicle Registration</h2>
          <p className="text-slate-500 font-medium">Register the vehicle you'll use for transport.</p>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Make/Model</label>
            <input 
              type="text" 
              placeholder="e.g. Toyota Innova (Silver)"
              value={driverInfo.vehicle}
              onChange={e => setDriverInfo({...driverInfo, vehicle: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">License Plate Number</label>
            <input 
              type="text" 
              placeholder="e.g. WLP 6490"
              value={driverInfo.plate}
              onChange={e => setDriverInfo({...driverInfo, plate: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all font-mono" 
            />
          </div>
          <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-start gap-4">
             <Shield className="text-amber-600 mt-1" size={20} />
             <p className="text-xs font-bold text-amber-700 leading-relaxed">Safety review usually takes 24-48 hours. You will be notified once your portal is active.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={prevStep} className="p-5 bg-slate-100 text-slate-600 rounded-2xl"><ArrowLeft /></button>
            <button 
              disabled={!driverInfo.vehicle || !driverInfo.plate}
              onClick={handleFinish} 
              className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl"
            >
              Submit Application
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTeacherSetup = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Staff Verification</h2>
          <p className="text-slate-500 font-medium">Link to your school and designated gate.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned School Hub</label>
            <select 
              value={teacherInfo.school}
              onChange={e => setTeacherInfo({...teacherInfo, school: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
            >
              <option value="">Select School...</option>
              {SCHOOLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Gate Responsibility</label>
            <select 
              value={teacherInfo.gate}
              onChange={e => setTeacherInfo({...teacherInfo, gate: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
            >
              <option value="Gate A">Gate A - Main Entrance</option>
              <option value="Gate B">Gate B - Drop-off Loop</option>
              <option value="Gate C">Gate C - Bus Terminal</option>
              <option value="Gate D">Gate D - Pedestrian Gate</option>
            </select>
          </div>

          <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex items-start gap-4">
             <GraduationCap className="text-indigo-600 mt-1" size={20} />
             <p className="text-xs font-bold text-indigo-700 leading-relaxed">Staff accounts are verified against school email domains or admin approval.</p>
          </div>

          <button 
            disabled={!teacherInfo.school}
            onClick={handleFinish} 
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl disabled:opacity-50"
          >
            Activate Staff Profile
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pb-20">
      <div className="w-full max-w-xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-12 duration-500">
        
        {/* Onboarding Header */}
        <div className="bg-slate-900 p-10 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-4">
             <div className="bg-white/10 p-3 rounded-2xl">
                <Shield size={24} className="text-indigo-400" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Onboarding Step {step}</p>
                <h1 className="text-2xl font-black tracking-tight">{user.role.charAt(0) + user.role.slice(1).toLowerCase()} Portal</h1>
             </div>
          </div>
          <button onClick={onLogout} className="text-slate-500 hover:text-white transition-colors text-xs font-black uppercase">Cancel</button>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-10 relative">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-6 animate-pulse">
               <div className="w-16 h-16 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin" />
               <p className="text-lg font-black text-slate-900">Configuring Guardian Link...</p>
            </div>
          ) : (
            <>
              {user.role === UserRole.PARENT && renderParentSetup()}
              {user.role === UserRole.DRIVER && renderDriverSetup()}
              {user.role === UserRole.TEACHER && renderTeacherSetup()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
