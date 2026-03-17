import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore, useNotificationStore } from '../../store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TYPE_ICON: Record<string, string> = {
  new_booking:        '📅',
  payment_confirmed:  '✅',
  cancellation:       '❌',
  message:            '💬',
};

export const Header: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const user          = useAuthStore(s => s.user);
  const { notifications, unreadCount, markRead, markAllRead, fetch } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, right: 0,
      left: 'var(--sidebar-w)', height: 'var(--header-h)',
      background: 'var(--white)', borderBottom: '1px solid var(--blush-dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', zIndex: 90, boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 300, color: 'var(--brown)', lineHeight: 1 }}>
          {title}
        </h1>
        {subtitle && <span style={{ fontSize: '.72rem', color: 'var(--nude)', letterSpacing: '.1em' }}>{subtitle}</span>}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

        {/* Notifications */}
        <div ref={ref} style={{ position: 'relative' }}>
          <button onClick={() => setOpen(o => !o)} style={{
            position: 'relative', color: 'var(--text-soft)', fontSize: '1.1rem',
            padding: '.3rem', transition: 'color .2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-soft)')}
          >
            <FontAwesomeIcon icon={faBell} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 0,
                background: '#ef4444', color: 'white',
                fontSize: '.55rem', width: 16, height: 16, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, border: '1.5px solid var(--white)',
              }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {open && (
            <div style={{
              position: 'absolute', top: 'calc(100% + .8rem)', right: 0,
              width: 340, background: 'var(--white)', boxShadow: 'var(--shadow-lg)',
              borderRadius: 'var(--radius)', border: '1px solid var(--blush-dark)',
              animation: 'fadeUp .2s ease both', zIndex: 200,
            }}>
              <div style={{ padding: '.9rem 1.2rem', borderBottom: '1px solid var(--blush-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brown)' }}>Notificações</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: '.68rem', color: 'var(--gold)', letterSpacing: '.12em', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <FontAwesomeIcon icon={faCheckDouble} /> Marcar todas
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--nude)', fontSize: '.85rem' }}>
                    Nenhuma notificação
                  </div>
                ) : notifications.slice(0, 20).map(n => (
                  <div key={n.id} onClick={() => markRead(n.id)} style={{
                    padding: '.85rem 1.2rem', cursor: 'pointer',
                    background: n.read ? 'transparent' : 'rgba(215,166,41,.05)',
                    borderBottom: '1px solid var(--blush)',
                    borderLeft: n.read ? '3px solid transparent' : '3px solid var(--gold)',
                    transition: 'background .2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--blush)')}
                    onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(215,166,41,.05)')}
                  >
                    <div style={{ display: 'flex', gap: '.7rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{TYPE_ICON[n.type] ?? '🔔'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '.82rem', color: 'var(--text)', fontWeight: n.read ? 400 : 500, marginBottom: '.2rem' }}>{n.title}</p>
                        <p style={{ fontSize: '.75rem', color: 'var(--text-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</p>
                        <p style={{ fontSize: '.65rem', color: 'var(--nude)', marginTop: '.3rem' }}>
                          {format(new Date(n.created_at), "d MMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--gold)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: '1rem',
          }}>
            {user?.email?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <span style={{ fontSize: '.78rem', color: 'var(--text-soft)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </span>
        </div>
      </div>
    </header>
  );
};
