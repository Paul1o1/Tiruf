import { getServerUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { query } from '@/lib/db';

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user || user.userType !== 'worker') redirect('/auth/login');

  let name = user.email;
  try {
    const res = await query('SELECT full_name FROM worker_profiles WHERE user_id = $1', [user.userId]);
    if (res.rows[0]?.full_name) name = res.rows[0].full_name;
  } catch { /* db not connected yet */ }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fc]">
      <Navbar userType="worker" userName={name} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-4 md:p-8 pb-24 md:pb-12">
        {children}
      </main>
    </div>
  );
}
