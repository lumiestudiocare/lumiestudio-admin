import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useProfessionalStore, useServiceStore } from '../../store';
import type { Professional, ServiceId } from '../../models';

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const empty = (): Partial<Professional> => ({
  name: '', role: '', avatar: '', email: '', phone: '', bio: '',
  available_days: [1,2,3,4,5,6], services: [], active: true,
});

export const ProfessionalsPage: React.FC = () => {
  const { professionals, loading, fetch, save, toggle } = useProfessionalStore();
  const { services, fetch: fetchSvc } = useServiceStore();
  const [editing, setEditing] = useState<Partial<Professional> | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => { fetch(); fetchSvc(); }, []);

  const openNew  = () => setEditing(empty());
  const openEdit = (p: Professional) => setEditing({ ...p, services: p.services ?? [] });

  const handleSave = async () => {
    if (!editing?.name?.trim()) { setError('Nome obrigatório'); return; }
    if (!editing?.role?.trim()) { setError('Cargo obrigatório'); return; }
    if (!editing?.avatar?.trim()) { setError('Iniciais obrigatórias'); return; }
    setSaving(true);
    setError('');
    await save(editing as Partial<Professional> & { id?: string });
    setSaving(false);
    setEditing(null);
  };

  const toggleDay = (day: number) => {
    if (!editing) return;
    const days = editing.available_days ?? [];
    setEditing({ ...editing, available_days: days.includes(day) ? days.filter(d => d !== day) : [...days, day].sort() });
  };

  const toggleService = (id: ServiceId) => {
    if (!editing) return;
    const svcs = editing.services ?? [];
    setEditing({ ...editing, services: svcs.includes(id) ? svcs.filter(s => s !== id) : [...svcs, id] });
  };

  return (
    <AdminLayout title="Profissionais" subtitle="Gerencie a equipe do studio">

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={openNew}>
          <FontAwesomeIcon icon={faPlus} /> Nova profissional
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><span className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}>
          {professionals.map(p => (
            <div key={p.id} className="card" style={{ opacity: p.active ? 1 : .55, transition: 'opacity .3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: p.active ? 'var(--gold)' : 'var(--nude)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '1.2rem', flexShrink: 0,
                }}>{p.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--brown)', lineHeight: 1.2 }}>{p.name}</h3>
                  <p style={{ fontSize: '.78rem', color: 'var(--text-soft)' }}>{p.role}</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} title="Editar">
                  <FontAwesomeIcon icon={faPen} />
                </button>
              </div>

              {p.email && <p style={{ fontSize: '.78rem', color: 'var(--text-soft)', marginBottom: '.3rem' }}>✉ {p.email}</p>}
              {p.phone && <p style={{ fontSize: '.78rem', color: 'var(--text-soft)', marginBottom: '.8rem' }}>📞 {p.phone}</p>}

              <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', marginBottom: '.8rem' }}>
                {(p.services ?? []).map(sid => {
                  const svc = services.find(s => s.id === sid);
                  return svc ? (
                    <span key={sid} style={{ fontSize: '.65rem', letterSpacing: '.1em', background: 'var(--gold-bg)', color: 'var(--brown)', padding: '.2rem .6rem', borderRadius: 2 }}>
                      {svc.name}
                    </span>
                  ) : null;
                })}
              </div>

              <div style={{ display: 'flex', gap: '.25rem', marginBottom: '1rem' }}>
                {DAYS.map((d, i) => (
                  <span key={i} style={{
                    fontSize: '.6rem', padding: '.2rem .35rem',
                    background: (p.available_days ?? []).includes(i) ? 'var(--gold)' : 'var(--blush-dark)',
                    color: (p.available_days ?? []).includes(i) ? 'white' : 'var(--nude)',
                    borderRadius: 2,
                  }}>{d}</span>
                ))}
              </div>

              <button onClick={() => toggle(p.id, !p.active)} style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                fontSize: '.72rem', letterSpacing: '.12em', color: p.active ? '#10b981' : 'var(--nude)',
                transition: 'color .2s',
              }}>
                <FontAwesomeIcon icon={p.active ? faToggleOn : faToggleOff} style={{ fontSize: '1.1rem' }} />
                {p.active ? 'Ativa' : 'Inativa'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing.id ? 'Editar profissional' : 'Nova profissional'}</h3>
              <button onClick={() => setEditing(null)} style={{ color: 'var(--nude)', fontSize: '1.1rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
                <div className="field">
                  <label>Nome completo *</label>
                  <input value={editing.name ?? ''} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Ex: Simone Mariano" />
                </div>
                <div className="field">
                  <label>Iniciais *</label>
                  <input value={editing.avatar ?? ''} onChange={e => setEditing({ ...editing, avatar: e.target.value.toUpperCase().slice(0,2) })} placeholder="SM" style={{ width: 64, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }} />
                </div>
              </div>
              <div className="field">
                <label>Cargo / especialidade *</label>
                <input value={editing.role ?? ''} onChange={e => setEditing({ ...editing, role: e.target.value })} placeholder="Ex: Skincare & Consultoria" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="field">
                  <label>E-mail</label>
                  <input type="email" value={editing.email ?? ''} onChange={e => setEditing({ ...editing, email: e.target.value })} placeholder="nome@lumiestudio.com.br" />
                </div>
                <div className="field">
                  <label>Telefone</label>
                  <input value={editing.phone ?? ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} placeholder="(11) 9 9999-9999" />
                </div>
              </div>
              <div className="field">
                <label>Bio (opcional)</label>
                <textarea value={editing.bio ?? ''} onChange={e => setEditing({ ...editing, bio: e.target.value })} rows={2} placeholder="Breve descrição..." />
              </div>

              {/* Services */}
              <div>
                <label style={{ fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-soft)', display: 'block', marginBottom: '.6rem' }}>Serviços que realiza</label>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  {services.map(s => {
                    const sel = (editing.services ?? []).includes(s.id);
                    return (
                      <button key={s.id} onClick={() => toggleService(s.id)} style={{
                        padding: '.35rem .8rem', fontSize: '.72rem', cursor: 'pointer', borderRadius: 2,
                        background: sel ? 'var(--gold)' : 'var(--blush)', color: sel ? 'white' : 'var(--text-soft)',
                        border: `1px solid ${sel ? 'var(--gold)' : 'var(--blush-dark)'}`, transition: 'all .2s',
                      }}>{s.icon} {s.name}</button>
                    );
                  })}
                </div>
              </div>

              {/* Days */}
              <div>
                <label style={{ fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-soft)', display: 'block', marginBottom: '.6rem' }}>Dias disponíveis</label>
                <div style={{ display: 'flex', gap: '.4rem' }}>
                  {DAYS.map((d, i) => {
                    const sel = (editing.available_days ?? []).includes(i);
                    return (
                      <button key={i} onClick={() => toggleDay(i)} style={{
                        padding: '.35rem .55rem', fontSize: '.72rem', cursor: 'pointer', borderRadius: 2,
                        background: sel ? 'var(--gold)' : 'var(--blush)', color: sel ? 'white' : 'var(--text-soft)',
                        border: `1px solid ${sel ? 'var(--gold)' : 'var(--blush-dark)'}`, transition: 'all .2s',
                      }}>{d}</button>
                    );
                  })}
                </div>
              </div>

              {error && <p style={{ fontSize: '.8rem', color: '#ef4444' }}>⚠ {error}</p>}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '.5rem', borderTop: '1px solid var(--blush-dark)' }}>
                <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
