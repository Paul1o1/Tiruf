import { Hospital, Nurse, Shift, Application, Notification, Credential } from '@/types/tiruf';

export const hospitals: Hospital[] = [
  { id: 'h1', name: 'Black Lion Hospital', area: 'Lideta', address: 'Lideta, Addis Ababa', coordinates: [9.010, 38.748], rating: 4.8, distanceKm: 2.3, subscriptionActive: true },
  { id: 'h2', name: 'St. Paul Hospital', area: 'Gulele', address: 'Gulele, Addis Ababa', coordinates: [9.051, 38.742], rating: 4.7, distanceKm: 3.1, subscriptionActive: true },
  { id: 'h3', name: 'MCM General Hospital', area: 'Bole', address: 'Bole, Addis Ababa', coordinates: [8.989, 38.788], rating: 4.6, distanceKm: 1.9, subscriptionActive: true },
  { id: 'h4', name: 'Landmark Hospital', area: 'Nifas Silk', address: 'Nifas Silk, Addis Ababa', coordinates: [9.004, 38.780], rating: 4.9, distanceKm: 2.8, subscriptionActive: true },
  { id: 'h5', name: 'Hayat Hospital', area: 'Kirkos', address: 'Kirkos, Addis Ababa', coordinates: [9.010, 38.764], rating: 4.7, distanceKm: 1.5, subscriptionActive: true },
  { id: 'h6', name: 'CMC Hospital', area: 'CMC', address: 'CMC, Addis Ababa', coordinates: [9.057, 38.698], rating: 4.5, distanceKm: 4.2, subscriptionActive: true },
];

export const credentials: Credential[] = [
  { id: 'c1', type: 'license', name: 'Nursing License (RN)', issuingBody: 'Ethiopian Nurses and Midwives Association', number: 'ENMA-87654', expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), status: 'approved', documentUrl: '#' },
  { id: 'c2', type: 'certificate', name: 'BLS Certification', issuingBody: 'American Heart Association', expiryDate: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10), status: 'approved', documentUrl: '#' },
  { id: 'c3', type: 'certificate', name: 'ICU Training Certificate', issuingBody: 'Ethiopian Medical Association', expiryDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10), status: 'approved', documentUrl: '#' },
];

export const nurse: Nurse = {
  id: 'n1',
  fullName: 'Selam Tadesse',
  specialty: 'ICU Nurse',
  yearsExperience: 5,
  rating: 4.9,
  shiftsCompleted: 128,
  email: 'selam.tadesse@example.com',
  phone: '+251 911 223344',
  verificationStatus: 'verified',
  credentials,
  preferredAreas: ['Bole', 'Lideta', 'Kirkos'],
  preferredWards: ['ICU', 'ER'],
  maxTravelKm: 5,
  language: 'en',
};

function addDays(n: number): string {
  return new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
}

export const shifts: Shift[] = [
  { id: 's1', hospitalId: 'h1', ward: 'ICU', specialty: 'Critical Care', date: addDays(0), startTime: '19:00', endTime: '07:00', ratePerHour: 450, totalPay: 5400, positions: 1, requiredCredentials: ['license', 'BLS'], urgency: 'high', status: 'open', description: 'ICU night shift covering post-op care.', address: hospitals[0].address, coordinates: hospitals[0].coordinates, distanceKm: 2.3 },
  { id: 's2', hospitalId: 'h3', ward: 'ER', specialty: 'Emergency', date: addDays(0), startTime: '07:00', endTime: '15:00', ratePerHour: 400, totalPay: 3200, positions: 2, requiredCredentials: ['license'], urgency: 'normal', status: 'open', description: 'ER day shift for triage support.', address: hospitals[2].address, coordinates: hospitals[2].coordinates, distanceKm: 1.9 },
  { id: 's3', hospitalId: 'h2', ward: 'Maternity', specialty: 'OB/GYN', date: addDays(1), startTime: '07:00', endTime: '19:00', ratePerHour: 380, totalPay: 4560, positions: 1, requiredCredentials: ['license'], urgency: 'normal', status: 'open', description: 'Maternity ward coverage.', address: hospitals[1].address, coordinates: hospitals[1].coordinates, distanceKm: 3.1 },
  { id: 's4', hospitalId: 'h5', ward: 'ICU', specialty: 'Critical Care', date: addDays(1), startTime: '19:00', endTime: '07:00', ratePerHour: 450, totalPay: 5400, positions: 1, requiredCredentials: ['license', 'ICU'], urgency: 'high', status: 'open', description: 'ICU night coverage.', address: hospitals[4].address, coordinates: hospitals[4].coordinates, distanceKm: 1.5 },
  { id: 's5', hospitalId: 'h4', ward: 'Pediatrics', specialty: 'Pediatrics', date: addDays(2), startTime: '07:00', endTime: '19:00', ratePerHour: 420, totalPay: 5040, positions: 1, requiredCredentials: ['license'], urgency: 'normal', status: 'open', description: 'Pediatric ward day shift.', address: hospitals[3].address, coordinates: hospitals[3].coordinates, distanceKm: 2.8 },
  { id: 's6', hospitalId: 'h6', ward: 'Med-Surg', specialty: 'General', date: addDays(3), startTime: '07:00', endTime: '19:00', ratePerHour: 360, totalPay: 4320, positions: 2, requiredCredentials: ['license'], urgency: 'normal', status: 'open', description: 'Med-Surg floor.', address: hospitals[5].address, coordinates: hospitals[5].coordinates, distanceKm: 4.2 },
  { id: 's7', hospitalId: 'h1', ward: 'OR', specialty: 'Surgery', date: addDays(3), startTime: '08:00', endTime: '20:00', ratePerHour: 480, totalPay: 5760, positions: 1, requiredCredentials: ['license'], urgency: 'normal', status: 'open', description: 'OR scrub/support.', address: hospitals[0].address, coordinates: hospitals[0].coordinates, distanceKm: 2.3 },
  { id: 's8', hospitalId: 'h3', ward: 'ER', specialty: 'Emergency', date: addDays(4), startTime: '19:00', endTime: '07:00', ratePerHour: 440, totalPay: 5280, positions: 1, requiredCredentials: ['license'], urgency: 'high', status: 'open', description: 'ER night shift.', address: hospitals[2].address, coordinates: hospitals[2].coordinates, distanceKm: 1.9 },
];

export const applications: Application[] = [
  { id: 'a1', shiftId: 's1', nurseId: 'n1', status: 'pending', appliedAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'a2', shiftId: 's2', nurseId: 'n1', status: 'accepted', appliedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'a3', shiftId: 's3', nurseId: 'n1', status: 'declined', appliedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'a4', shiftId: 's4', nurseId: 'n1', status: 'completed', appliedAt: new Date(Date.now() - 5 * 86400000).toISOString(), hospitalRating: 5 },
];

export const notifications: Notification[] = [
  { id: 'n1', type: 'new-match', title: 'New shift match', body: 'ICU night shift at Black Lion Hospital matches your preferences.', link: '/nurse/browse', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n2', type: 'shift-accepted', title: 'Application accepted', body: 'Your application for ER day shift at MCM General was accepted.', link: '/nurse/my-shifts', read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'n3', type: 'credential-expiring', title: 'Credential expiring soon', body: 'ICU Training Certificate expires in 20 days.', link: '/nurse/profile', read: true, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
];
