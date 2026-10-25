import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/staff/AdminShell';
import { NotStaff } from '@/components/staff/NotStaff';

export const dynamic = 'force-dynamic';

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/staff/login');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/staff/login');

  // `is_staff` comes from the platform migration. If it hasn't been run yet,
  // let signed-in users through and show the setup checklist instead.
  const { data: isStaff, error } = await supabase.rpc('is_staff');
  const migrated = !error;
  if (migrated && !isStaff) return <NotStaff email={user.email ?? ''} />;

  // Missing function (roles migration not run yet) simply means "not superadmin".
  const { data: isSuperadmin } = await supabase.rpc('is_superadmin');

  return (
    <AdminShell email={user.email ?? ''} migrated={migrated} superadmin={!!isSuperadmin}>
      {children}
    </AdminShell>
  );
}
