import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock3, Sparkles, TableProperties, Users, Wrench } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';

const AdminDashboard = () => {
  const { adminData, fetchAdminDashboard, isLoading, error } = useDashboardStore();
  useEffect(() => { fetchAdminDashboard().catch(() => {}); }, [fetchAdminDashboard]);

  if (isLoading) return <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 page-enter"><Skeleton type="stat" count={4} /><Skeleton type="card" count={2} /></div>;

  const { stats = {}, recentReservations = [] } = adminData || {};
  const occupancyTotal = (stats.availableTables || 0) + (stats.occupiedTables || 0);
  const occupancy = occupancyTotal ? Math.round(((stats.occupiedTables || 0) / occupancyTotal) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 page-enter">
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div><span className="eyebrow">Live operations</span><h1 className="mt-4 mb-2 text-3xl md:text-4xl font-semibold tracking-[-.045em]">The dining room, at a glance.</h1><p className="text-sm text-slate-500">Reservations, floor capacity and guest requests from the current service window.</p></div>
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><span className="live-dot" /><div><strong className="block text-xs">System operational</strong><span className="text-[9px] uppercase tracking-wider text-slate-400">Atlas and API connected</span></div></div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[['Today’s reservations', stats.todaysReservations || 0, CalendarDays, '#3657ff', '/admin/reservations'],['Pending review', stats.pendingReservations || 0, Sparkles, '#e8a12d', '/admin/reservations?status=pending'],['Available tables', stats.availableTables || 0, TableProperties, '#3b8f59', '/admin/tables?status=available'],['Waitlist queue', stats.waitlistCount || 0, Clock3, '#8b5cc7', '/admin/waitlist']].map(([label,value,Icon,color,path]) => <Link key={label} to={path} className="stat-card group"><div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400">{label}</span><Icon size={18} style={{color}} /></div><div className="mt-auto flex items-end justify-between"><strong className="text-4xl font-semibold tracking-[-.055em] text-slate-900">{value}</strong><ArrowRight size={15} className="text-slate-300 transition-transform group-hover:translate-x-1" /></div></Link>)}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.35fr_.65fr] gap-5">
        <article className="tf-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100"><div><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">Booking feed</span><h2 className="mt-2 mb-0 text-lg">Recent reservations</h2></div><Link to="/admin/reservations" className="text-xs font-extrabold text-[#3657ff]">Open register</Link></div>
          {recentReservations.length ? <div className="overflow-x-auto"><table className="tf-table"><thead><tr><th>Reference</th><th>Guest</th><th>Service time</th><th>Status</th></tr></thead><tbody>{recentReservations.map((r) => <tr key={r.reservationNumber}><td><Link to="/admin/reservations" className="font-extrabold text-[#3657ff]">{r.reservationNumber}</Link></td><td><strong className="block text-slate-800">{r.guestName}</strong><span className="text-[10px] text-slate-400">{r.guestCount || '—'} guests</span></td><td>{new Date(r.reservationDate).toLocaleDateString()} · {r.timeSlot}</td><td><StatusBadge status={r.status} /></td></tr>)}</tbody></table></div> : <div className="py-12 text-center text-sm text-slate-500">No reservations recorded yet.</div>}
        </article>

        <div className="grid gap-5">
          <article className="relative overflow-hidden rounded-[20px] bg-[#172033] p-6 text-white shadow-[0_22px_50px_rgba(23,32,51,.16)]">
            <span className="text-[9px] font-extrabold uppercase tracking-[.14em] text-slate-500">Floor utilisation</span>
            <div className="mt-5 flex items-end justify-between"><div><strong className="block text-5xl font-semibold tracking-[-.06em] text-white">{occupancy}%</strong><span className="text-xs text-slate-400">estimated occupancy</span></div><div className="relative grid h-20 w-20 place-items-center rounded-full" style={{background:`conic-gradient(#6f86ff ${occupancy}%, rgba(255,255,255,.08) 0)`}}><div className="h-14 w-14 rounded-full bg-[#172033]" /></div></div>
            <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/[.07] bg-white/[.035] p-3"><span className="block text-[9px] uppercase tracking-wider text-slate-500">Available</span><strong className="mt-1 block text-xl text-white">{stats.availableTables || 0}</strong></div><div className="rounded-xl border border-white/[.07] bg-white/[.035] p-3"><span className="block text-[9px] uppercase tracking-wider text-slate-500">Occupied</span><strong className="mt-1 block text-xl text-white">{stats.occupiedTables || 0}</strong></div></div>
          </article>
          <article className="tf-card p-5">
            <span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">Attention queue</span>
            <div className="mt-4 grid gap-2">
              <Link to="/admin/service-requests" className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="flex items-center gap-2 text-xs font-bold"><Wrench size={15} className="text-[#ff6b5f]" /> Open requests</span><strong>{stats.openServiceRequests || 0}</strong></Link>
              <Link to="/admin/customers" className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="flex items-center gap-2 text-xs font-bold"><Users size={15} className="text-[#3657ff]" /> Guest records</span><strong>{stats.totalGuests || 0}</strong></Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
