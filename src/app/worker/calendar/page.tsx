import { getServerUser } from '@/lib/auth';
import { query } from '@/lib/db';
import WorkerCalendarClient, { type CalendarShift } from '@/components/WorkerCalendarClient';

const dayOffset = (n: number) =>
  new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

const DEMO_UPCOMING: CalendarShift[] = [
  {
    id: 1,
    role_needed: 'Nurse',
    facility_name: 'St. Paul Hospital',
    location: 'Gulele, Addis Ababa',
    shift_date: dayOffset(1),
    start_time: '19:00',
    end_time: '07:00',
    pay_etb: 1400,
    status: 'confirmed',
  },
  {
    id: 2,
    role_needed: 'Nurse',
    facility_name: 'Black Lion Hospital',
    location: 'Lideta, Addis Ababa',
    shift_date: dayOffset(4),
    start_time: '07:00',
    end_time: '19:00',
    pay_etb: 1200,
    status: 'confirmed',
  },
  {
    id: 3,
    role_needed: 'Nurse',
    facility_name: 'MCM General Hospital',
    location: 'Bole, Addis Ababa',
    shift_date: dayOffset(8),
    start_time: '08:00',
    end_time: '20:00',
    pay_etb: 1350,
    status: 'confirmed',
  },
];

const DEMO_COMPLETED: CalendarShift[] = [
  {
    id: 101,
    role_needed: 'Nurse',
    facility_name: 'Black Lion Hospital',
    location: 'Lideta, Addis Ababa',
    shift_date: dayOffset(-4),
    start_time: '07:00',
    end_time: '19:00',
    pay_etb: 1200,
    status: 'completed',
  },
  {
    id: 102,
    role_needed: 'Nurse',
    facility_name: 'Hayat Hospital',
    location: 'Kirkos, Addis Ababa',
    shift_date: dayOffset(-10),
    start_time: '08:00',
    end_time: '20:00',
    pay_etb: 1100,
    status: 'completed',
  },
  {
    id: 103,
    role_needed: 'Nurse',
    facility_name: 'Landmark Hospital',
    location: 'Nifas Silk, Addis Ababa',
    shift_date: dayOffset(-18),
    start_time: '09:00',
    end_time: '17:00',
    pay_etb: 950,
    status: 'completed',
  },
];

export default async function WorkerCalendarPage() {
  const user = await getServerUser();
  if (!user) return null;

  let upcoming: CalendarShift[] = [];
  let completed: CalendarShift[] = [];
  let isDemo = false;

  try {
    const wr = await query('SELECT id FROM worker_profiles WHERE user_id=$1', [user.userId]);
    const wid = wr.rows[0]?.id;
    if (wid) {
      const [upRes, compRes] = await Promise.all([
        query(
          `SELECT s.*, fp.facility_name, fp.location, sa.status
           FROM shifts s
           JOIN facility_profiles fp ON s.facility_id=fp.id
           JOIN shift_applications sa ON sa.shift_id=s.id
           WHERE sa.worker_id=$1 AND sa.status='confirmed' AND s.shift_date>=CURRENT_DATE
           ORDER BY s.shift_date`,
          [wid]
        ),
        query(
          `SELECT s.*, fp.facility_name, fp.location, sa.status
           FROM shifts s
           JOIN facility_profiles fp ON s.facility_id=fp.id
           JOIN shift_applications sa ON sa.shift_id=s.id
           WHERE sa.worker_id=$1 AND sa.status='completed'
           ORDER BY s.shift_date DESC LIMIT 15`,
          [wid]
        ),
      ]);
      upcoming  = upRes.rows;
      completed = compRes.rows;
    }
  } catch {
    isDemo = true;
  }

  if (isDemo || (upcoming.length === 0 && completed.length === 0)) {
    upcoming  = DEMO_UPCOMING;
    completed = DEMO_COMPLETED;
    isDemo    = true;
  }

  return (
    <WorkerCalendarClient
      initialUpcoming={upcoming}
      initialCompleted={completed}
      isDemo={isDemo}
    />
  );
}
