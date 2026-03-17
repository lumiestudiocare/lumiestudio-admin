import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faComments } from '@fortawesome/free-solid-svg-icons';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useBookingStore, useChatStore, useAuthStore } from '../../store';
import type { Booking } from '../../models';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', cancelled: 'Cancelado', completed: 'Concluído',
};

export const ChatPage: React.FC = () => {
  const { bookings, fetch } = useBookingStore();
  const { messages, fetchMessages, sendMessage, subscribeRealtime } = useChatStore();
  const user = useAuthStore(s => s.user);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetchMessages(selectedId);
    const unsub = subscribeRealtime(selectedId);
    return unsub;
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedId]);

  const handleSend = async () => {
    if (!text.trim() || !selectedId) return;
    setSending(true);
    await sendMessage(selectedId, text.trim(), user?.email ?? 'Admin');
    setText('');
    setSending(false);
  };

  const filtered = bookings.filter(b =>
    !search || b.client_name.toLowerCase().includes(search.toLowerCase()) || b.client_phone.includes(search)
  );

  const selected = bookings.find(b => b.id === selectedId);
  const msgs     = selectedId ? (messages[selectedId] ?? []) : [];

  return (
    <AdminLayout title="Chat" subtitle="Comunicação em tempo real com clientes">
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', height: 'calc(100vh - var(--header-h) - 5rem)' }}>

        {/* Sidebar: booking list */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--blush-dark)' }}>
            <input
              placeholder="Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '.6rem .9rem', border: '1px solid var(--blush-dark)', background: 'var(--blush)', fontSize: '.85rem', borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)', outline: 'none' }}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--nude)', fontSize: '.85rem' }}>
                Nenhum agendamento
              </div>
            ) : filtered.map((b: Booking) => {
              const isActive = b.id === selectedId;
              const msgCount = (messages[b.id] ?? []).length;
              return (
                <button key={b.id} onClick={() => setSelectedId(b.id)} style={{
                  width: '100%', textAlign: 'left', padding: '1rem 1.2rem',
                  background: isActive ? 'var(--gold-bg)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                  borderBottom: '1px solid var(--blush)',
                  transition: 'all .2s', cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.2rem' }}>
                    <span style={{ fontWeight: 500, fontSize: '.9rem', color: 'var(--text)' }}>{b.client_name}</span>
                    {msgCount > 0 && (
                      <span style={{ fontSize: '.6rem', background: 'var(--gold)', color: 'white', padding: '.1rem .4rem', borderRadius: 10, fontWeight: 600 }}>
                        {msgCount}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-soft)', marginBottom: '.2rem' }}>
                    {b.service?.name ?? b.service_id}
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '.68rem', color: 'var(--nude)' }}>
                      {format(new Date(b.date + 'T12:00:00'), "d MMM", { locale: ptBR })} · {b.time?.slice(0,5)}
                    </span>
                    <span className={`badge badge-${b.status}`} style={{ fontSize: '.6rem', padding: '.1rem .4rem' }}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--nude)' }}>
              <FontAwesomeIcon icon={faComments} style={{ fontSize: '3rem', marginBottom: '1rem', opacity: .3 }} />
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Selecione um agendamento</p>
              <p style={{ fontSize: '.82rem', marginTop: '.4rem' }}>para iniciar ou ver a conversa</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--blush-dark)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: 'var(--gold)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '1rem', flexShrink: 0,
                }}>
                  {selected.client_name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text)' }}>{selected.client_name}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--nude)' }}>
                    {selected.service?.name} · {format(new Date(selected.date + 'T12:00:00'), "d 'de' MMM", { locale: ptBR })} às {selected.time?.slice(0,5)}
                  </div>
                </div>
                <span className={`badge badge-${selected.status}`} style={{ marginLeft: 'auto' }}>{STATUS_LABEL[selected.status]}</span>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
                {msgs.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--nude)', fontSize: '.85rem', marginTop: '2rem' }}>
                    Nenhuma mensagem ainda. Inicie a conversa!
                  </div>
                ) : msgs.map(m => {
                  const isAdmin = m.sender_role === 'admin';
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%', padding: '.75rem 1rem', borderRadius: isAdmin ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        background: isAdmin ? 'var(--gold)' : 'var(--blush-dark)',
                        color: isAdmin ? 'white' : 'var(--text)',
                      }}>
                        {!isAdmin && <div style={{ fontSize: '.65rem', color: 'var(--nude)', marginBottom: '.2rem', letterSpacing: '.1em' }}>{m.sender}</div>}
                        <p style={{ fontSize: '.88rem', lineHeight: 1.5 }}>{m.message}</p>
                        <p style={{ fontSize: '.6rem', opacity: .7, marginTop: '.3rem', textAlign: 'right' }}>
                          {format(new Date(m.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--blush-dark)', display: 'flex', gap: '.8rem' }}>
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Escreva uma mensagem..."
                  style={{
                    flex: 1, padding: '.75rem 1rem', border: '1px solid var(--blush-dark)',
                    background: 'var(--blush)', fontSize: '.9rem', borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-body)', outline: 'none', transition: 'border-color .2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--blush-dark)')}
                />
                <button className="btn btn-primary" onClick={handleSend} disabled={sending || !text.trim()}>
                  {sending ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <FontAwesomeIcon icon={faPaperPlane} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
