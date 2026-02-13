
export enum UserRole {
  PARENT = 'PARENT',
  DRIVER = 'DRIVER',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  MATCHING = 'MATCHING',
  EN_ROUTE_TO_PICKUP = 'EN_ROUTE_TO_PICKUP',
  ARRIVED_AT_PICKUP = 'ARRIVED_AT_PICKUP',
  CHECKED_IN = 'CHECKED_IN',
  PICKED_UP = 'PICKED_UP',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export type AlertType = 'DEVIATION' | 'DELAY' | 'STATIONARY' | 'MISSING_CHECKIN' | 'MISSING_CHILD' | 'PANIC' | 'TRACKING_OFF' | 'COORDINATION_SIGNAL' | 'PICKUP_CHANGE';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  phone: string;
  email?: string;
  profileComplete: boolean;
  homeAddress?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  schoolId?: string; // For Teachers
  gate?: string; // For Teachers
  verificationStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED'; // For Drivers
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  age: number;
  school: string;
  pickupAddress: string;
  dropAddress: string;
  photo: string;
}

export interface Trip {
  id: string;
  childId: string;
  driverId?: string;
  status: TripStatus;
  startTime: string;
  endTime?: string;
  estimatedArrival?: string;
  currentLat: number;
  currentLng: number;
  routeDeviation: boolean;
  alerts: Alert[];
  isRecurring?: boolean;
  frequency?: 'DAILY' | 'WEEKLY' | 'ADHOC';
  trackingHealth: 'OPTIMAL' | 'STALE' | 'CRITICAL';
  driverLocationAuthorized: boolean;
  lastUpdated: string;
  coordinationSignal?: 'PARENT_LATE' | 'DRIVER_WAITING' | 'CHILD_NOT_FOUND' | 'TEACHER_RECEIVED' | 'CHANGE_PICKUP' | 'TRAFFIC_DELAY';
  rejectionReason?: string;
  verificationPin?: string; // 4-digit code for secure boarding
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicle: string;
  plate: string;
  licenseId: string;
  isVerified: boolean;
  onboardingStatus: 'PENDING' | 'APPROVED' | 'SUSPENDED';
}

export interface Alert {
  id: string;
  tripId: string;
  type: AlertType;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'EMERGENCY';
}
