import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGauge, faCalendarDays, faUsers, faScissors,
  faChartLine, faComments, faRightFromBracket,
  faBars, faXmark, faAddressBook,
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore, useNotificationStore } from '../../store';
import logoImg from '../../assets/logo.png';

const NAV = [
  { icon: faGauge,        label: 'Dashboard',      to: '/dashboard' },
  { icon: faCalendarDays, label: 'Agendamentos',    to: '/bookings' },
  { icon: faAddressBook,  label: 'Clientes',        to: '/clients' },
  { icon: faUsers,        label: 'Profissionais',   to: '/professionals' },
  { icon: faScissors,     label: 'Serviços',        to: '/services' },
  { icon: faChartLine,    label: 'Relatórios',      to: '/reports' },
  { icon: faComments,     label: 'Chat',            to: '/chat' },
];

export const Sidebar: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const logout    = useAuthStore(s => s.logout);
  const unread    = useNotificationStore(s => s.unreadCount);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', top: '1rem', left: '1rem', zIndex: 200,
          display: 'none', background: 'var(--sidebar-bg)',
          color: 'var(--gold)', padding: '.5rem .7rem', borderRadius: 4,
        }}
        className="sidebar-toggle"
      >
        <FontAwesomeIcon icon={open ? faXmark : faBars} />
      </button>

      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 'var(--sidebar-w)', background: 'var(--sidebar-bg)',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(215,166,41,.08)',
        zIndex: 100, transition: 'transform .3s ease',
        transform: open ? 'translateX(0)' : undefined,
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.2rem 1.4rem',
          borderBottom: '1px solid rgba(215,166,41,.1)',
          display: 'flex', alignItems: 'center', gap: '.8rem',
        }}>
          <img src={logoImg} alt="Lumiê" style={{ height: 44, objectFit: 'contain' }} />
          <div>
            <span style={{ fontSize: '.6rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block' }}>
              Admin
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          {NAV.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '.9rem',
              padding: '.75rem 1.4rem',
              color: isActive(item.to) ? 'var(--gold)' : 'rgba(248,240,245,.6)',
              background: isActive(item.to) ? 'var(--sidebar-active)' : 'transparent',
              borderLeft: isActive(item.to) ? '2px solid var(--gold)' : '2px solid transparent',
              fontSize: '.8rem', letterSpacing: '.1em',
              transition: 'all .2s',
            }}
              onMouseEnter={e => { if (!isActive(item.to)) (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover)'; }}
              onMouseLeave={e => { if (!isActive(item.to)) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <FontAwesomeIcon icon={item.icon} style={{ width: 16, opacity: isActive(item.to) ? 1 : .7 }} />
              {item.label}
              {item.to === '/chat' && unread > 0 && (
                <span style={{
                  marginLeft: 'auto', background: '#ef4444', color: 'white',
                  fontSize: '.6rem', padding: '.1rem .45rem', borderRadius: 10, fontWeight: 600,
                }}>{unread}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '1rem 1.4rem', borderTop: '1px solid rgba(215,166,41,.1)' }}>
          <a href="https://www.lumiestudio.com.br" target="_blank" rel="noreferrer"
            style={{ fontSize: '.72rem', letterSpacing: '.15em', color: 'rgba(248,240,245,.4)', display: 'block', marginBottom: '.8rem' }}>
            ↗ Ver site público
          </a>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '.7rem',
            color: 'rgba(248,240,245,.5)', fontSize: '.78rem', letterSpacing: '.12em',
            width: '100%', padding: '.5rem 0', transition: 'color .2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,240,245,.5)')}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            Sair
          </button>
        </div>
      </aside>

      <style>{`
        @media(max-width:768px){
          .sidebar-toggle{display:flex!important}
          aside{transform:translateX(-100%)!important}
          aside[style*="translateX(0)"]{transform:translateX(0)!important}
        }
      `}</style>
    </>
  );
};
