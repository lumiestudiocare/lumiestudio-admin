import React, { useEffect, useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faListUl, faCalendarDays, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useBookingStore } from '../../store';
import type { Booking, BookingStatus } from '../../models';

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: '#D7A629', confirmed: '#10b981', cancelled: '#ef4444', completed: '#8b5cf6',
};
const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', cancelled: 'Cancelado', completed: 'Concluído',
};
const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const BookingsPage: React.FC = () => {
  const { bookings, fetch, updateStatus, deleteBooking, subscribeRealtime } = useBookingStore();
  const [view,        setView]        = useState<'list' | 'calendar'>('list');
  const [selected,    setSelected]    = useState<Booking | null>(null);
  const [filterStatus,setFilterStatus]= useState('all');
  const [filterDate,  setFilterDate]  = useState('');
  const [search,      setSearch]      = useState('');
  const [calMonth,    setCalMonth]    = useState(new Date());
  const [calSelected, setCalSelected] = useState<Date | null>(null);
  const [confirmDel,  setConfirmDel]  = useState<string | null>(null);

  useEffect(() => {
    fetch();
    const unsub = subscribeRealtime();
    return unsub;
  }, []);

  const filtered = useMemo(() =>
    bookings
      .filter(b => filterStatus === 'all' || b.status === filterStatus)
      .filter(b => !filterDate || b.date === filterDate)
      .filter(b => !search ||
        b.client_name.toLowerCase().includes(search.toLowerCase()) ||
        b.client_phone.includes(search) ||
        b.client_email.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [bookings, filterStatus, filterDate, search]
  );

  // Calendar
  const calDays   = eachDayOfInterval({ start: startOfMonth(calMonth), end: endOfMonth(calMonth) });
  const startPad  = getDay(calDays[0]);
  const calFilter = calSelected ? bookings.filter(b => isSameDay(new Date(b.date + 'T12:00:00'), calSelected)) : [];

  const handleDelete = async (id: string) => {
    await deleteBooking(id);
    setSelected(null);
    setConfirmDel(null);
  };

  return (
    <AdminLayout title="Agendamentos">

      {/* Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ flex: '1 1 200px' }}>
          <label>Buscar cliente</label>
          <input placeholder="Nome, telefone ou e-mail..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="field">
          <label>Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Todos</option>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <div className="field">
          <label>Data</label>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
        {(filterStatus !== 'all' || filterDate || search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterStatus('all'); setFilterDate(''); setSearch(''); }}>
            Limpar ✕
          </button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem' }}>
          <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('list')}>
            <FontAwesomeIcon icon={faListUl} /> Lista
          </button>
          <button className={`btn btn-sm ${view === 'calendar' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('calendar')}>
            <FontAwesomeIcon icon={faCalendarDays} /> Calendário
          </button>
        </div>
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="card">
          <div className="table-wrapper">
            {filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--nude)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>Nenhum agendamento encontrado</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>{['Cliente','Serviço','Profissional','Data','Horário','Status','Ações'].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{b.client_name}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--nude)' }}>{b.client_phone}</div>
                      </td>
                      <td style={{ color: 'var(--text-soft)' }}>{b.service?.name ?? b.service_id}</td>
                      <td style={{ color: 'var(--text-soft)' }}>{b.professional?.name ?? b.professional_id}</td>
                      <td>{format(new Date(b.date + 'T12:00:00'), 'dd/MM/yyyy')}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--brown)', background: 'var(--gold-bg)', padding: '.15rem .5rem' }}>
                          {b.time.slice(0, 5)}
                        </span>
                      </td>
                      <td><span className={`badge badge-${b.status}`}>{STATUS_LABEL[b.status]}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '.4rem' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(b)} title="Ver detalhes">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(b.id)} title="Excluir">
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ padding: '.75rem 1rem', borderTop: '1px solid var(--blush-dark)', fontSize: '.75rem', color: 'var(--text-soft)' }}>
            {filtered.length} agendamento(s)
          </div>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {view === 'calendar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          <div className="card">
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setCalMonth(m => subMonths(m, 1))}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--brown)', textTransform: 'capitalize' }}>
                {format(calMonth, 'MMMM yyyy', { locale: ptBR })}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setCalMonth(m => addMonths(m, 1))}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
              {DAYS_PT.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--nude)', padding: '.4rem 0' }}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
              {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
              {calDays.map(day => {
                const count    = bookings.filter(b => isSameDay(new Date(b.date + 'T12:00:00'), day)).length;
                const isSelect = calSelected && isSameDay(day, calSelected);
                const today    = isToday(day);
                return (
                  <button key={day.toISOString()} onClick={() => setCalSelected(d => d && isSameDay(d, day) ? null : day)} style={{
                    padding: '.5rem .3rem', border: 'none', cursor: 'pointer', position: 'relative',
                    background: isSelect ? 'var(--gold)' : today ? 'rgba(215,166,41,.1)' : 'transparent',
                    borderRadius: 'var(--radius)',
                    outline: today && !isSelect ? '1px solid var(--gold)' : 'none',
                    transition: 'background .2s',
                  }}>
                    <span style={{ display: 'block', fontSize: '.9rem', color: isSelect ? 'white' : today ? 'var(--gold)' : 'var(--text)', fontFamily: 'var(--font-display)' }}>
                      {format(day, 'd')}
                    </span>
                    {count > 0 && (
                      <span style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 2, fontSize: '.6rem', fontWeight: 600,
                        color: isSelect ? 'rgba(255,255,255,.9)' : 'var(--gold)',
                      }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day bookings */}
          <div className="card">
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '1rem' }}>
              {calSelected ? format(calSelected, "d 'de' MMMM", { locale: ptBR }) : 'Selecione um dia'}
            </h4>
            {calSelected && calFilter.length === 0 && (
              <p style={{ color: 'var(--nude)', fontSize: '.85rem' }}>Nenhum agendamento neste dia.</p>
            )}
            {calFilter.map(b => (
              <div key={b.id} onClick={() => setSelected(b)} style={{
                padding: '1rem', marginBottom: '.7rem', cursor: 'pointer',
                border: '1px solid var(--blush-dark)', borderLeft: `3px solid ${STATUS_COLOR[b.status]}`,
                borderRadius: 'var(--radius)', transition: 'box-shadow .2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.3rem' }}>
                  <span style={{ fontWeight: 500, fontSize: '.9rem' }}>{b.client_name}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '.95rem', color: 'var(--gold)' }}>{b.time.slice(0,5)}</span>
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-soft)' }}>{b.service?.name}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--nude)', marginTop: '.3rem' }}>{b.professional?.name}</div>
                <span className={`badge badge-${b.status}`} style={{ marginTop: '.5rem' }}>{STATUS_LABEL[b.status]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Detalhes do Agendamento</h3>
              <button onClick={() => setSelected(null)} style={{ color: 'var(--nude)', fontSize: '1.1rem' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Cliente',      value: selected.client_name },
                { label: 'Telefone',     value: selected.client_phone },
                { label: 'E-mail',       value: selected.client_email },
                { label: 'Serviço',      value: selected.service?.name ?? selected.service_id },
                { label: 'Profissional', value: selected.professional?.name ?? selected.professional_id },
                { label: 'Data & Hora',  value: `${format(new Date(selected.date + 'T12:00:00'), 'dd/MM/yyyy')} às ${selected.time.slice(0,5)}` },
                { label: 'Criado em',    value: format(new Date(selected.created_at), 'dd/MM/yyyy HH:mm') },
                { label: 'Código',       value: `#${selected.id.slice(-6).toUpperCase()}` },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--blush)', padding: '.7rem .9rem', borderRadius: 'var(--radius)' }}>
                  <span style={{ fontSize: '.62rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--nude)', display: 'block', marginBottom: '.2rem' }}>{item.label}</span>
                  <span style={{ fontSize: '.88rem', color: 'var(--text)' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div style={{ background: 'var(--blush)', padding: '.8rem .9rem', marginBottom: '1.5rem', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: '.62rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--nude)', display: 'block', marginBottom: '.2rem' }}>Observações</span>
                <span style={{ fontSize: '.88rem', color: 'var(--text-soft)' }}>{selected.notes}</span>
              </div>
            )}

            {/* Status update */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '.68rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text-soft)', display: 'block', marginBottom: '.6rem' }}>
                Atualizar Status
              </label>
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {(['pending','confirmed','completed','cancelled'] as BookingStatus[]).map(s => (
                  <button key={s}
                    onClick={async () => { await updateStatus(selected.id, s); setSelected({ ...selected, status: s }); }}
                    style={{
                      padding: '.4rem .9rem', fontSize: '.7rem', letterSpacing: '.12em', textTransform: 'uppercase',
                      border: `1px solid ${selected.status === s ? STATUS_COLOR[s] : 'var(--blush-dark)'}`,
                      background: selected.status === s ? `${STATUS_COLOR[s]}18` : 'transparent',
                      color: selected.status === s ? STATUS_COLOR[s] : 'var(--text-soft)',
                      cursor: 'pointer', borderRadius: 'var(--radius)', transition: 'all .2s',
                    }}>
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(selected.id)}>
                <FontAwesomeIcon icon={faTrash} /> Excluir
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDel && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal-box" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗑️</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--brown)', marginBottom: '.6rem' }}>Confirmar exclusão</h3>
              <p style={{ fontSize: '.88rem', color: 'var(--text-soft)', marginBottom: '2rem' }}>Esta ação não pode ser desfeita.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={() => handleDelete(confirmDel)}>Confirmar exclusão</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
