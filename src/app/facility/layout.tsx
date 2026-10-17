import { getServerUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { query } from '@/lib/db';

export default async function FacilityLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user || user.userType !== 'facility') redirect('/auth/login');

  let name = user.email;
  try {
    const profileResult = await query(
      'SELECT facility_name FROM facility_profiles WHERE user_id = $1',
      [user.userId]
    );
    if (profileResult.rows[0]?.facility_name) name = profileResult.rows[0].facility_name;
  } catch { /* db not connected yet */ }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar userType="facility" userName={name} />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
