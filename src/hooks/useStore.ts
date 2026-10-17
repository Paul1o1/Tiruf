import { create } from 'zustand';
import { Shift, Application, Notification, Nurse } from '@/types/tiruf';

interface State {
  nurse?: Nurse;
  shifts: Shift[];
  applications: Application[];
  notifications: Notification[];
  setNurse: (n: Nurse) => void;
  setShifts: (s: Shift[]) => void;
  setApps: (a: Application[]) => void;
  setNotifs: (n: Notification[]) => void;
}

export const useStore = create<State>((set) => ({
  shifts: [],
  applications: [],
  notifications: [],
  setNurse: (nurse) => set({ nurse }),
  setShifts: (shifts) => set({ shifts }),
  setApps: (applications) => set({ applications }),
  setNotifs: (notifications) => set({ notifications }),
}));
