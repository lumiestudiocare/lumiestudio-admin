import React, { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faPen, faTrash, faSearch,
  faStar, faPhone, faEnvelope, faCalendarDays, faNoteSticky,
} from '@fortawesome/free-solid-svg-icons';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useClientStore, useBookingStore } from '../../store';
import type { Client } from '../../models';

const empty = (): Partial<Client> => ({
  name: '', phone: '', email: '', birthdate: '', notes: '', manutencao: 0,
});

export const ClientsPage: React.FC = () => {
  const { clients, loading, fetch, save, remove } = useClientStore();
  const { bookings, fetch: fetchBookings }         = useBookingStore();
  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState<Partial<Client>>(empty());
  const [saving,     setSaving]     = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [detail,     setDetail]     = useState<Client | null>(null);

  useEffect(() => { fetch(); fetchBookings(); }, []);

  // Enriches clients with booking stats
  const enriched = useMemo(() =>
    clients.map(c => {
      const cb = bookings.filter(b =>
        b.client_email?.toLowerCase() === c.email?.toLowerCase() ||
        b.client_name?.toLowerCase()  === c.name.toLowerCase()
      );
      const total_spent = cb.reduce((s, b) => s + (b.payment_amount ?? 0), 0);
      const last_visit  = cb.sort((a, b) => b.date.localeCompare(a.date))[0]?.date;
      return { ...c, bookings: cb, total_spent, last_visit };
    }), [clients, bookings]
  );

  const filtered = useMemo(() =>
    enriched.filter(c =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    ), [enriched, search]
  );

  const openNew  = () => { setForm(empty()); setModal(true); };
  const openEdit = (c: Client) => { setForm({ ...c }); setModal(true); };
  const close    = () => { setModal(false); setForm(empty()); };

  const handleSave = async () => {
    if (!form.name?.trim()) return;
    setSaving(true);
    await save(form);
    setSaving(false);
    close();
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    setConfirmDel(null);
    if (detail?.id === id) setDetail(null);
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const fmtDate = (d?: string) => {
    if (!d) return '—';
    try { return format(new Date(d + 'T12:00:00'), "d 'de' MMM 'de' yyyy", { locale: ptBR }); }
    catch { return d; }
  };

  return (
    <AdminLayout title="Clientes" subtitle={`${clients.length} clientes cadastrados`}>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <FontAwesomeIcon icon={faSearch} style={{
            position: 'absolute', left: '.9rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--nude)', fontSize: '.85rem', pointerEvents: 'none',
          }} />
          <input
            placeholder="Buscar por nome, telefone ou e-mail..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '.7rem 1rem .7rem 2.5rem',
              border: '1px solid var(--blush-dark)', background: 'var(--white)',
              fontSize: '.88rem', borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)',
            }}
          />
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <FontAwesomeIcon icon={faPlus} /> Novo cliente
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <span className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--nude)' }}>
            {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
          </p>
          {!search && (
            <button className="btn btn-primary" onClick={openNew} style={{ marginTop: '1.5rem' }}>
              <FontAwesomeIcon icon={faPlus} /> Cadastrar primeiro cliente
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.map((c, i) => (
            <div key={c.id} className="card animate-fadeUp" style={{ animationDelay: `${i * 40}ms`, cursor: 'pointer', transition: 'box-shadow .2s' }}
              onClick={() => setDetail(c)}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--gold), var(--brown))',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '1.2rem',
                }}>
                  {c.name.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brown)', lineHeight: 1.2 }}>{c.name}</h3>
                  {c.phone && <p style={{ fontSize: '.78rem', color: 'var(--text-soft)' }}>{c.phone}</p>}
                </div>
                {/* Manutenção badge */}
                {c.manutencao > 0 && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    background: 'var(--gold-bg)', border: '1px solid rgba(215,166,41,.3)',
                    padding: '.3rem .6rem', borderRadius: 'var(--radius)', flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)', lineHeight: 1 }}>{c.manutencao}</span>
                    <span style={{ fontSize: '.55rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--nude)' }}>manut.</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--blush)', padding: '.6rem .8rem', borderRadius: 'var(--radius)' }}>
                  <span style={{ fontSize: '.6rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--nude)', display: 'block' }}>Sessões</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--brown)' }}>{c.bookings?.length ?? 0}</span>
                </div>
                <div style={{ background: 'var(--blush)', padding: '.6rem .8rem', borderRadius: 'var(--radius)' }}>
                  <span style={{ fontSize: '.6rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--nude)', display: 'block' }}>Total gasto</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--gold)' }}>{fmt(c.total_spent ?? 0)}</span>
                </div>
              </div>

              {c.last_visit && (
                <p style={{ fontSize: '.75rem', color: 'var(--text-soft)', marginBottom: '1rem' }}>
                  <FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: '.4rem', color: 'var(--nude)' }} />
                  Última visita: {fmtDate(c.last_visit)}
                </p>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '.5rem' }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(c)}>
                  <FontAwesomeIcon icon={faPen} /> Editar
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(c.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-box" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{detail.name}</h3>
              <button onClick={() => setDetail(null)} style={{ color: 'var(--nude)', fontSize: '1.1rem' }}>✕</button>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem', marginBottom: '1.5rem' }}>
              {[
                { icon: faPhone,       label: 'Telefone',       value: detail.phone || '—' },
                { icon: faEnvelope,    label: 'E-mail',         value: detail.email || '—' },
                { icon: faCalendarDays,label: 'Nascimento',     value: fmtDate(detail.birthdate) },
                { icon: faStar,        label: 'Manutenções',    value: `${detail.manutencao} disponível(is)` },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--blush)', padding: '.8rem 1rem', borderRadius: 'var(--radius)', display: 'flex', gap: '.7rem', alignItems: 'flex-start' }}>
                  <FontAwesomeIcon icon={item.icon} style={{ color: 'var(--gold)', marginTop: '.2rem', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '.62rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--nude)', display: 'block' }}>{item.label}</span>
                    <span style={{ fontSize: '.88rem', color: 'var(--text)' }}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {detail.notes && (
              <div style={{ background: 'var(--blush)', padding: '.8rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', display: 'flex', gap: '.7rem' }}>
                <FontAwesomeIcon icon={faNoteSticky} style={{ color: 'var(--gold)', marginTop: '.2rem', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '.62rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--nude)', display: 'block', marginBottom: '.3rem' }}>Observações</span>
                  <span style={{ fontSize: '.88rem', color: 'var(--text-soft)', lineHeight: 1.7 }}>{detail.notes}</span>
                </div>
              </div>
            )}

            {/* Booking history */}
            {(detail.bookings?.length ?? 0) > 0 && (
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--brown)', marginBottom: '.8rem' }}>
                  Histórico de sessões ({detail.bookings!.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', maxHeight: 220, overflowY: 'auto' }}>
                  {detail.bookings!
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map(b => (
                      <div key={b.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '.6rem .9rem', border: '1px solid var(--blush-dark)',
                        borderRadius: 'var(--radius)', fontSize: '.82rem',
                      }}>
                        <div>
                          <span style={{ color: 'var(--brown)', fontWeight: 500 }}>{b.service_id}</span>
                          <span style={{ color: 'var(--nude)', marginLeft: '.5rem' }}>{fmtDate(b.date)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
                          {b.payment_amount && (
                            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>{fmt(b.payment_amount)}</span>
                          )}
                          <span className={`badge badge-${b.status}`}>{b.status}</span>
                        </div>
                      </div>
                    ))}
                </div>
                <div style={{ marginTop: '.8rem', padding: '.7rem 1rem', background: 'var(--gold-bg)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '.78rem', color: 'var(--text-soft)' }}>Total investido</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)' }}>{fmt(detail.total_spent ?? 0)}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--blush-dark)' }}>
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(detail.id)}>
                <FontAwesomeIcon icon={faTrash} /> Excluir
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => { setDetail(null); openEdit(detail); }}>
                <FontAwesomeIcon icon={faPen} /> Editar
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetail(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT / CREATE MODAL ── */}
      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{form.id ? 'Editar cliente' : 'Novo cliente'}</h3>
              <button onClick={close} style={{ color: 'var(--nude)', fontSize: '1.1rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="field">
                <label>Nome completo *</label>
                <input value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome da cliente" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="field">
                  <label>Telefone / WhatsApp</label>
                  <input value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 9 9999-9999" />
                </div>
                <div className="field">
                  <label>Data de nascimento</label>
                  <input type="date" value={form.birthdate ?? ''} onChange={e => setForm(f => ({ ...f, birthdate: e.target.value }))} />
                </div>
              </div>

              <div className="field">
                <label>E-mail</label>
                <input type="email" value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="cliente@email.com" />
              </div>

              <div className="field">
                <label>
                  Manutenções disponíveis
                  <span style={{ fontSize: '.7rem', color: 'var(--nude)', marginLeft: '.5rem', textTransform: 'none', letterSpacing: 0 }}>
                    (saldo de sessões de manutenção)
                  </span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>
                  <button type="button" onClick={() => setForm(f => ({ ...f, manutencao: Math.max(0, (f.manutencao ?? 0) - 1) }))}
                    style={{ width: 36, height: 36, border: '1px solid var(--blush-dark)', background: 'var(--blush)', fontSize: '1.2rem', cursor: 'pointer', borderRadius: 'var(--radius)', color: 'var(--brown)' }}>
                    −
                  </button>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--gold)', minWidth: 32, textAlign: 'center', lineHeight: 1 }}>
                    {form.manutencao ?? 0}
                  </span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, manutencao: (f.manutencao ?? 0) + 1 }))}
                    style={{ width: 36, height: 36, border: '1px solid var(--gold)', background: 'var(--gold-bg)', fontSize: '1.2rem', cursor: 'pointer', borderRadius: 'var(--radius)', color: 'var(--gold)' }}>
                    +
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Observações</label>
                <textarea rows={3} value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Alergias, preferências, histórico relevante..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--blush-dark)' }}>
                <button className="btn btn-ghost" onClick={close}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name?.trim()}>
                  {saving ? <span className="spinner" /> : form.id ? 'Salvar alterações' : 'Cadastrar cliente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE ── */}
      {confirmDel && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal-box" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗑️</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--brown)', marginBottom: '.6rem' }}>Excluir cliente?</h3>
              <p style={{ fontSize: '.88rem', color: 'var(--text-soft)', marginBottom: '2rem' }}>
                O histórico de agendamentos não será apagado, apenas o cadastro.
              </p>
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
