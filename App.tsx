
import React, { useState, useEffect } from 'react';
import { UserRole, Trip, TripStatus, Alert, User, Child } from './types';
import { MOCK_TRIPS, MOCK_USER, MOCK_CHILDREN, MOCK_TEACHER } from './constants';
import Layout from './components/Layout';
import ParentView from './components/ParentView';
import DriverView from './components/DriverView';
import AdminView from './components/AdminView';
import TeacherView from './components/TeacherView';
import LandingPage from './components/LandingPage';
import AuthView from './components/AuthView';
import ProfileSetup from './components/ProfileSetup';
import SettingsView from './components/SettingsView';

const STORAGE_KEYS = {
  USER: 'acik_user',
  ROLE: 'acik_active_role',
  CHILDREN: 'acik_children',
  TRIPS: 'acik_trips',
  SIGN_UP: 'acik_is_signing_up'
};

const App: React.FC = () => {
  // Persistence: Initialize state from localStorage
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [activeRole, setActiveRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || null;
  });

  const [isSigningUp, setIsSigningUp] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SIGN_UP) === 'true';
  });

  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'SETTINGS'>('DASHBOARD');
  
  const [children, setChildren] = useState<Child[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHILDREN);
    return saved ? JSON.parse(saved) : MOCK_CHILDREN;
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRIPS);
    if (saved) return JSON.parse(saved);
    
    return MOCK_TRIPS.map(t => ({
      ...t,
      trackingHealth: 'OPTIMAL',
      driverLocationAuthorized: true,
      lastUpdated: new Date().toISOString()
    }));
  });

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  }, [user]);

  useEffect(() => {
    if (activeRole) localStorage.setItem(STORAGE_KEYS.ROLE, activeRole);
    else localStorage.removeItem(STORAGE_KEYS.ROLE);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIGN_UP, String(isSigningUp));
  }, [isSigningUp]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
  }, [children]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  }, [trips]);

  // Simulation: Background movement for active trips
  useEffect(() => {
    const interval = setInterval(() => {
      setTrips(currentTrips => 
        currentTrips.map(trip => {
          const isOngoing = trip.status === TripStatus.IN_PROGRESS || 
                           trip.status === TripStatus.EN_ROUTE_TO_PICKUP || 
                           trip.status === TripStatus.PICKED_UP;
          
          if (isOngoing) {
            const latDelta = (Math.random() - 0.4) * 0.0005;
            const lngDelta = (Math.random() - 0.4) * 0.0005;
            const permissionStillValid = Math.random() > 0.02; 
            
            const updatedTrip: Trip = {
              ...trip,
              currentLat: trip.currentLat + latDelta,
              currentLng: trip.currentLng + lngDelta,
              lastUpdated: new Date().toISOString(),
              driverLocationAuthorized: permissionStillValid,
              trackingHealth: permissionStillValid ? 'OPTIMAL' : 'CRITICAL',
            };

            if (!permissionStillValid && !trip.alerts.some(a => a.type === 'TRACKING_OFF')) {
              const trackingAlert: Alert = {
                id: `ALERT-LOC-${Date.now()}`,
                tripId: trip.id,
                type: 'TRACKING_OFF',
                message: `CRITICAL: Driver signal lost mid-trip.`,
                timestamp: new Date().toISOString(),
                resolved: false
              };
              updatedTrip.alerts = [trackingAlert, ...trip.alerts];
            }

            return updatedTrip;
          }
          return trip;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRoleSelection = (role: UserRole, signUp: boolean = false) => {
    setActiveRole(role);
    setIsSigningUp(signUp);
  };

  /**
   * One-tap login for demo purposes to bypass repetitive auth steps
   */
  const handleQuickLogin = (role: UserRole) => {
    setActiveRole(role);
    setIsSigningUp(false);
    
    let mockUser: User;
    switch(role) {
      case UserRole.PARENT:
        mockUser = { ...MOCK_USER };
        break;
      case UserRole.TEACHER:
        mockUser = { ...MOCK_TEACHER };
        break;
      case UserRole.DRIVER:
        mockUser = {
          id: 'D_QUICK_LOGIN',
          name: 'Amir (Demo)',
          role: UserRole.DRIVER,
          avatar: 'https://i.pravatar.cc/150?u=D_QUICK_LOGIN',
          phone: '012-555-8888',
          profileComplete: true,
          verificationStatus: 'APPROVED'
        };
        break;
      case UserRole.ADMIN:
        mockUser = {
          id: 'A_QUICK_LOGIN',
          name: 'Admin HQ',
          role: UserRole.ADMIN,
          avatar: 'https://i.pravatar.cc/150?u=A_QUICK_LOGIN',
          phone: '999',
          profileComplete: true
        };
        break;
    }
    
    setUser(mockUser);
    setCurrentView('DASHBOARD');
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleProfileComplete = (updatedUser: User, newChildren?: Child[]) => {
    setUser(updatedUser);
    if (newChildren) {
      setChildren(prev => [...prev, ...newChildren]);
    }
    setCurrentView('DASHBOARD');
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const logout = () => {
    setUser(null);
    setActiveRole(null);
    setIsSigningUp(false);
    setCurrentView('DASHBOARD');
    // Specifically clear session keys
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.SIGN_UP);
  };

  // 1. If not logged in and no role selected, show Landing
  if (!activeRole) {
    return (
      <LandingPage 
        onSelectRole={handleQuickLogin} // Changed to QuickLogin to reduce repetition
        onSignUp={(role) => handleRoleSelection(role, true)} 
      />
    );
  }

  // 2. If role selected but no user, show Auth
  if (!user) {
    return (
      <AuthView 
        role={activeRole} 
        isSignUp={isSigningUp} 
        onBack={() => setActiveRole(null)} 
        onSuccess={handleAuthSuccess}
        onQuickLogin={() => handleQuickLogin(activeRole)} // Allow one-tap from auth screen too
      />
    );
  }

  // 3. If user exists but profile incomplete, show Profile Setup (Onboarding)
  if (!user.profileComplete) {
    return <ProfileSetup user={user} onComplete={handleProfileComplete} onLogout={logout} />;
  }

  // 4. Main App Routing
  const renderContent = () => {
    if (currentView === 'SETTINGS') {
      return (
        <SettingsView 
          user={user} 
          childrenList={children} 
          onUpdate={handleProfileUpdate} 
          onUpdateChildren={setChildren} 
          onLogout={logout} 
        />
      );
    }

    switch (activeRole) {
      case UserRole.PARENT:
        return <ParentView user={user} trips={trips} childrenList={children} setTrips={setTrips} />;
      case UserRole.DRIVER:
        return <DriverView user={user} trips={trips} childrenList={children} setTrips={setTrips} />;
      case UserRole.TEACHER:
        return <TeacherView user={user} trips={trips} childrenList={children} setTrips={setTrips} />;
      case UserRole.ADMIN:
        return <AdminView trips={trips} childrenList={children} setTrips={setTrips} />;
      default:
        return null;
    }
  };

  return (
    <Layout 
      activeRole={activeRole} 
      onRoleChange={handleRoleSelection} 
      trips={trips} 
      user={user} 
      onLogout={logout}
      onNavigateSettings={() => setCurrentView('SETTINGS')}
      onNavigateDashboard={() => setCurrentView('DASHBOARD')}
      currentView={currentView}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
