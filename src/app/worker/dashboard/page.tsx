import { getServerUser } from '@/lib/auth';
import { query } from '@/lib/db';
import WorkerDashboardClient, { type ShiftItem, type ApplicationItem } from '@/components/WorkerDashboardClient';

interface WorkerRow {
  id: number;
  full_name: string;
  cadre: string;
  years_experience: number;
  shifts_completed: number;
  avg_rating: number;
  rating_count: number;
}

const dayOffset = (n: number) =>
  new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

const DEMO_SHIFTS: ShiftItem[] = [
  {
    id: 1,
    role_needed: 'Nurse',
    shift_date: dayOffset(1),
    start_time: '19:00',
    end_time: '07:00',
    pay_etb: 1400,
    description: 'ICU Night Coverage',
    status: 'open',
    facility_name: 'St. Paul Hospital',
    location: 'Gulele, Addis Ababa',
    my_application: null,
  },
  {
    id: 2,
    role_needed: 'Nurse',
    shift_date: dayOffset(2),
    start_time: '07:00',
    end_time: '19:00',
    pay_etb: 1200,
    description: 'General Ward Day Support',
    status: 'open',
    facility_name: 'Black Lion Hospital',
    location: 'Lideta, Addis Ababa',
    my_application: null,
  },
  {
    id: 3,
    role_needed: 'Doctor',
    shift_date: dayOffset(2),
    start_time: '08:00',
    end_time: '20:00',
    pay_etb: 2500,
    description: 'Emergency Department Physician',
    status: 'open',
    facility_name: 'St. Paul Hospital',
    location: 'Gulele, Addis Ababa',
    my_application: 'pending',
  },
  {
    id: 4,
    role_needed: 'Midwife',
    shift_date: dayOffset(3),
    start_time: '06:00',
    end_time: '18:00',
    pay_etb: 950,
    description: 'Maternity & Labour Ward Support',
    status: 'open',
    facility_name: 'MCM General Hospital',
    location: 'Bole, Addis Ababa',
    my_application: null,
  },
  {
    id: 5,
    role_needed: 'Pharmacist',
    shift_date: dayOffset(4),
    start_time: '09:00',
    end_time: '17:00',
    pay_etb: 1100,
    description: 'Outpatient Pharmacy Shift',
    status: 'open',
    facility_name: 'Landmark Hospital',
    location: 'Nifas Silk, Addis Ababa',
    my_application: null,
  },
  {
    id: 6,
    role_needed: 'Lab Technician',
    shift_date: dayOffset(5),
    start_time: '07:00',
    end_time: '15:00',
    pay_etb: 800,
    description: 'Emergency Blood Bank & Lab',
    status: 'open',
    facility_name: 'Hayat Hospital',
    location: 'Kirkos, Addis Ababa',
    my_application: 'confirmed',
  },
];

const DEMO_APPS: ApplicationItem[] = [
  {
    id: 1,
    role_needed: 'Nurse',
    facility_name: 'St. Paul Hospital',
    status: 'confirmed',
    shift_date: dayOffset(1),
    pay_etb: 1400,
  },
  {
    id: 2,
    role_needed: 'Doctor',
    facility_name: 'St. Paul Hospital',
    status: 'pending',
    shift_date: dayOffset(2),
    pay_etb: 2500,
  },
  {
    id: 3,
    role_needed: 'Lab Technician',
    facility_name: 'Hayat Hospital',
    status: 'confirmed',
    shift_date: dayOffset(5),
    pay_etb: 800,
  },
];

export default async function WorkerDashboard() {
  const user = await getServerUser();
  if (!user) return null;

  let worker: WorkerRow | null = null;
  let availableShifts: ShiftItem[] = [];
  let applications: ApplicationItem[] = [];
  let earningsTotal = 0;

  try {
    const wr = await query('SELECT * FROM worker_profiles WHERE user_id=$1', [user.userId]);
    worker = wr.rows[0] || null;
    if (worker) {
      const [sRes, aRes, eRes] = await Promise.all([
        query(
          `SELECT s.*, fp.facility_name, fp.location,
            (SELECT status FROM shift_applications WHERE shift_id=s.id AND worker_id=$1) as my_application
           FROM shifts s
           JOIN facility_profiles fp ON s.facility_id=fp.id
           WHERE s.status='open' AND s.shift_date>=CURRENT_DATE
           ORDER BY s.shift_date LIMIT 20`,
          [worker.id]
        ),
        query(
          `SELECT sa.id, sa.status, s.role_needed, s.shift_date, s.pay_etb, fp.facility_name
           FROM shift_applications sa
           JOIN shifts s ON sa.shift_id=s.id
           JOIN facility_profiles fp ON s.facility_id=fp.id
           WHERE sa.worker_id=$1
           ORDER BY sa.created_at DESC LIMIT 5`,
          [worker.id]
        ),
        query(
          `SELECT COALESCE(SUM(s.pay_etb), 0) as total
           FROM shift_applications sa
           JOIN shifts s ON sa.shift_id=s.id
           WHERE sa.worker_id=$1 AND sa.status='confirmed'`,
          [worker.id]
        ),
      ]);
      availableShifts = sRes.rows;
      applications    = aRes.rows;
      earningsTotal   = parseInt(eRes.rows[0]?.total || '0', 10);
    }
  } catch {
    /* database not yet connected, gracefully falls back to demo */
  }

  const isDemo = availableShifts.length === 0;
  const shiftsToShow = isDemo ? DEMO_SHIFTS : availableShifts;
  const appsToShow = isDemo ? DEMO_APPS : applications;
  const earningsToShow = isDemo ? 14850 : earningsTotal;

  const rawName = worker?.full_name || (user.email === 'abebe@tiruf.demo' ? 'Selam Tadesse' : user.email.split('@')[0]);
  const workerCadre = worker?.cadre
    ? `Certified Senior ${worker.cadre}`
    : 'Certified Senior Nurse';

  return (
    <WorkerDashboardClient
      workerName={rawName}
      workerCadre={workerCadre}
      isDemo={isDemo}
      initialShifts={shiftsToShow}
      initialApplications={appsToShow}
      earnings={earningsToShow}
    />
  );
}
