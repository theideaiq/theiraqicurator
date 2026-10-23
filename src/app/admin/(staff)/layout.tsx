import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/admin/AdminShell';
import { NotStaff } from '@/components/admin/NotStaff';

export const dynamic = 'force-dynamic';

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect('/admin/login');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  // `is_staff` comes from the platform migration. If it hasn't been run yet,
  // let signed-in users through and show the setup checklist instead.
  const { data: isStaff, error } = await supabase.rpc('is_staff');
  const migrated = !error;
  if (migrated && !isStaff) return <NotStaff email={user.email ?? ''} />;

  return (
    <AdminShell email={user.email ?? ''} migrated={migrated}>
      {children}
    </AdminShell>
  );
}
