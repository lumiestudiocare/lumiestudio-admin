import React, { useEffect, useMemo, useState } from 'react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useBookingStore } from '../../store';

export const ReportsPage: React.FC = () => {
  const { bookings, fetch } = useBookingStore();
  const [period, setPeriod] = useState(6); // months

  useEffect(() => { fetch(); }, []);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  // Monthly revenue + bookings for last N months
  const monthlyData = useMemo(() => {
    return Array.from({ length: period }, (_, i) => {
      const d     = subMonths(new Date(), period - 1 - i);
      const key   = format(d, 'yyyy-MM');
      const label = format(d, 'MMM/yy', { locale: ptBR });
      const month = bookings.filter(b => b.created_at?.startsWith(key));
      return {
        mes: label,
        agendamentos: month.length,
        confirmados: month.filter(b => b.status === 'confirmed' || b.status === 'completed').length,
        receita: month.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.payment_amount ?? 0), 0),
      };
    });
  }, [bookings, period]);

  // By service
  const byService = useMemo(() => {
    const map: Record<string, { total: number; receita: number }> = {};
    bookings.forEach(b => {
      const k = b.service?.name ?? b.service_id;
      if (!map[k]) map[k] = { total: 0, receita: 0 };
      map[k].total++;
      if (b.status !== 'cancelled') map[k].receita += b.payment_amount ?? 0;
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total);
  }, [bookings]);

  // By professional
  const byProfessional = useMemo(() => {
    const map: Record<string, { total: number; receita: number }> = {};
    bookings.forEach(b => {
      const k = b.professional?.name ?? b.professional_id;
      if (!map[k]) map[k] = { total: 0, receita: 0 };
      map[k].total++;
      if (b.status !== 'cancelled') map[k].receita += b.payment_amount ?? 0;
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.receita - a.receita);
  }, [bookings]);

  const totalRevenue   = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.payment_amount ?? 0), 0);
  const thisMonthKey   = format(new Date(), 'yyyy-MM');
  const thisMonthRev   = bookings.filter(b => b.created_at?.startsWith(thisMonthKey) && b.status !== 'cancelled').reduce((s, b) => s + (b.payment_amount ?? 0), 0);
  const cancelRate     = bookings.length > 0 ? ((bookings.filter(b => b.status === 'cancelled').length / bookings.length) * 100).toFixed(1) : '0.0';

  return (
    <AdminLayout title="Relatórios" subtitle="Análise financeira e de desempenho">

      {/* Period selector */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '2rem' }}>
        {[3,6,12].map(m => (
          <button key={m} onClick={() => setPeriod(m)} className={`btn btn-sm ${period === m ? 'btn-primary' : 'btn-ghost'}`}>
            {m} meses
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Receita total',    value: fmt(totalRevenue),                  accent: 'var(--gold)' },
          { label: 'Receita no mês',   value: fmt(thisMonthRev),                  accent: 'var(--brown)' },
          { label: 'Total agendado',   value: bookings.length,                    accent: '#10b981' },
          { label: 'Taxa cancelamento',value: `${cancelRate}%`,                   accent: '#ef4444' },
        ].map((k, i) => (
          <div key={k.label} className="card animate-fadeUp" style={{ animationDelay: `${i*60}ms`, borderTop: `3px solid ${k.accent}` }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: k.accent, display: 'block', lineHeight: 1 }}>{k.value}</span>
            <span style={{ fontSize: '.68rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-soft)', display: 'block', marginTop: '.4rem' }}>{k.label}</span>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '1.2rem' }}>
          Receita mensal (R$)
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFE3EA" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#AFA090' }} />
            <YAxis tick={{ fontSize: 11, fill: '#AFA090' }} tickFormatter={v => `R$${v}`} />
            <Tooltip formatter={(v) => [fmt(v as number), 'Receita']} contentStyle={{ border: '1px solid #EFE3EA', borderRadius: 4, fontFamily: 'Jost', fontSize: 12 }} />
            <Bar dataKey="receita" fill="#D7A629" radius={[2,2,0,0]} name="Receita" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bookings line chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '1.2rem' }}>
          Volume de agendamentos
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFE3EA" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#AFA090' }} />
            <YAxis tick={{ fontSize: 11, fill: '#AFA090' }} allowDecimals={false} />
            <Tooltip contentStyle={{ border: '1px solid #EFE3EA', borderRadius: 4, fontFamily: 'Jost', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Jost' }} />
            <Line type="monotone" dataKey="agendamentos" stroke="#725E3A" strokeWidth={2} dot={false} name="Total" />
            <Line type="monotone" dataKey="confirmados"  stroke="#10b981" strokeWidth={2} dot={false} name="Confirmados" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tables row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* By service */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '1rem' }}>Por serviço</h3>
          <table>
            <thead><tr><th>Serviço</th><th>Qtd</th><th>Receita</th></tr></thead>
            <tbody>
              {byService.map(s => (
                <tr key={s.name}>
                  <td style={{ color: 'var(--text)' }}>{s.name}</td>
                  <td style={{ color: 'var(--text-soft)' }}>{s.total}</td>
                  <td><span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>{fmt(s.receita)}</span></td>
                </tr>
              ))}
              {byService.length === 0 && <tr><td colSpan={3} style={{ color: 'var(--nude)', textAlign: 'center', padding: '1.5rem' }}>Sem dados</td></tr>}
            </tbody>
          </table>
        </div>

        {/* By professional */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '1rem' }}>Por profissional</h3>
          <table>
            <thead><tr><th>Profissional</th><th>Qtd</th><th>Receita</th></tr></thead>
            <tbody>
              {byProfessional.map(p => (
                <tr key={p.name}>
                  <td style={{ color: 'var(--text)' }}>{p.name}</td>
                  <td style={{ color: 'var(--text-soft)' }}>{p.total}</td>
                  <td><span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>{fmt(p.receita)}</span></td>
                </tr>
              ))}
              {byProfessional.length === 0 && <tr><td colSpan={3} style={{ color: 'var(--nude)', textAlign: 'center', padding: '1.5rem' }}>Sem dados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
