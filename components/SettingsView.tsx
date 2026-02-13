
import React, { useState, useMemo, useRef } from 'react';
import { User, UserRole, Child } from '../types';
import { SCHOOLS_LIST } from '../constants';
import { 
  Shield, Mail, Phone, Home, User as UserIcon, LogOut, 
  ChevronRight, Save, Bell, Lock, Trash2, Plus, Upload, X,
  Camera, AlertCircle, CheckCircle
} from 'lucide-react';

interface SettingsViewProps {
  user: User;
  childrenList: Child[];
  onUpdate: (user: User) => void;
  onUpdateChildren: (children: Child[]) => void;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, childrenList, onUpdate, onUpdateChildren, onLogout }) => {
  const [activeSection, setActiveSection] = useState<'PROFILE' | 'CHILDREN' | 'PREFERENCES'>('PROFILE');
  const [editUser, setEditUser] = useState<User>({ ...user });
  
  // Child Editing State
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Partial<Child> | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myChildren = useMemo(() => childrenList.filter(c => c.parentId === user.id), [childrenList, user.id]);

  const handleSave = () => {
    onUpdate(editUser);
    alert("Profile successfully updated.");
  };

  const handleEditChild = (child?: Child) => {
    setEditingChild(child ? { ...child } : { 
      parentId: user.id, 
      name: '', 
      school: '', 
      age: 7,
      photo: 'https://images.unsplash.com/photo-1544717297-fa2319ee8ee0?w=200&h=250&fit=crop&q=80' 
    });
    setUploadError(null);
    setIsChildModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a JPG or PNG image.");
      return;
    }

    // Validation: Size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image size must be less than 2MB.");
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && editingChild) {
        setEditingChild({ ...editingChild, photo: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChild = () => {
    if (!editingChild?.name || !editingChild?.school) {
      alert("Please fill in the child's name and school.");
      return;
    }

    const updatedChildren = [...childrenList];
    if (editingChild.id) {
      // Edit existing
      const index = updatedChildren.findIndex(c => c.id === editingChild.id);
      if (index !== -1) updatedChildren[index] = editingChild as Child;
    } else {
      // Create new
      const newChild: Child = {
        ...editingChild as Child,
        id: `C_${Math.random().toString(36).substr(2, 9)}`,
        pickupAddress: user.homeAddress || 'Pending Address',
        dropAddress: editingChild.school || 'Pending Hub'
      };
      updatedChildren.push(newChild);
    }

    onUpdateChildren(updatedChildren);
    setIsChildModalOpen(false);
    setEditingChild(null);
  };

  const handleDeleteChild = (id: string) => {
    if (window.confirm("Are you sure you want to remove this child from the network?")) {
      onUpdateChildren(childrenList.filter(c => c.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 font-medium">Manage your {user.role.toLowerCase()} profile and preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="space-y-2">
          <button 
            onClick={() => setActiveSection('PROFILE')}
            className={`w-full text-left px-5 py-3 rounded-2xl font-black text-sm uppercase transition-all flex items-center justify-between group ${activeSection === 'PROFILE' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-400'}`}
          >
            Profile <ChevronRight size={16} className={activeSection === 'PROFILE' ? 'text-white' : 'text-slate-300 group-hover:translate-x-1 transition-transform'} />
          </button>
          {user.role === UserRole.PARENT && (
            <button 
              onClick={() => setActiveSection('CHILDREN')}
              className={`w-full text-left px-5 py-3 rounded-2xl font-black text-sm uppercase transition-all flex items-center justify-between group ${activeSection === 'CHILDREN' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-400'}`}
            >
              Children <ChevronRight size={16} className={activeSection === 'CHILDREN' ? 'text-white' : 'text-slate-300 group-hover:translate-x-1 transition-transform'} />
            </button>
          )}
          <button 
            onClick={() => setActiveSection('PREFERENCES')}
            className={`w-full text-left px-5 py-3 rounded-2xl font-black text-sm uppercase transition-all flex items-center justify-between group ${activeSection === 'PREFERENCES' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-400'}`}
          >
            Security <ChevronRight size={16} className={activeSection === 'PREFERENCES' ? 'text-white' : 'text-slate-300 group-hover:translate-x-1 transition-transform'} />
          </button>
          <div className="pt-8">
             <button onClick={onLogout} className="w-full text-left px-5 py-3 rounded-2xl font-black text-sm uppercase text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors">
               <LogOut size={18} /> Sign Out
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            {activeSection === 'PROFILE' && (
              <div className="p-10 space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-8 pb-8 border-b border-slate-50">
                   <div className="relative group">
                     <img src={editUser.avatar} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-slate-50 shadow-xl group-hover:brightness-90 transition-all" />
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={24} className="text-white" />
                     </div>
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900">Your Identity</h3>
                     <p className="text-slate-500 text-sm font-medium">Update your public information.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                    <input 
                      type="text" 
                      value={editUser.name}
                      onChange={e => setEditUser({...editUser, name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={editUser.phone}
                      onChange={e => setEditUser({...editUser, phone: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address / Hub</label>
                    <input 
                      type="text" 
                      value={editUser.homeAddress || ''}
                      onChange={e => setEditUser({...editUser, homeAddress: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" 
                    />
                  </div>
                </div>

                <button onClick={handleSave} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase flex items-center gap-3 shadow-xl hover:bg-indigo-600 transition-all">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            )}

            {activeSection === 'CHILDREN' && (
              <div className="p-10 space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-900">Registered Children</h3>
                  <button 
                    onClick={() => handleEditChild()}
                    className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2 font-black text-xs uppercase tracking-widest"
                  >
                    <Plus size={18}/> Add Child
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {myChildren.map(child => (
                    <div 
                      key={child.id} 
                      className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:border-indigo-300 transition-all group"
                    >
                      <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => handleEditChild(child)}>
                        <img src={child.photo} className="w-12 h-16 rounded-lg object-cover border-2 border-white shadow-sm" />
                        <div>
                          <p className="font-black text-slate-800">{child.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{child.school}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteChild(child.id)}
                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  ))}
                  {myChildren.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem]">
                      <UserIcon className="mx-auto text-slate-200 mb-4" size={40} />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No children registered</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'PREFERENCES' && (
              <div className="p-10 space-y-8 animate-in fade-in slide-in-from-right-4">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem]">
                       <div className="flex items-center gap-4">
                          <div className="bg-white p-3 rounded-xl text-indigo-600"><Bell size={20}/></div>
                          <div>
                             <p className="font-black text-slate-900">Push Notifications</p>
                             <p className="text-xs text-slate-500 font-medium">Get real-time trip events</p>
                          </div>
                       </div>
                       <div className="w-12 h-6 bg-indigo-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem]">
                       <div className="flex items-center gap-4">
                          <div className="bg-white p-3 rounded-xl text-indigo-600"><Lock size={20}/></div>
                          <div>
                             <p className="font-black text-slate-900">Biometric Unlock</p>
                             <p className="text-xs text-slate-500 font-medium">Secure app access</p>
                          </div>
                       </div>
                       <div className="w-12 h-6 bg-slate-200 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                    </div>
                 </div>
                 <div className="pt-8 border-t border-slate-50 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Acik Security Framework v2.4</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Child Profile Modal */}
      {isChildModalOpen && editingChild && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">{editingChild.id ? 'Edit Passenger' : 'Add Passenger'}</h2>
                <p className="text-indigo-100 text-sm font-medium">Guardian ID: {user.id}</p>
              </div>
              <button onClick={() => setIsChildModalOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <img 
                    src={editingChild.photo} 
                    className="w-32 h-44 rounded-2xl object-cover border-4 border-slate-50 shadow-xl mb-4 group-hover:brightness-90 transition-all"
                    alt="Passport Portrait"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                  >
                    <Camera size={32} />
                    <span className="text-[10px] font-black uppercase mt-1">Upload New</span>
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoUpload}
                />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Passport-Style Portrait Required
                </p>
                {uploadError && (
                  <div className="mt-2 flex items-center gap-2 text-red-500 font-bold text-xs animate-in shake duration-300">
                    <AlertCircle size={14} />
                    {uploadError}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                  <input 
                    type="text" 
                    value={editingChild.name}
                    onChange={e => setEditingChild({...editingChild, name: e.target.value})}
                    placeholder="Enter child's full name" 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned School Hub</label>
                  <select 
                    value={editingChild.school}
                    onChange={e => setEditingChild({...editingChild, school: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
                  >
                    <option value="">Select Destination Hub</option>
                    {SCHOOLS_LIST.map(school => (
                      <option key={school} value={school}>{school}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsChildModalOpen(false)}
                  className="flex-1 py-5 rounded-2xl font-black text-sm uppercase text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveChild}
                  className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Save Passenger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
