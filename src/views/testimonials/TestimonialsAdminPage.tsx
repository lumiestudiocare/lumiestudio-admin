import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash, faStar } from '@fortawesome/free-solid-svg-icons';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useTestimonialStore } from '../../store';
import type { Testimonial } from '../../store';
const SERVICES = [{id:'skincare',name:'Skincare & Facial',icon:'✦'},{id:'manicure',name:'Manicure & Nail Art',icon:'💅'},{id:'sobrancelhas',name:'Design de Sobrancelhas',icon:'🌸'},{id:'spa',name:'Spa & Relaxamento',icon:'🕯️'},{id:'consultoria',name:'Consultoria de Beleza',icon:'💛'}];

const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <div style={{ display: 'flex', gap: '.15rem' }}>
    {[1,2,3,4,5].map(n => (
      <FontAwesomeIcon key={n} icon={faStar} style={{ fontSize: '.75rem', color: n <= rating ? '#D7A629' : 'var(--blush-dark)' }} />
    ))}
  </div>
);

const getServiceName = (id: string) => SERVICES.find(s => s.id === id)?.name ?? id;
const getServiceIcon = (id: string) => SERVICES.find(s => s.id === id)?.icon ?? '✦';

export const TestimonialsAdminPage: React.FC = () => {
  const { testimonials, loading, fetch, approve, reject, subscribeRealtime } = useTestimonialStore();
  const [filter, setFilter]       = useState<'all' | 'pending' | 'approved'>('pending');
  const [selected, setSelected]   = useState<Testimonial | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [actioning, setActioning]  = useState<string | null>(null);

  useEffect(() => {
    fetch();
    const unsub = subscribeRealtime();
    return unsub;
  }, []);

  const filtered = testimonials.filter(t => {
    if (filter === 'pending')  return !t.approved;
    if (filter === 'approved') return t.approved;
    return true;
  });

  const pending  = testimonials.filter(t => !t.approved).length;
  const approved = testimonials.filter(t =>  t.approved).length;

  const handleApprove = async (id: string) => {
    setActioning(id);
    await approve(id);
    setActioning(null);
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, approved: true } : null);
  };

  const handleReject = async (id: string) => {
    setActioning(id);
    await reject(id);
    setActioning(null);
    setConfirmDel(null);
    if (selected?.id === id) setSelected(null);
  };

  const fmtDate = (d: string) => {
    try { return format(new Date(d), "d 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR }); }
    catch { return d; }
  };

  return (
    <AdminLayout
      title="Depoimentos"
      subtitle={`${pending} pendente${pending !== 1 ? 's' : ''} de aprovação`}
    >
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total',     value: testimonials.length, accent: 'var(--brown)' },
          { label: 'Pendentes', value: pending,             accent: 'var(--gold)',  alert: pending > 0 },
          { label: 'Aprovados', value: approved,            accent: '#10b981' },
        ].map(s => (
          <div key={s.label} className="card" style={{ borderTop: `3px solid ${s.accent}`, position: 'relative' }}>
            {s.alert && s.value > 0 && (
              <span style={{
                position: 'absolute', top: '.8rem', right: '.8rem',
                width: 8, height: 8, borderRadius: '50%', background: '#ef4444',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
            )}
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: s.accent, display: 'block', lineHeight: 1 }}>{s.value}</span>
            <span style={{ fontSize: '.68rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-soft)', marginTop: '.4rem', display: 'block' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--blush-dark)', paddingBottom: '0' }}>
        {([
          { key: 'pending',  label: `Pendentes (${pending})` },
          { key: 'approved', label: `Aprovados (${approved})` },
          { key: 'all',      label: 'Todos' },
        ] as { key: typeof filter; label: string }[]).map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
            padding: '.7rem 1.2rem', background: 'transparent', border: 'none', cursor: 'pointer',
            borderBottom: filter === tab.key ? '2px solid var(--gold)' : '2px solid transparent',
            color: filter === tab.key ? 'var(--brown)' : 'var(--text-soft)',
            fontSize: '.78rem', letterSpacing: '.12em', textTransform: 'uppercase',
            fontFamily: 'var(--font-body)', transition: 'color .2s',
            marginBottom: '-1px',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><span className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            {filter === 'pending' ? '✅' : '⭐'}
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--nude)' }}>
            {filter === 'pending' ? 'Nenhum depoimento pendente!' : 'Nenhum depoimento encontrado'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filtered.map((t, i) => (
            <div key={t.id}
              className="card animate-fadeUp"
              style={{
                animationDelay: `${i * 50}ms`,
                cursor: 'pointer',
                borderLeft: `3px solid ${t.approved ? '#10b981' : 'var(--gold)'}`,
                transition: 'box-shadow .2s',
                opacity: actioning === t.id ? .6 : 1,
              }}
              onClick={() => setSelected(t)}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: t.approved
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, var(--gold), var(--brown))',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '1rem',
                }}>
                  {t.client_name[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '.95rem', color: 'var(--brown)', lineHeight: 1.2 }}>{t.client_name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.2rem' }}>
                    <span style={{ fontSize: '.65rem' }}>{getServiceIcon(t.service_id)}</span>
                    <span style={{ fontSize: '.72rem', color: 'var(--text-soft)' }}>{getServiceName(t.service_id)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.3rem' }}>
                  <Stars rating={t.rating} />
                  <span style={{
                    fontSize: '.58rem', letterSpacing: '.1em', textTransform: 'uppercase',
                    padding: '.15rem .5rem', borderRadius: 2,
                    background: t.approved ? 'rgba(16,185,129,.1)' : 'rgba(215,166,41,.1)',
                    color: t.approved ? '#059669' : 'var(--gold-dark)',
                  }}>
                    {t.approved ? 'Aprovado' : 'Pendente'}
                  </span>
                </div>
              </div>

              {/* Text */}
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: '.95rem', color: 'var(--text-soft)', lineHeight: 1.7,
                marginBottom: '1rem',
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }}>
                "{t.text}"
              </p>

              <p style={{ fontSize: '.68rem', color: 'var(--nude)', marginBottom: '1rem' }}>
                {fmtDate(t.created_at)}
              </p>

              {/* Actions */}
              {!t.approved && (
                <div style={{ display: 'flex', gap: '.5rem' }} onClick={e => e.stopPropagation()}>
                  <button
                    className="btn btn-sm"
                    disabled={actioning === t.id}
                    onClick={() => handleApprove(t.id)}
                    style={{
                      flex: 1, background: '#10b981', color: 'white',
                      border: '1px solid #10b981', transition: 'background .2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#059669')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#10b981')}
                  >
                    {actioning === t.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><FontAwesomeIcon icon={faCheck} /> Aprovar</>}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={actioning === t.id}
                    onClick={() => setConfirmDel(t.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              )}

              {t.approved && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(t.id)}>
                    <FontAwesomeIcon icon={faTrash} /> Remover
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Depoimento</h3>
              <button onClick={() => setSelected(null)} style={{ color: 'var(--nude)', fontSize: '1.1rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--gold), var(--brown))',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: '1.2rem',
              }}>
                {selected.client_name[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brown)' }}>{selected.client_name}</p>
                <p style={{ fontSize: '.78rem', color: 'var(--text-soft)' }}>
                  {getServiceIcon(selected.service_id)} {getServiceName(selected.service_id)}
                </p>
                <div style={{ marginTop: '.4rem' }}><Stars rating={selected.rating} /></div>
              </div>
              <span style={{
                marginLeft: 'auto', fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase',
                padding: '.25rem .7rem', borderRadius: 2,
                background: selected.approved ? 'rgba(16,185,129,.1)' : 'rgba(215,166,41,.1)',
                color: selected.approved ? '#059669' : 'var(--gold-dark)',
              }}>
                {selected.approved ? 'Aprovado' : 'Pendente'}
              </span>
            </div>

            <div style={{ background: 'var(--blush)', padding: '1.2rem 1.5rem', borderLeft: '3px solid var(--gold)', marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--brown)', lineHeight: 1.8 }}>
                "{selected.text}"
              </p>
            </div>

            <p style={{ fontSize: '.75rem', color: 'var(--nude)', marginBottom: '1.5rem' }}>
              Enviado em {fmtDate(selected.created_at)}
            </p>

            <div style={{ display: 'flex', gap: '.8rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-danger btn-sm" onClick={() => { setConfirmDel(selected.id); }}>
                <FontAwesomeIcon icon={faTrash} /> Excluir
              </button>
              {!selected.approved && (
                <button
                  disabled={actioning === selected.id}
                  onClick={() => handleApprove(selected.id)}
                  style={{
                    padding: '.4rem 1.2rem', background: '#10b981', color: 'white',
                    border: 'none', cursor: 'pointer', fontSize: '.72rem',
                    letterSpacing: '.15em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: '.5rem',
                    fontFamily: 'var(--font-body)', transition: 'background .2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#059669')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#10b981')}
                >
                  {actioning === selected.id
                    ? <span className="spinner" style={{ width: 14, height: 14 }} />
                    : <><FontAwesomeIcon icon={faCheck} /> Aprovar e publicar</>}
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Fechar</button>
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
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--brown)', marginBottom: '.6rem' }}>Excluir depoimento?</h3>
              <p style={{ fontSize: '.88rem', color: 'var(--text-soft)', marginBottom: '2rem', lineHeight: 1.7 }}>
                Esta ação não pode ser desfeita. O depoimento será removido permanentemente.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={() => handleReject(confirmDel)}>
                  Confirmar exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </AdminLayout>
  );
};
