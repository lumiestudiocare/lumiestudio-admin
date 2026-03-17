import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import logoImg from '../../assets/logo.png';

export const LoginPage: React.FC = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const login    = useAuthStore(s => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) setError('Credenciais inválidas. Verifique e tente novamente.');
    else navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--brown)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      {[
        { size: 400, top: -100, right: -100 },
        { size: 300, bottom: -80, left: -80 },
        { size: 200, top: '40%', left: '60%' },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', width: c.size, height: c.size, borderRadius: '50%',
          border: '1px solid rgba(215,166,41,.08)', pointerEvents: 'none',
          top: c.top, right: (c as any).right, bottom: (c as any).bottom,
          left: (c as any).left,
        }} />
      ))}

      <div style={{
        background: 'var(--white)', padding: '3rem 2.5rem',
        width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius)',
        animation: 'fadeUp .6s ease both', position: 'relative',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src={logoImg} alt="Lumiê" style={{ height: 90, objectFit: 'contain', marginBottom: '1rem' }} />
          <span style={{ fontSize: '.68rem', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--nude)', display: 'block' }}>
            Painel Administrativo
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="field">
            <label>E-mail</label>
            <input type="email" placeholder="seu@lumiestudio.com.br" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Senha</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', padding: '.75rem 1rem', borderRadius: 'var(--radius)', fontSize: '.82rem', color: '#dc2626' }}>
              ⚠ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: '.5rem' }}>
            {loading ? <span className="spinner" /> : 'Entrar no painel'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.75rem', color: 'var(--nude)' }}>
          <a href="https://lumiestudio.com.br" style={{ color: 'var(--nude)' }}>← Voltar ao site</a>
        </p>
      </div>
    </div>
  );
};
