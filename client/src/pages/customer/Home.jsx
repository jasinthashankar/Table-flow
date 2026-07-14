import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck2, Clock3, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Home = () => {
  const { isAuthenticated, user } = useAuthStore();
  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="home-page page-enter">
      <section className="hero">
        <div className="hero__inner">
          <div>
            <span className="eyebrow">Hospitality operations platform</span>
            <h1>Every table. Every guest. <em>One clear rhythm.</em></h1>
            
            <div className="hero__actions">
              <Link to={isAuthenticated ? dashboardPath : '/register'} className="btn-primary">
                {isAuthenticated ? 'Open workspace' : 'Start with TableFlow'}
                <ArrowRight size={16} />
              </Link>
              {!isAuthenticated && <Link to="/login" className="btn-secondary">Sign in to your account</Link>}
            </div>
            <div className="hero__proof">
              <div className="proof-stack" aria-hidden="true">
                <span className="proof-avatar">GM</span>
                <span className="proof-avatar">FOH</span>
                <span className="proof-avatar">GST</span>
              </div>
              <span>Designed for guests, floor teams and restaurant administrators.</span>
            </div>
          </div>

          <div className="hero-console" aria-label="TableFlow operations preview">
            <div className="console-window">
              <div className="console-top">
                <div className="console-title">
                  <strong>Evening service</strong>
                  <span>Live floor overview · 7:30 PM</span>
                </div>
                <div className="console-live"><span className="live-dot" /> Live</div>
              </div>
              <div className="console-grid">
                <div className="console-panel">
                  <div className="console-panel__head"><span>Floor map</span><span>12 tables</span></div>
                  <div className="floor-map">
                    {['T01','T02','T03','T04','T05','T06','T07','T08'].map((table, index) => (
                      <span key={table} className={`floor-table ${[0,3,6].includes(index) ? 'is-active' : [2,7].includes(index) ? 'is-waiting' : ''}`}>{table}</span>
                    ))}
                  </div>
                </div>
                <div className="console-panel">
                  <div className="console-panel__head"><span>Occupancy</span><span>Today</span></div>
                  <div className="console-metric"><strong>76%</strong><span>Dining room active</span></div>
                  <div className="pulse-bars" aria-hidden="true">
                    {[38,52,43,72,61,85,68].map((height, i) => <span key={i} style={{ height: `${height}%` }} />)}
                  </div>
                </div>
                <div className="console-list">
                  <div className="console-ticket"><strong>Reservation confirmed</strong><span>4 guests · Window section</span></div>
                  <div className="console-ticket"><strong>Waitlist notified</strong><span>Party of 2 · 08 min wait</span></div>
                  <div className="console-ticket"><strong>Service request</strong><span>Table 06 · Assistance</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="platform-section">
        <div className="section-inner">
          <div className="section-heading">
            <span className="eyebrow">One operating system</span>
            <h2>Not another dashboard. A calmer dining room.</h2>
          </div>
          <div className="platform-mosaic">
            <article className="feature-panel feature-panel--dark">
              <span className="feature-panel__index">01 / FLOOR INTELLIGENCE</span>
              <h3>See the room as service actually moves.</h3>
              <p>Track availability, reserved tables, active seating, cleaning cycles and exceptions without hopping between spreadsheets.</p>
              <div className="seat-orbit" aria-hidden="true" />
            </article>
            <div className="feature-stack">
              <article className="feature-panel">
                <span className="feature-panel__index">02 / GUEST FLOW</span>
                <h3>Reservations and waitlists that stay in sync.</h3>
                <p>Prevent conflicts, manage arrivals and give every guest a visible path from booking to seated.</p>
              </article>
              <article className="feature-panel">
                <span className="feature-panel__index">03 / SERVICE DESK</span>
                <h3>Turn requests into accountable service.</h3>
                <p>Water, assistance, cleaning and billing requests become trackable tickets instead of disappearing into the room.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="workflow-section">
        <div className="section-inner">
          <span className="eyebrow" style={{ color: '#91a4ff' }}>Connected workflow</span>
          <div className="workflow-row">
            <div className="workflow-step"><CalendarCheck2 size={18} /><strong>Reserve</strong><p>Guests choose a slot and submit preferences through a validated booking flow.</p></div>
            <div className="workflow-step"><Clock3 size={18} /><strong>Coordinate</strong><p>Waitlist entries and estimates remain visible to guests and the operations team.</p></div>
            <div className="workflow-step"><ShieldCheck size={18} /><strong>Seat safely</strong><p>Role controls and conflict rules protect table assignments and customer records.</p></div>
            <div className="workflow-step"><Wrench size={18} /><strong>Serve</strong><p>Dining requests become structured tickets with ownership and clear status.</p></div>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default Home;
