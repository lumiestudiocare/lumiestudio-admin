import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useServiceStore } from '../../store';
import type { Service, ServiceId } from '../../models';

const CATEGORIES = ['Rosto','Unhas','Olhar','Corpo','Estilo'];
const ICONS = ['✦','💅','🌸','🕯️','💛','🌿','✨','💎','🦋','🪷'];

const emptyService = (): Partial<Service> => ({
  id: '' as ServiceId, name: '', description: '', duration: 60,
  price: 0, icon: '✦', category: 'Rosto', active: true,
});

export const ServicesPage: React.FC = () => {
  const { services, loading, fetch, save, toggle } = useServiceStore();
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!editing?.name?.trim())        { setError('Nome obrigatório'); return; }
    if (!editing?.id?.trim())          { setError('ID obrigatório'); return; }
    if ((editing?.price ?? 0) <= 0)   { setError('Preço deve ser maior que zero'); return; }
    if ((editing?.duration ?? 0) <= 0){ setError('Duração deve ser maior que zero'); return; }
    setSaving(true); setError('');
    await save(editing as Partial<Service>);
    setSaving(false);
    setEditing(null);
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <AdminLayout title="Serviços" subtitle="Gerencie o catálogo de serviços e preços">

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={() => setEditing(emptyService())}>
          <FontAwesomeIcon icon={faPlus} /> Novo serviço
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><span className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>{['Serviço','Categoria','Duração','Preço','Status','Ações'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id} style={{ opacity: s.active ? 1 : .5 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
                        <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text)' }}>{s.name}</div>
                          <div style={{ fontSize: '.72rem', color: 'var(--nude)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '.72rem', letterSpacing: '.1em', background: 'var(--blush-dark)', color: 'var(--text-soft)', padding: '.2rem .6rem', borderRadius: 2 }}>{s.category}</span></td>
                    <td style={{ color: 'var(--text-soft)' }}>{s.duration} min</td>
                    <td><span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)' }}>{fmt(s.price)}</span></td>
                    <td>
                      <button onClick={() => toggle(s.id, !s.active)} style={{
                        display: 'flex', alignItems: 'center', gap: '.4rem',
                        fontSize: '.72rem', color: s.active ? '#10b981' : 'var(--nude)', transition: 'color .2s',
                      }}>
                        <FontAwesomeIcon icon={s.active ? faToggleOn : faToggleOff} style={{ fontSize: '1.1rem' }} />
                        {s.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...s })}>
                        <FontAwesomeIcon icon={faPen} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing.id && services.find(s => s.id === editing.id) ? 'Editar serviço' : 'Novo serviço'}</h3>
              <button onClick={() => setEditing(null)} style={{ color: 'var(--nude)', fontSize: '1.1rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div className="field">
                  <label>Nome do serviço *</label>
                  <input value={editing.name ?? ''} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Ex: Skincare & Facial" />
                </div>
                <div>
                  <label style={{ fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-soft)', display: 'block', marginBottom: '.4rem' }}>Ícone</label>
                  <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', maxWidth: 160 }}>
                    {ICONS.map(ic => (
                      <button key={ic} onClick={() => setEditing({ ...editing, icon: ic })} style={{
                        fontSize: '1.2rem', padding: '.3rem', borderRadius: 4, cursor: 'pointer',
                        background: editing.icon === ic ? 'var(--gold-bg)' : 'transparent',
                        border: editing.icon === ic ? '1px solid var(--gold)' : '1px solid transparent',
                      }}>{ic}</button>
                    ))}
                  </div>
                </div>
              </div>

              {!services.find(s => s.id === editing.id) && (
                <div className="field">
                  <label>ID (slug único) *</label>
                  <input value={editing.id ?? ''} onChange={e => setEditing({ ...editing, id: e.target.value.toLowerCase().replace(/\s/g, '_') as ServiceId })} placeholder="ex: hidratacao_facial" />
                  <span style={{ fontSize: '.72rem', color: 'var(--nude)' }}>Apenas letras minúsculas e underline. Não pode ser alterado depois.</span>
                </div>
              )}

              <div className="field">
                <label>Descrição</label>
                <textarea value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={2} placeholder="Descreva o serviço..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="field">
                  <label>Preço (R$) *</label>
                  <input type="number" min={0} step={0.01} value={editing.price ?? ''} onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) })} />
                </div>
                <div className="field">
                  <label>Duração (min) *</label>
                  <input type="number" min={15} step={15} value={editing.duration ?? ''} onChange={e => setEditing({ ...editing, duration: parseInt(e.target.value) })} />
                </div>
                <div className="field">
                  <label>Categoria</label>
                  <select value={editing.category ?? 'Rosto'} onChange={e => setEditing({ ...editing, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
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
