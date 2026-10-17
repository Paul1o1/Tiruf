export type Ward = 'ICU' | 'ER' | 'Med-Surg' | 'Pediatrics' | 'Maternity' | 'OR' | 'Pharmacy' | 'Lab' | 'General';

export type CredentialType = 'license' | 'certificate' | 'training';

export interface Credential {
  id: string;
  type: CredentialType;
  name: string;
  issuingBody: string;
  number?: string;
  issueDate?: string;
  expiryDate: string;
  documentUrl?: string;
  status: 'under-review' | 'approved' | 'rejected' | 'pending';
  rejectionReason?: string;
}

export interface Hospital {
  id: string;
  name: string;
  logo?: string;
  area: string;
  address: string;
  phone?: string;
  coordinates: [number, number];
  rating?: number;
  distanceKm?: number;
  subscriptionActive?: boolean;
}

export interface Shift {
  id: string;
  hospitalId: string;
  ward: Ward;
  specialty: string;
  date: string;
  startTime: string;
  endTime: string;
  ratePerHour: number;
  totalPay: number;
  positions: number;
  requiredCredentials: string[];
  urgency: 'low' | 'normal' | 'high';
  status: 'open' | 'filled' | 'closed';
  description: string;
  address: string;
  coordinates: [number, number];
  distanceKm?: number;
  applied?: boolean;
  saved?: boolean;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'completed' | 'cancelled';

export interface Application {
  id: string;
  shiftId: string;
  nurseId: string;
  status: ApplicationStatus;
  appliedAt: string;
  withdrawnAt?: string;
  reason?: string;
  hospitalRating?: number;
  nurseRating?: number;
}

export interface Nurse {
  id: string;
  fullName: string;
  specialty: string;
  yearsExperience: number;
  rating: number;
  shiftsCompleted: number;
  email: string;
  phone: string;
  avatar?: string;
  verificationStatus: 'verified' | 'pending' | 'action-needed';
  credentials: Credential[];
  preferredAreas: string[];
  preferredWards: Ward[];
  maxTravelKm: number;
  language: 'en' | 'am';
}

export type NotificationType = 'shift-accepted' | 'shift-declined' | 'new-match' | 'reminder-24h' | 'reminder-2h' | 'credential-expiring' | 'message';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
