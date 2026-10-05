import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  Plus,
  RefreshCw,
  Save,
  Users,
  XCircle
} from 'lucide-react';
import { getAdminToken } from '../services/adminAuthService';

type CohortStatus = 'draft' | 'open' | 'full' | 'closed' | 'completed';
type PlanId = 'group' | 'small-group' | 'private';

interface Cohort {
  id: string;
  courseId: string;
  name: string;
  slug: string;
  status: CohortStatus;
  startDate: string | null;
  endDate: string | null;
  enrollmentDeadline: string | null;
  capacities: Record<PlanId, number>;
  seats: Record<PlanId, number>;
}

const emptyForm = {
  courseId: 'ai-automation-digital-business-systems',
  name: '',
  slug: '',
  status: 'draft' as CohortStatus,
  startDate: '',
  endDate: '',
  enrollmentDeadline: '',
  groupCapacity: 300,
  smallGroupCapacity: 5,
  privateCapacity: 1
};

function toInputDate(value: string | null) {
  return value ? value.slice(0, 10) : '';
}

function statusLabel(status: CohortStatus) {
  return status === 'open' ? 'Open for enrollment' : status.charAt(0).toUpperCase() + status.slice(1);
}

export const AcademyCohortAdminPanel: React.FC = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [activeCohort, setActiveCohort] = useState<Cohort | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totals = useMemo(() => ({
    total: cohorts.length,
    open: cohorts.filter(c => c.status === 'open').length,
    full: cohorts.filter(c => c.status === 'full').length,
    completed: cohorts.filter(c => c.status === 'completed').length
  }), [cohorts]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getAdminToken();
      const res = await fetch('/api/academy/cohort/admin', {
        headers: { Authorization: `Bearer ${token || ''}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to load cohorts.');
      setCohorts(data.cohorts || []);
      setActiveCohort(data.activeCohort || null);
    } catch (e: any) {
      setError(e.message || 'Unable to load cohorts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const beginCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const beginEdit = (cohort: Cohort) => {
    setEditingId(cohort.id);
    setForm({
      courseId: cohort.courseId,
      name: cohort.name,
      slug: cohort.slug,
      status: cohort.status,
      startDate: toInputDate(cohort.startDate),
      endDate: toInputDate(cohort.endDate),
      enrollmentDeadline: toInputDate(cohort.enrollmentDeadline),
      groupCapacity: cohort.capacities.group,
      smallGroupCapacity: cohort.capacities['small-group'],
      privateCapacity: cohort.capacities.private
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = await getAdminToken();
      const endpoint = editingId ? `/api/academy/cohort/admin/${editingId}` : '/api/academy/cohort/admin';
      const res = await fetch(endpoint, {
        method: editingId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to save cohort.');
      setShowForm(false);
      await load();
    } catch (e: any) {
      setError(e.message || 'Unable to save cohort.');
    } finally {
      setSaving(false);
    }
  };

  const remainingTotal = activeCohort
    ? activeCohort.seats.group + activeCohort.seats['small-group'] + activeCohort.seats.private
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-purple-300 font-semibold">Academy Operations</p>
          <h2 className="text-2xl font-bold text-white mt-1">Cohort Management</h2>
          <p className="text-sm text-neutral-400 mt-1">Control registration windows, capacities and live training seats.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-3 py-2 rounded-xl bg-neutral-900 border border-purple-900/40 text-neutral-300 hover:text-white">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={beginCreate} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Cohort
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-800/50 bg-red-950/30 text-red-300 px-4 py-3 text-sm">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Total Cohorts', totals.total],
          ['Open', totals.open],
          ['Full', totals.full],
          ['Completed', totals.completed]
        ].map(([label, value]) => (
          <div key={String(label)} className="p-5 rounded-2xl bg-[#0B051D] border border-purple-900/40">
            <div className="text-xs text-neutral-400">{label}</div>
            <div className="text-3xl font-bold text-white mt-2">{value}</div>
          </div>
        ))}
      </div>

      {activeCohort && (
        <div className="rounded-3xl bg-gradient-to-br from-purple-950/60 to-[#0B051D] border border-purple-700/40 p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 rounded-full px-3 py-1">
                <CircleDot className="w-3 h-3" /> ACTIVE COHORT
              </div>
              <h3 className="text-2xl font-bold text-white mt-3">{activeCohort.name}</h3>
              <p className="text-sm text-neutral-400 mt-1">{activeCohort.courseId}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-neutral-300">
                <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-purple-300" /> {activeCohort.startDate ? new Date(activeCohort.startDate).toLocaleDateString() : 'Start date not set'}</span>
                <span className="flex items-center gap-2"><Clock3 className="w-4 h-4 text-yellow-300" /> Deadline: {activeCohort.enrollmentDeadline ? new Date(activeCohort.enrollmentDeadline).toLocaleDateString() : 'Not set'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0 lg:min-w-[430px]">
              <SeatCard label="Group" remaining={activeCohort.seats.group} capacity={activeCohort.capacities.group} />
              <SeatCard label="Small Group" remaining={activeCohort.seats['small-group']} capacity={activeCohort.capacities['small-group']} />
              <SeatCard label="Private" remaining={activeCohort.seats.private} capacity={activeCohort.capacities.private} />
              <SeatCard label="Total Left" remaining={remainingTotal} capacity={Object.values(activeCohort.capacities).reduce((a,b)=>a+b,0)} />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl bg-[#0B051D] border border-purple-900/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-purple-900/30 flex items-center justify-between">
          <div className="font-semibold text-white">All Cohorts</div>
          <div className="text-xs text-neutral-500">{cohorts.length} records</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-6 py-4">Cohort</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Start</th><th className="px-6 py-4">Seats</th><th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map(cohort => (
                <tr key={cohort.id} className="border-t border-purple-900/20">
                  <td className="px-6 py-4"><div className="font-semibold text-white">{cohort.name}</div><div className="text-xs text-neutral-500">{cohort.courseId}</div></td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">{cohort.status === 'open' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-neutral-500" />}{statusLabel(cohort.status)}</span></td>
                  <td className="px-6 py-4 text-neutral-300">{cohort.startDate ? new Date(cohort.startDate).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 text-xs">
                      <span>G <b className="text-white">{cohort.seats.group}</b>/{cohort.capacities.group}</span>
                      <span>SG <b className="text-white">{cohort.seats['small-group']}</b>/{cohort.capacities['small-group']}</span>
                      <span>P <b className="text-white">{cohort.seats.private}</b>/{cohort.capacities.private}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><button onClick={() => beginEdit(cohort)} className="text-purple-300 hover:text-white font-semibold">Manage</button></td>
                </tr>
              ))}
              {!loading && cohorts.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500">No cohorts created yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={save} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0C0620] border border-purple-700/40 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-xl font-bold text-white">{editingId ? 'Manage Cohort' : 'Create Cohort'}</h3><p className="text-sm text-neutral-400 mt-1">Publishing a cohort as Open closes another open cohort for the same course.</p></div>
              <button type="button" onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-white">×</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Course ID" value={form.courseId} onChange={v => setForm({...form, courseId:v})} />
              <Field label="Cohort Name" value={form.name} onChange={v => setForm({...form, name:v})} />
              <Field label="Slug" value={form.slug} onChange={v => setForm({...form, slug:v})} />
              <label className="text-sm text-neutral-300">Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value as CohortStatus})} className="mt-1 w-full rounded-xl bg-neutral-950 border border-purple-900/40 px-3 py-2.5 text-white"><option value="draft">Draft</option><option value="open">Open</option><option value="full">Full</option><option value="closed">Closed</option><option value="completed">Completed</option></select></label>
              <Field label="Start Date" type="date" value={form.startDate} onChange={v => setForm({...form,startDate:v})} />
              <Field label="End Date" type="date" value={form.endDate} onChange={v => setForm({...form,endDate:v})} />
              <Field label="Enrollment Deadline" type="date" value={form.enrollmentDeadline} onChange={v => setForm({...form,enrollmentDeadline:v})} />
              <Field label="Group Capacity" type="number" value={String(form.groupCapacity)} onChange={v => setForm({...form,groupCapacity:Number(v)})} />
              <Field label="Small Group Capacity" type="number" value={String(form.smallGroupCapacity)} onChange={v => setForm({...form,smallGroupCapacity:Number(v)})} />
              <Field label="Private Capacity" type="number" value={String(form.privateCapacity)} onChange={v => setForm({...form,privateCapacity:Number(v)})} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 rounded-xl border border-neutral-800 text-neutral-300">Cancel</button>
              <button disabled={saving} className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Cohort'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

function SeatCard({label,remaining,capacity}:{label:string;remaining:number;capacity:number}) {
  return <div className="rounded-2xl bg-neutral-950/70 border border-purple-900/30 p-4"><div className="text-[11px] uppercase text-neutral-500">{label}</div><div className="text-2xl font-bold text-white mt-1">{remaining}</div><div className="text-xs text-neutral-500">of {capacity} remaining</div></div>;
}

function Field({label,value,onChange,type='text'}:{label:string;value:string;onChange:(v:string)=>void;type?:string}) {
  return <label className="text-sm text-neutral-300">{label}<input required={label!=='End Date' && label!=='Enrollment Deadline'} type={type} value={value} onChange={e=>onChange(e.target.value)} className="mt-1 w-full rounded-xl bg-neutral-950 border border-purple-900/40 px-3 py-2.5 text-white outline-none focus:border-purple-500" /></label>;
}
