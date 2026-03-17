import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useBookingStore } from '../../store';
import type { BookingStatus } from '../../models';

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending:   '#D7A629',
  confirmed: '#10b981',
  cancelled: '#ef4444',
  completed: '#8b5cf6',
};
const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', cancelled: 'Cancelado', completed: 'Concluído',
};

export const DashboardPage: React.FC = () => {
  const { bookings, fetch, loading, subscribeRealtime } = useBookingStore();

  useEffect(() => {
    fetch();
    const unsub = subscribeRealtime();
    return unsub;
  }, []);

  const today     = format(new Date(), 'yyyy-MM-dd');
  const thisMonth = format(new Date(), 'yyyy-MM');

  const stats = useMemo(() => ({
    total:          bookings.length,
    pending:        bookings.filter(b => b.status === 'pending').length,
    confirmedToday: bookings.filter(b => b.date === today && b.status === 'confirmed').length,
    completedMonth: bookings.filter(b => b.created_at?.startsWith(thisMonth) && b.status === 'completed').length,
    revenueMonth:   bookings.filter(b => b.created_at?.startsWith(thisMonth) && b.status !== 'cancelled').reduce((s, b) => s + (b.payment_amount ?? 0), 0),
    revenueTotal:   bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.payment_amount ?? 0), 0),
  }), [bookings]);

  // Chart: bookings per day this month
  const days = eachDayOfInterval({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
  const dailyData = days.map(d => ({
    day: format(d, 'd', { locale: ptBR }),
    total: bookings.filter(b => isSameDay(new Date(b.date), d)).length,
    confirmados: bookings.filter(b => isSameDay(new Date(b.date), d) && b.status === 'confirmed').length,
  }));

  // Pie: by status
  const pieData = (['pending','confirmed','completed','cancelled'] as BookingStatus[]).map(s => ({
    name: STATUS_LABEL[s],
    value: bookings.filter(b => b.status === s).length,
    color: STATUS_COLOR[s],
  })).filter(d => d.value > 0);

  // Recent bookings
  const recent = [...bookings].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <AdminLayout title="Dashboard" subtitle={`Olá! Hoje é ${format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}`}>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total agendamentos', value: stats.total, accent: 'var(--brown)', prefix: '' },
          { label: 'Pendentes',          value: stats.pending, accent: 'var(--gold)', prefix: '' },
          { label: 'Confirmados hoje',   value: stats.confirmedToday, accent: '#10b981', prefix: '' },
          { label: 'Concluídos no mês',  value: stats.completedMonth, accent: '#8b5cf6', prefix: '' },
          { label: 'Receita no mês',     value: stats.revenueMonth, accent: 'var(--gold)', prefix: 'R$', isRevenue: true },
          { label: 'Receita total',      value: stats.revenueTotal, accent: 'var(--brown)', prefix: 'R$', isRevenue: true },
        ].map((s, i) => (
          <div key={s.label} className="card animate-fadeUp" style={{ animationDelay: `${i * 60}ms`, borderTop: `3px solid ${s.accent}` }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: s.accent, display: 'block', lineHeight: 1 }}>
              {s.isRevenue ? fmt(s.value as number) : s.value}
            </span>
            <span style={{ fontSize: '.68rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-soft)', display: 'block', marginTop: '.4rem' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Area chart */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '1.2rem' }}>
            Agendamentos — {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
          </h3>
          {loading ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" /></div> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#D7A629" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#D7A629" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE3EA" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#AFA090' }} />
                <YAxis tick={{ fontSize: 11, fill: '#AFA090' }} allowDecimals={false} />
                <Tooltip contentStyle={{ border: '1px solid #EFE3EA', borderRadius: 4, fontFamily: 'Jost' }} />
                <Area type="monotone" dataKey="total" stroke="#D7A629" strokeWidth={2} fill="url(#grad1)" name="Total" />
                <Area type="monotone" dataKey="confirmados" stroke="#10b981" strokeWidth={2} fill="none" name="Confirmados" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '1.2rem' }}>
            Por status
          </h3>
          {pieData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nude)', fontSize: '.85rem' }}>
              Sem dados
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ border: '1px solid #EFE3EA', borderRadius: 4, fontFamily: 'Jost', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', marginTop: '.5rem' }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.78rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-soft)', flex: 1 }}>{d.name}</span>
                    <span style={{ color: 'var(--brown)', fontWeight: 500 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brown)' }}>Agendamentos recentes</h3>
          <Link to="/bookings" className="btn btn-ghost btn-sm">Ver todos →</Link>
        </div>
        {recent.length === 0 ? (
          <p style={{ color: 'var(--nude)', fontSize: '.88rem', padding: '1rem 0' }}>Nenhum agendamento ainda.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {['Cliente', 'Serviço', 'Profissional', 'Data', 'Horário', 'Status'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{b.client_name}</div>
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
                    <td>
                      <span className={`badge badge-${b.status}`}>{STATUS_LABEL[b.status]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
