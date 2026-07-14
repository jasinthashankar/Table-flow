import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock3, Sparkles, Users, Wrench } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import useAuthStore from '../../store/useAuthStore';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';

const Dashboard = () => {
  const { guestData, fetchGuestDashboard, isLoading, error } = useDashboardStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => { fetchGuestDashboard().catch(() => {}); }, [fetchGuestDashboard]);

  if (isLoading) {
    return <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 page-enter"><Skeleton type="stat" count={3} /><Skeleton type="card" count={3} /></div>;
  }

  const {
    upcomingReservation = null,
    totalReservations = 0,
    activeWaitlistEntry = null,
    openServiceRequests = 0,
    recentReservations = [],
  } = guestData || {};

  const firstName = user?.name?.split(' ')[0] || 'Guest';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 page-enter">
      <section className="relative overflow-hidden rounded-[24px] bg-[#172033] text-white p-7 md:p-9 shadow-[0_24px_55px_rgba(23,32,51,.16)]">
        <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full border-[42px] border-white/[.035]" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#91a4ff]"><Sparkles size={14} /> Guest concierge</span>
            <h1 className="mt-4 mb-2 text-3xl md:text-4xl font-semibold tracking-[-.04em] text-white">Good to see you, {firstName}.</h1>
            <p className="max-w-xl text-sm leading-7 text-slate-400">Your next visit, waitlist position and service activity are arranged below in one calm view.</p>
          </div>
          <Link to="/reservations/new" className="btn-primary">Reserve a table <ArrowRight size={16} /></Link>
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <article className="stat-card">
          <div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400">Reservation history</span><CalendarDays size={17} className="text-[#3657ff]" /></div>
          <div className="mt-auto"><strong className="text-4xl font-semibold tracking-[-.05em] text-slate-900">{totalReservations}</strong><span className="ml-2 text-xs text-slate-400">visits</span></div>
        </article>
        <article className="stat-card">
          <div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400">Waitlist</span><Clock3 size={17} className="text-amber-500" /></div>
          <div className="mt-auto flex items-center gap-2">{activeWaitlistEntry ? <><StatusBadge status={activeWaitlistEntry.status} /><span className="text-xs text-slate-500">{activeWaitlistEntry.estimatedWaitMinutes ?? '—'} min</span></> : <strong className="text-lg text-slate-700">Not active</strong>}</div>
        </article>
        <article className="stat-card">
          <div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400">Open requests</span><Wrench size={17} className="text-[#ff6b5f]" /></div>
          <div className="mt-auto"><strong className="text-4xl font-semibold tracking-[-.05em] text-slate-900">{openServiceRequests}</strong><span className="ml-2 text-xs text-slate-400">tickets</span></div>
        </article>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.45fr_.75fr] gap-5">
        <article className="tf-card p-6 md:p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">Next touchpoint</span><h2 className="mt-2 mb-0 text-xl font-semibold">Upcoming reservation</h2></div>
            <CalendarDays size={21} className="text-[#3657ff]" />
          </div>
          {upcomingReservation ? (
            <div className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div><strong className="text-2xl tracking-[-.03em]">{upcomingReservation.reservationNumber}</strong><p className="mt-2 text-sm text-slate-500">{new Date(upcomingReservation.reservationDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · {upcomingReservation.timeSlot}</p></div>
                <StatusBadge status={upcomingReservation.status} />
              </div>
              <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl bg-slate-50 p-4">
                <div><span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Party</span><strong className="mt-1 block text-sm">{upcomingReservation.guestCount} guests</strong></div>
                <div><span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Preference</span><strong className="mt-1 block text-sm capitalize">{upcomingReservation.seatingPreference}</strong></div>
                <div><span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Table</span><strong className="mt-1 block text-sm">{upcomingReservation.assignedTable?.tableNumber || 'Pending'}</strong></div>
                <div><span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Occasion</span><strong className="mt-1 block text-sm capitalize">{upcomingReservation.occasion || 'None'}</strong></div>
              </div>
              <div className="mt-5 flex gap-3"><Link to={`/reservations/${upcomingReservation.reservationNumber}`} className="btn-secondary">View reservation</Link>{['confirmed','guest_arrived','seated'].includes(upcomingReservation.status) && <Link to="/service-requests" className="btn-primary"><Wrench size={15} /> Request service</Link>}</div>
            </div>
          ) : (
            <div className="py-12 text-center"><CalendarDays className="mx-auto text-slate-300" size={34} /><h3 className="mt-4 text-base">No visit scheduled</h3><p className="text-xs text-slate-500">Choose a future date and reserve a table in a few steps.</p><Link to="/reservations/new" className="btn-primary mt-4">Create reservation</Link></div>
          )}
        </article>

        <div className="grid gap-5">
          <article className="tf-card p-6">
            <div className="flex items-center justify-between"><div><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">Queue position</span><h2 className="mt-2 text-lg">Waitlist</h2></div><Clock3 size={20} className="text-amber-500" /></div>
            {activeWaitlistEntry ? <div className="mt-5 rounded-2xl bg-[#fff8e8] p-4"><StatusBadge status={activeWaitlistEntry.status} /><strong className="mt-4 block text-3xl tracking-[-.04em]">{activeWaitlistEntry.estimatedWaitMinutes ?? '—'} min</strong><span className="text-xs text-slate-500">estimated wait · {activeWaitlistEntry.guestCount} guests</span></div> : <p className="mt-5 text-sm leading-6 text-slate-500">You do not have an active waitlist entry.</p>}
            <Link to="/waitlist" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#3657ff]">Manage waitlist <ArrowRight size={14} /></Link>
          </article>
          <article className="tf-card p-6">
            <div className="flex items-center justify-between"><div><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">During your visit</span><h2 className="mt-2 text-lg">Service desk</h2></div><Wrench size={20} className="text-[#ff6b5f]" /></div>
            <p className="mt-4 text-xs leading-6 text-slate-500">Request water, assistance, cleaning or your bill from an active reservation.</p>
            <Link to="/service-requests" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#3657ff]">Open service desk <ArrowRight size={14} /></Link>
          </article>
        </div>
      </section>

      <section className="tf-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100"><div><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">History</span><h2 className="mt-2 mb-0 text-lg">Recent reservations</h2></div><Link to="/reservations" className="text-xs font-extrabold text-[#3657ff]">View all</Link></div>
        {recentReservations.length ? <div className="overflow-x-auto"><table className="tf-table"><thead><tr><th>Reference</th><th>Date and slot</th><th>Party</th><th>Status</th><th /></tr></thead><tbody>{recentReservations.map((r) => <tr key={r.reservationNumber}><td className="font-bold text-slate-800">{r.reservationNumber}</td><td>{new Date(r.reservationDate).toLocaleDateString()} · {r.timeSlot}</td><td><span className="inline-flex items-center gap-1"><Users size={13} /> {r.guestCount}</span></td><td><StatusBadge status={r.status} /></td><td><Link to={`/reservations/${r.reservationNumber}`} className="font-extrabold text-[#3657ff]">Open</Link></td></tr>)}</tbody></table></div> : <div className="py-10 text-center text-sm text-slate-500">No reservation history yet.</div>}
      </section>
    </div>
  );
};

export default Dashboard;
