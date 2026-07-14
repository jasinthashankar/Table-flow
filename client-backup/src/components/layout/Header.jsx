import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  Sparkles,
  TableProperties,
  UserRound,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const guestLinks = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Reservations', path: '/reservations', icon: CalendarDays },
  { name: 'Waitlist', path: '/waitlist', icon: Clock3 },
  { name: 'Service desk', path: '/service-requests', icon: Wrench },
  { name: 'Profile', path: '/profile', icon: UserRound },
];

const adminLinks = [
  { name: 'Operations', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Reservations', path: '/admin/reservations', icon: CalendarDays },
  { name: 'Floor plan', path: '/admin/tables', icon: TableProperties },
  { name: 'Waitlist', path: '/admin/waitlist', icon: Clock3 },
  { name: 'Service desk', path: '/admin/service-requests', icon: Wrench },
  { name: 'Guest book', path: '/admin/customers', icon: Users },
];

const Brand = ({ compact = false }) => (
  <div className="brand-lockup">
    <div className="brand-symbol" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
    {!compact && (
      <div>
        <strong>TableFlow</strong>
        <small>Hospitality operations</small>
      </div>
    )}
  </div>
);

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const links = user?.role === 'admin' ? adminLinks : guestLinks;
  const landingPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <header className="public-nav">
        <div className="public-nav__inner">
          <Link to="/" aria-label="TableFlow home"><Brand /></Link>
          <nav className="public-nav__links" aria-label="Public navigation">
            <a href="/#platform">Platform</a>
            <a href="/#workflow">Workflow</a>
            <a href="/#technology">Technology</a>
          </nav>
          <div className="public-nav__actions">
            <Link to="/login" className="nav-text-link">Sign in</Link>
            <Link to="/register" className="btn-primary btn-compact">Create account</Link>
          </div>
          <button
            className="public-mobile-trigger"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="public-mobile-menu">
            <a href="/#platform" onClick={() => setMobileOpen(false)}>Platform</a>
            <a href="/#workflow" onClick={() => setMobileOpen(false)}>Workflow</a>
            <a href="/#technology" onClick={() => setMobileOpen(false)}>Technology</a>
            <Link to="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
            <Link to="/register" className="btn-primary" onClick={() => setMobileOpen(false)}>Create account</Link>
          </div>
        )}
      </header>
    );
  }

  return (
    <>
      <aside className={`app-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="sidebar-head">
          <Link to={landingPath} onClick={() => setMobileOpen(false)}><Brand /></Link>
          <button className="sidebar-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <PanelLeftClose size={19} />
          </button>
        </div>

        <div className="sidebar-context">
          <span className="sidebar-context__eyebrow">Workspace</span>
          <div className="sidebar-context__line">
            <span className="live-dot" />
            <span>{user?.role === 'admin' ? 'Operations control' : 'Guest concierge'}</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Application navigation">
          <span className="sidebar-section-label">Main menu</span>
          {links.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${isActive(path) ? 'is-active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{name}</span>
              {isActive(path) && <span className="sidebar-link__marker" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-insight">
          <Sparkles size={17} />
          <div>
            <strong>Service rhythm</strong>
            <span>Keep every guest touchpoint in one flow.</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div className="sidebar-user__meta">
            <strong>{user?.name || 'TableFlow User'}</strong>
            <span>{user?.role === 'admin' ? 'Administrator' : 'Guest account'}</span>
          </div>
          <button onClick={handleLogout} title="Sign out" aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}

      <header className="app-topbar">
        <button className="app-menu-trigger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="topbar-title">
          <span>{user?.role === 'admin' ? 'TableFlow Operations' : 'TableFlow Concierge'}</span>
          <small>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</small>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Notifications" title="Notifications">
            <Bell size={18} />
            <span className="notification-pip" />
          </button>
          <Link to="/profile" className="topbar-profile">
            <div className="user-avatar user-avatar--small">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <span>{user?.name?.split(' ')[0]}</span>
          </Link>
        </div>
      </header>
    </>
  );
};

export default Header;
