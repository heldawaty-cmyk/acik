
import { UserRole, User, Child, Driver, Trip, TripStatus, Alert } from './types';

export const APP_NAME = "Acik Transporter";

export const SCHOOLS_LIST = [
  "SK Bangsar",
  "SMK Bangsar",
  "SK Bukit Bandaraya",
  "SMK Bukit Bandaraya",
  "Cempaka International School Damansara Heights",
  "Stella Maris School Damansara",
  "Garden International School (Nearby)",
  "SK Damansara Heights"
];

// Simulated Admin/Current User
// Added missing profileComplete: true
export const MOCK_USER: User = {
  id: 'P_DAKRM8J5',
  name: 'Siti Zulkifli',
  role: UserRole.PARENT,
  avatar: 'https://i.pravatar.cc/150?u=P_DAKRM8J5',
  phone: '01800455268',
  profileComplete: true
};

// Added missing profileComplete: true
export const MOCK_TEACHER: User = {
  id: 'T_HENDERSON',
  name: 'Mr. Henderson',
  role: UserRole.TEACHER,
  avatar: 'https://i.pravatar.cc/150?u=T_HENDERSON',
  phone: '+1 (555) 999-8888',
  profileComplete: true
};

// Passport-style portraits for kids (neutral backgrounds, centered)
export const MOCK_CHILDREN: Child[] = [
  {
    id: 'C_XFGCAQVK',
    parentId: 'P_DAKRM8J5',
    name: 'Haziq',
    age: 9,
    school: 'Garden International School (Nearby)',
    pickupAddress: 'Lucky Garden',
    dropAddress: 'GIS Gate A',
    photo: 'https://images.unsplash.com/photo-1544717297-fa2319ee8ee0?w=200&h=250&fit=crop&q=80'
  },
  {
    id: 'C_Y72WX7PT',
    parentId: 'P_N78BMYYM',
    name: 'Chloe',
    age: 14,
    school: 'SK Bangsar',
    pickupAddress: 'Jalan Maarof',
    dropAddress: 'SK Bangsar Gate 1',
    photo: 'https://images.unsplash.com/photo-1517677129300-07b130802f46?w=200&h=250&fit=crop&q=80'
  },
  {
    id: 'C_FL0UKEYZ',
    parentId: 'P_PBMYOFQE',
    name: 'Izzah',
    age: 7,
    school: 'SK Bangsar',
    pickupAddress: 'Bangsar Baru',
    dropAddress: 'SK Bangsar Gate 1',
    photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=250&fit=crop&q=80'
  },
  {
    id: 'C_V60VAIY4',
    parentId: 'P_UE8YFBNT',
    name: 'Adam',
    age: 7,
    school: 'SK Bangsar',
    pickupAddress: 'Jalan Maarof',
    dropAddress: 'SK Bangsar Gate 2',
    photo: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=250&fit=crop&q=80'
  },
  {
    id: 'C_WIYKID91',
    parentId: 'P_DAKRM8J5',
    name: 'Bella',
    age: 9,
    school: 'SK Bangsar',
    pickupAddress: 'Pantai Dalam Edge',
    dropAddress: 'SK Bangsar Gate 2',
    photo: 'https://images.unsplash.com/photo-1595152430634-11e0e8e974e6?w=200&h=250&fit=crop&q=80'
  }
];

// Drivers with valid License IDs
export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'D_NFVOBBZ2',
    name: 'Alya Aziz',
    rating: 4.95,
    vehicle: 'Toyota Innova',
    plate: 'WLP6490',
    licenseId: 'MY-829201-L',
    isVerified: true,
    onboardingStatus: 'APPROVED'
  },
  {
    id: 'D_LXSLG6MM',
    name: 'Amir Tan',
    rating: 4.9,
    vehicle: 'Honda HR-V',
    plate: 'WRU5566',
    licenseId: 'MY-771203-D',
    isVerified: true,
    onboardingStatus: 'APPROVED'
  },
  {
    id: 'D_OW4VSSRU',
    name: 'Siti Omar',
    rating: 4.08,
    vehicle: 'Perodua Aruz',
    plate: 'WVJ7305',
    licenseId: 'MY-910405-A',
    isVerified: true,
    onboardingStatus: 'APPROVED'
  },
  {
    id: 'D_6DUT076G',
    name: 'Syafiq Omar',
    rating: 4.9,
    vehicle: 'Toyota Vios',
    plate: 'WYA7212',
    licenseId: 'MY-850607-V',
    isVerified: true,
    onboardingStatus: 'APPROVED'
  },
  {
    id: 'D_KK791ZYR',
    name: 'Nadia Zulkifli',
    rating: 4.46,
    vehicle: 'Perodua Aruz',
    plate: 'WJY4186',
    licenseId: 'MY-990809-Z',
    isVerified: false,
    onboardingStatus: 'PENDING'
  }
];

export const MOCK_TRIPS: Trip[] = [
  {
    id: 'T_VWV8LW2Q',
    childId: 'C_Y72WX7PT',
    driverId: 'D_NFVOBBZ2',
    status: TripStatus.IN_PROGRESS,
    startTime: new Date(Date.now() - 20 * 60000).toISOString(),
    estimatedArrival: new Date(Date.now() + 5 * 60000).toISOString(),
    currentLat: 3.1306,
    currentLng: 101.6673,
    routeDeviation: false,
    alerts: [],
    // Fix: Added missing properties required by Trip interface
    trackingHealth: 'OPTIMAL',
    driverLocationAuthorized: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'T_FGJK2N7Z',
    childId: 'C_XFGCAQVK',
    driverId: 'D_LXSLG6MM',
    status: TripStatus.ARRIVED_AT_PICKUP,
    startTime: new Date(Date.now() - 5 * 60000).toISOString(),
    estimatedArrival: new Date(Date.now() + 15 * 60000).toISOString(),
    currentLat: 3.1093,
    currentLng: 101.6655,
    routeDeviation: true,
    alerts: [
      {
        id: 'A_O20U9ISY',
        tripId: 'T_FGJK2N7Z',
        type: 'DEVIATION',
        message: 'Vehicle stopped outside safe zone for 4 minutes.',
        timestamp: new Date().toISOString(),
        resolved: false
      }
    ],
    // Fix: Added missing properties required by Trip interface
    trackingHealth: 'OPTIMAL',
    driverLocationAuthorized: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'T_DDH0UYHN',
    childId: 'C_FL0UKEYZ',
    driverId: 'D_6DUT076G',
    status: TripStatus.EN_ROUTE_TO_PICKUP,
    startTime: new Date(Date.now() - 2 * 60000).toISOString(),
    estimatedArrival: new Date(Date.now() + 8 * 60000).toISOString(),
    currentLat: 3.1326,
    currentLng: 101.6651,
    routeDeviation: false,
    alerts: [],
    // Fix: Added missing properties required by Trip interface
    trackingHealth: 'OPTIMAL',
    driverLocationAuthorized: true,
    lastUpdated: new Date().toISOString()
  }
];

export const SIMULATED_ALERTS: Alert[] = [
  {
    id: 'A_PANIC_001',
    tripId: 'T_VWV8LW2Q',
    type: 'MISSING_CHILD',
    message: 'Guardian triggered Panic Button. Protocol active.',
    timestamp: new Date().toISOString(),
    resolved: false
  },
  {
    id: 'A_DEVIATION_002',
    tripId: 'T_FGJK2N7Z',
    type: 'DEVIATION',
    message: 'Route Deviation: Driver Tan exceeded 500m threshold.',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    resolved: false
  }
];
