'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import { Button, Empty, ErrorNote, Field, PageTitle, Pill, formatDate, inputClass } from '@/components/staff/ui';
import { addMember, listMembers, removeMember, resendInvite, updateMember, type Member, type Role } from './actions';

const ROLES: { value: Role; label: string; note: string }[] = [
  { value: 'editor', label: 'Ustaz · أستاذ', note: 'Runs the classes: curations, museum, timetable, syllabus, quiz, manifesto, partners, inbox.' },
  { value: 'superadmin', label: 'Headteacher · المدير', note: 'Everything an ustaz can do, plus hiring and transferring faculty.' },
];

const STATUS: Record<Member['status'], { tone: 'live' | 'draft' | 'muted' | 'alert'; label: string }> = {
  active: { tone: 'live', label: 'Active' },
  invited: { tone: 'draft', label: 'Invite sent' },
  'no-account': { tone: 'alert', label: 'No login yet' },
  unknown: { tone: 'muted', label: 'On the list' },
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [canInvite, setCanInvite] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ email: '', name: '', role: 'editor' as Role, invite: true });

  const load = useCallback(async () => {
    const res = await listMembers();
    if (res.ok) {
      setMembers(res.data.members);
      setCanInvite(res.data.canInvite);
    } else {
      setError(res.error);
      setMembers([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    listMembers().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setMembers(res.data.members);
        setCanInvite(res.data.canInvite);
      } else {
        setError(res.error);
        setMembers([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Run an action, show its outcome, then refresh the list. */
  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    startTransition(async () => {
      setError(null);
      setNotice(null);
      const res = await fn();
      if (res.ok) setNotice(success);
      else setError(res.error ?? 'Something went wrong.');
      await load();
    });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const invite = form.invite && canInvite;
    act(async () => {
      const res = await addMember({ ...form, invite });
      if (res.ok) setForm({ email: '', name: '', role: 'editor', invite: true });
      return res;
    }, invite ? `Added ${form.email} and emailed an invite.` : `Added ${form.email} to the team.`);
  };

  return (
    <div>
      <PageTitle kicker="الكادر · Who teaches here" title="Faculty" />

      {!canInvite && (
        <p className="mb-6 border-2 border-ink bg-saffron/40 p-4 text-sm">
          <strong className="font-mono text-xs uppercase">Invites are off.</strong> Add <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to the
          Vercel project’s environment variables (Supabase → Project Settings → API → <em>service_role</em>) and redeploy. Until then you can still add
          people to the list, but they need a login created in Supabase.
        </p>
      )}
      <ErrorNote message={error} />
      {notice && (
        <p role="status" className="mb-4 border-2 border-teal bg-teal/10 px-4 py-3 text-sm">
          {notice}
        </p>
      )}

      <form onSubmit={add} className="mb-12 border-2 border-ink bg-paper-2 hard-shadow p-5 md:p-8 grid md:grid-cols-2 gap-5">
        <h2 className="md:col-span-2 font-display italic text-3xl">Hire someone</h2>
        <Field label="Email">
          {(id) => <input id={id} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />}
        </Field>
        <Field label="Name">
          {(id) => <input id={id} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />}
        </Field>
        <fieldset className="md:col-span-2">
          <legend className="font-mono text-[11px] uppercase text-ink/70 mb-2">Role</legend>
          <div className="grid sm:grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <label key={r.value} className={`cursor-pointer border-2 p-4 ${form.role === r.value ? 'border-ink bg-paper' : 'border-ink/30'}`}>
                <span className="flex items-center gap-2 font-mono text-xs uppercase">
                  <input type="radio" name="role" checked={form.role === r.value} onChange={() => setForm({ ...form, role: r.value })} className="accent-ink" />
                  {r.label}
                </span>
                <span className="block mt-1 text-sm text-ink/70">{r.note}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4">
          <label className={`flex items-center gap-2 text-sm ${canInvite ? '' : 'opacity-50'}`}>
            <input type="checkbox" checked={form.invite && canInvite} disabled={!canInvite} onChange={(e) => setForm({ ...form, invite: e.target.checked })} className="w-4 h-4 accent-ink" />
            Email them an invite to set a password
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? 'Working…' : '+ Add to the faculty'}
          </Button>
        </div>
      </form>

      {members && members.length === 0 && !error && <Empty>No one on the faculty yet.</Empty>}

      <ul className="border-t-2 border-ink">
        {members?.map((m) => (
          <li key={m.email} className="border-b-2 border-ink py-4 grid md:grid-cols-[1fr_auto] gap-4 items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2 mb-1">
                <Pill tone={STATUS[m.status].tone}>{STATUS[m.status].label}</Pill>
                {m.isYou && <Pill tone="muted">You</Pill>}
              </div>
              <p className="font-display text-2xl leading-tight truncate">{m.name || m.email}</p>
              <p className="font-mono text-[11px] text-ink/60 break-all">
                {m.email}
                {m.lastSignIn && ` · last in ${formatDate(m.lastSignIn)}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label={`Role for ${m.email}`}
                value={m.role}
                disabled={pending}
                onChange={(e) => act(() => updateMember(m.email, { role: e.target.value as Role }), `${m.email} is now ${e.target.value === 'superadmin' ? 'a headteacher' : 'an ustaz'}.`)}
                className={`${inputClass} !w-auto !py-2 font-mono !text-xs uppercase`}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              {canInvite && m.status !== 'active' && (
                <Button variant="ghost" disabled={pending} onClick={() => act(() => resendInvite(m.email), `Invite sent to ${m.email}.`)}>
                  <Mail size={14} /> {m.status === 'invited' ? 'Resend' : 'Invite'}
                </Button>
              )}
              {!m.isYou && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm(`Transfer ${m.email} to another school? They lose access to the Teachers’ Lounge.`)) return;
                    const deleteAccount = canInvite && confirm('Also delete their login entirely? (Cancel keeps the login but removes all access to the lounge.)');
                    act(() => removeMember(m.email, deleteAccount), `${m.email} has been transferred to another school.`);
                  }}
                  className="p-2 border-2 border-brick text-brick rounded-full hover:bg-brick hover:text-paper disabled:opacity-40"
                  aria-label={`Transfer ${m.email} to another school`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
