'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export type Role = 'superadmin' | 'editor';

export type Member = {
  email: string;
  name: string | null;
  role: Role;
  /** 'active' = has signed in; 'invited' = account exists, never signed in; 'no-account' = on the list only; 'unknown' = no service key to check */
  status: 'active' | 'invited' | 'no-account' | 'unknown';
  lastSignIn: string | null;
  isYou: boolean;
};

type Result<T = null> = { ok: true; data: T } | { ok: false; error: string };

const NO_KEY =
  'Invites need the SUPABASE_SERVICE_ROLE_KEY environment variable on Vercel (Supabase → Project Settings → API → service_role).';

/** Every action re-checks the caller: server actions are public endpoints. */
async function requireSuperadmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error('Sign in first.');
  const { data: ok, error } = await supabase.rpc('is_superadmin');
  if (error || !ok) throw new Error('Only the headteacher can manage the faculty.');
  return { supabase, email: user.email.toLowerCase() };
}

async function run<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function siteOrigin() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

async function sendInvite(email: string) {
  const admin = createAdminClient();
  if (!admin) throw new Error(NO_KEY);
  // The invite link lands on the login page, which picks the session out of
  // the URL and forwards to the account page to choose a password.
  const redirectTo = `${await siteOrigin()}/staff/login?next=${encodeURIComponent('/staff/account?reset=1')}`;
  const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
  if (error) {
    if (/already been registered|already exists/i.test(error.message)) {
      throw new Error(`${email} already has an account — they can sign in at /staff/login (or use “Forgot password”).`);
    }
    throw new Error(error.message);
  }
}

export async function listMembers(): Promise<Result<{ members: Member[]; canInvite: boolean }>> {
  return run(async () => {
    const { supabase, email: me } = await requireSuperadmin();
    const { data: rows, error } = await supabase.from('staff').select('email, name, role').order('created_at');
    if (error) throw new Error(error.message);

    const admin = createAdminClient();
    const accounts = new Map<string, { lastSignIn: string | null }>();
    if (admin) {
      const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
      for (const u of data?.users ?? []) {
        if (u.email) accounts.set(u.email.toLowerCase(), { lastSignIn: u.last_sign_in_at ?? null });
      }
    }

    const members: Member[] = (rows ?? []).map((r) => {
      const account = accounts.get(r.email.toLowerCase());
      return {
        email: r.email,
        name: r.name,
        role: r.role as Role,
        status: !admin ? 'unknown' : account ? (account.lastSignIn ? 'active' : 'invited') : 'no-account',
        lastSignIn: account?.lastSignIn ?? null,
        isYou: r.email.toLowerCase() === me,
      };
    });
    return { members, canInvite: !!admin };
  });
}

export async function addMember(input: { email: string; name: string; role: Role; invite: boolean }): Promise<Result<{ invited: boolean }>> {
  return run(async () => {
    const { supabase } = await requireSuperadmin();
    const email = input.email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('That doesn’t look like an email address.');
    const role: Role = input.role === 'superadmin' ? 'superadmin' : 'editor';

    const { error } = await supabase.from('staff').insert({ email, name: input.name.trim() || null, role });
    if (error) throw new Error(error.code === '23505' ? `${email} is already on the team.` : error.message);

    if (!input.invite) return { invited: false };
    try {
      await sendInvite(email);
      return { invited: true };
    } catch (e) {
      // they're on the list either way; surface why no email went out
      throw new Error(`Added to the team, but no invite was sent: ${e instanceof Error ? e.message : e}`);
    }
  });
}

export async function resendInvite(email: string): Promise<Result> {
  return run(async () => {
    await requireSuperadmin();
    await sendInvite(email.toLowerCase());
    return null;
  });
}

async function superadminCount(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { count } = await supabase.from('staff').select('email', { count: 'exact', head: true }).eq('role', 'superadmin');
  return count ?? 0;
}

export async function updateMember(email: string, changes: { name?: string; role?: Role }): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireSuperadmin();
    const target = email.toLowerCase();
    if (changes.role === 'editor') {
      const { data: current } = await supabase.from('staff').select('role').eq('email', target).single();
      if (current?.role === 'superadmin' && (await superadminCount(supabase)) <= 1) {
        throw new Error('The school needs at least one headteacher.');
      }
    }
    const patch: { name?: string | null; role?: Role } = {};
    if (changes.name !== undefined) patch.name = changes.name.trim() || null;
    if (changes.role) patch.role = changes.role;
    const { error } = await supabase.from('staff').update(patch).eq('email', target);
    if (error) throw new Error(error.message);
    return null;
  });
}

export async function removeMember(email: string, deleteAccount: boolean): Promise<Result> {
  return run(async () => {
    const { supabase, email: me } = await requireSuperadmin();
    const target = email.toLowerCase();
    if (target === me) throw new Error('You can’t transfer yourself — ask another headteacher.');
    const { data: current } = await supabase.from('staff').select('role').eq('email', target).single();
    if (current?.role === 'superadmin' && (await superadminCount(supabase)) <= 1) {
      throw new Error('The school needs at least one headteacher.');
    }
    const { error } = await supabase.from('staff').delete().eq('email', target);
    if (error) throw new Error(error.message);

    if (deleteAccount) {
      const admin = createAdminClient();
      if (!admin) throw new Error(`Removed from the team, but the login wasn’t deleted. ${NO_KEY}`);
      const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const user = data?.users.find((u) => u.email?.toLowerCase() === target);
      if (user) {
        // the client can throw (not just return an error), so catch both
        const delError = await admin.auth.admin
          .deleteUser(user.id)
          .then((r) => r.error)
          .catch((e: unknown) => (e instanceof Error ? e : new Error(String(e))));
        if (delError) throw new Error(`Removed from the team, but deleting the login failed: ${delError.message}`);
      }
    }
    return null;
  });
}
