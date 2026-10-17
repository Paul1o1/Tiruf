import { shifts, hospitals, applications, notifications, nurse } from '@/data/mock';
import { Shift, Application, Hospital, Notification, Nurse } from '@/types/tiruf';

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export async function fetchShifts(filters?: any): Promise<Shift[]> {
  await delay();
  let list = [...shifts];
  if (filters?.ward) list = list.filter(s => s.ward === filters.ward);
  if (filters?.specialty) list = list.filter(s => s.specialty === filters.specialty);
  if (filters?.date) list = list.filter(s => s.date === filters.date);
  if (filters?.minPay) list = list.filter(s => s.ratePerHour >= Number(filters.minPay));
  if (filters?.today) list = list.filter(s => s.date === new Date().toISOString().slice(0, 10));
  return list;
}

export async function fetchHospitals(): Promise<Hospital[]> {
  await delay();
  return hospitals;
}

export async function fetchApplications(): Promise<Application[]> {
  await delay();
  return applications;
}

export async function fetchNotifications(): Promise<Notification[]> {
  await delay();
  return notifications;
}

export async function fetchNurse(): Promise<Nurse> {
  await delay();
  return nurse;
}

export async function applyToShift(shiftId: string): Promise<Application> {
  await delay(500);
  const newApp: Application = {
    id: `a_${Date.now()}`,
    shiftId,
    nurseId: 'n1',
    status: 'pending',
    appliedAt: new Date().toISOString(),
  };
  applications.push(newApp);
  const s = shifts.find(x => x.id === shiftId);
  if (s) s.applied = true;
  return newApp;
}

export async function withdrawApplication(appId: string): Promise<void> {
  await delay(400);
  const a = applications.find(x => x.id === appId);
  if (a) {
    a.status = 'withdrawn';
    a.withdrawnAt = new Date().toISOString();
  }
}

export async function fetchShiftById(id: string): Promise<Shift | undefined> {
  await delay();
  return shifts.find(s => s.id === id);
}
