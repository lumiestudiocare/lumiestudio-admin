import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTiktok, faFacebookF, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useReveal } from '../../hooks/useReveal';
import { SERVICES, PROFESSIONALS } from '../../services/data';
import { useCatalogStore } from '../../store';
import logoImg from '../../assets/logo.png';

// Reveal wrapper component
const Reveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

export const HomePage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const activeServices = useCatalogStore(s => s.activeServices);

  return (
    <div className="page-enter">
      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        paddingTop: '80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '8% 6% 8% 10%',
          animation: 'fadeUp .9s .2s ease both',
        }}>
          <span style={{
            fontSize: '.72rem', letterSpacing: '.35em', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: '1.4rem',
            display: 'flex', alignItems: 'center', gap: '.8rem',
          }}>
            <span style={{ display: 'block', width: 40, height: 1, background: 'var(--gold)' }} />
            Studio de Beleza & Estética
          </span>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(2.8rem,5vw,4.6rem)', lineHeight: 1.1,
            color: 'var(--brown)', marginBottom: '1.8rem',
          }}>
            A sua beleza,<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>revelada</em><br />
            com arte.
          </h1>

          <p style={{
            fontSize: '.95rem', lineHeight: 1.9, color: 'var(--text-soft)',
            maxWidth: 400, marginBottom: '2.8rem',
          }}>
            Tratamentos cosméticos exclusivos que valorizam a sua essência natural.
            Ciência e delicadeza em cada detalhe.
          </p>

          <div style={{ display: 'flex', gap: '1.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/agendar" style={{
              padding: '.85rem 2.2rem', background: 'var(--gold)',
              color: 'white', fontSize: '.8rem', letterSpacing: '.2em',
              textTransform: 'uppercase', transition: 'background .3s, transform .2s',
              display: 'inline-block',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold-dark)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              Agendar consulta
            </Link>
            <a href="#servicos" style={{
              fontSize: '.8rem', letterSpacing: '.18em', textTransform: 'uppercase',
              color: 'var(--brown)', display: 'flex', alignItems: 'center', gap: '.5rem',
              transition: 'gap .25s, color .25s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.gap = '.9rem'; (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.gap = '.5rem'; (e.currentTarget as HTMLElement).style.color = 'var(--brown)'; }}
            >
              Ver serviços →
            </a>
          </div>
        </div>

        {/* Hero visual */}
        <div style={{
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeUp .9s .4s ease both',
        }}>
          <div style={{
            width: '78%', aspectRatio: '3/4',
            background: 'linear-gradient(145deg, #e8d5b4 0%, #c9a87c 40%, #725E3A 100%)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 30% 20%, rgba(215,166,41,.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(114,94,58,.3) 0%, transparent 50%)',
            }} />
            {/* Floating text overlay */}
            <div style={{
              position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem',
              borderTop: '1px solid rgba(248,240,245,.3)', paddingTop: '1rem',
            }}>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.1rem', color: 'rgba(248,240,245,.85)', lineHeight: 1.4 }}>
                "Beleza que nasce de dentro para fora"
              </p>
            </div>
          </div>

          {/* Badge */}
          <div style={{
            position: 'absolute', bottom: '12%', left: '8%',
            width: 100, height: 100, borderRadius: '50%',
            background: 'var(--blush)', border: '1px solid var(--gold)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', textAlign: 'center', padding: '.8rem',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold)', lineHeight: 1 }}>10+</span>
            <span style={{ fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--nude)', lineHeight: 1.2, marginTop: '.2rem' }}>Anos de experiência</span>
          </div>

          {/* Floating icons */}
          <div style={{ position: 'absolute', top: '15%', right: '2%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['✨','🌿','🦋'].map((icon, i) => (
              <div key={i} style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(248,240,245,.85)', border: '1px solid rgba(215,166,41,.3)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem',
                animation: `float 3s ${i * 0.8}s ease-in-out infinite`,
              }}>{icon}</div>
            ))}
          </div>
        </div>

        <style>{`
          @media(max-width:768px){
            section:first-of-type { grid-template-columns: 1fr !important; }
            section:first-of-type > div:last-child { display: none !important; }
            section:first-of-type > div:first-child { padding: 3rem 6% !important; }
          }
        `}</style>
      </section>

      {/* ── STRIP ── */}
      <div style={{
        background: 'var(--brown)', color: 'var(--blush)',
        padding: '1.4rem 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '2.5rem', flexWrap: 'wrap', overflow: 'hidden',
      }}>
        {['Produtos certificados','Profissionais especializadas','Cuidado personalizado','Ambiente premium & acolhedor'].map((item, i) => (
          <React.Fragment key={item}>
            {i > 0 && <span style={{ width: 1, height: 20, background: 'rgba(215,166,41,.35)' }} />}
            <span style={{ fontSize: '.72rem', letterSpacing: '.22em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              ✦ {item}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* ── SERVICES ── */}
      <section id="servicos" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <Reveal>
              <span className="eyebrow">O que oferecemos</span>
              <h2 className="display-title">Nossos <em>Serviços</em></h2>
            </Reveal>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2px',
          }}>
            {activeServices.map((service, i) => (
              <Reveal key={service.id} delay={i * 80}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY ── */}
      <section id="sobre" style={{ background: 'var(--white)', padding: '7rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '6rem', alignItems: 'center' }}>
          {/* Visual block */}
          <div style={{ position: 'relative', maxWidth: 460 }}>
            <div style={{
              width: '80%', aspectRatio: '3/4',
              background: 'linear-gradient(160deg, #d4b483 0%, #8b6b3d 100%)',
            }} />
            <div style={{
              position: 'absolute', bottom: -30, right: 0,
              width: '55%', aspectRatio: '1',
              background: 'var(--blush)', border: '1px solid rgba(215,166,41,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.2rem', textAlign: 'center',
            }}>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', color: 'var(--gold)', display: 'block', lineHeight: 1 }}>98%</span>
                <span style={{ fontSize: '.65rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--nude)' }}>Clientes satisfeitas</span>
              </div>
            </div>
            <div style={{ position: 'absolute', top: 20, right: -14, width: 3, height: '60%', background: 'var(--gold)', opacity: .5 }} />
          </div>

          <Reveal>
            <span className="eyebrow">Nossa filosofia</span>
            <h2 className="display-title" style={{ marginBottom: '1.5rem' }}>
              Beleza que nasce<br />de dentro para fora
            </h2>
            <p style={{ fontSize: '.9rem', lineHeight: 1.9, color: 'var(--text-soft)', marginBottom: '1rem' }}>
              No Lumiê Studio, acreditamos que cada mulher é única — e a nossa missão é realçar o que já existe de mais belo em cada uma.
            </p>
            <p style={{ fontSize: '.9rem', lineHeight: 1.9, color: 'var(--text-soft)', marginBottom: '1.8rem' }}>
              Combinamos técnicas modernas com ingredientes naturais, criando uma experiência sensorial completa.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
              {['Ingredientes naturais selecionados','Ambiente íntimo e acolhedor','Profissionais em constante atualização','Protocolo personalizado para cada cliente'].map(item => (
                <li key={item} style={{ display: 'flex', gap: '.7rem', fontSize: '.88rem', color: 'var(--text-soft)', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--gold)', fontSize: '.6rem', marginTop: '.35rem', flexShrink: 0 }}>✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="depoimentos" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <Reveal>
              <span className="eyebrow">Depoimentos</span>
              <h2 className="display-title">O que nossas clientes <em>dizem</em></h2>
            </Reveal>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { text: '"Uma experiência transformadora. Saí me sentindo renovada, confiante e absolutamente radiante."', author: 'Camila R.' },
              { text: '"Atendimento impecável, ambiente lindo e resultado melhor do que eu esperava. Voltarei sempre!"', author: 'Beatriz M.' },
              { text: '"A consultoria de skincare mudou completamente a minha pele. Recomendo de olhos fechados."', author: 'Fernanda S.' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <div style={{ padding: '2.5rem 2rem', background: 'var(--white)', borderBottom: '2px solid transparent', transition: 'border-color .3s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <div style={{ color: 'var(--gold)', marginBottom: '1rem', letterSpacing: '.1em' }}>★★★★★</div>
                  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--brown)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{t.text}</p>
                  <span style={{ fontSize: '.75rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--nude)' }}>— {t.author}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link to="/depoimentos" style={{
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                padding: '.75rem 2rem', border: '1px solid var(--gold)',
                color: 'var(--brown)', fontSize: '.78rem', letterSpacing: '.18em', textTransform: 'uppercase',
                transition: 'all .25s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--brown)'; }}
              >
                Ver todos os depoimentos →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contato" style={{
        background: 'var(--brown)', padding: '6rem 5%',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(215,166,41,.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Reveal>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: 'var(--blush)', marginBottom: '1rem', lineHeight: 1.2 }}>
            Pronta para <em style={{ color: 'var(--gold)' }}>se revelar</em>?
          </h2>
          <p style={{ fontSize: '.9rem', color: 'rgba(248,240,245,.6)', marginBottom: '2.5rem', letterSpacing: '.05em' }}>
            Agende sua visita e descubra o tratamento ideal para você.
          </p>
          <Link to="/agendar" style={{
            display: 'inline-block',
            padding: '.85rem 2.5rem', background: 'var(--gold)',
            color: 'white', fontSize: '.8rem', letterSpacing: '.2em', textTransform: 'uppercase',
            transition: 'background .3s, transform .2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold-dark)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
          >
            Agendar agora
          </Link>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--brown-dark)', color: 'var(--nude)', padding: '4rem 5% 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(175,160,144,.15)' }} className="footer-grid">

          {/* Brand + social */}
          <div>
            <img src={logoImg} alt="Lumiê Studio" style={{ height: 70, objectFit: 'contain', marginBottom: '1rem', display: 'block' }} />
            <p style={{ fontSize: '.82rem', lineHeight: 1.8, color: 'rgba(175,160,144,.8)' }}>Studio de beleza e cosméticos comprometido com a sua essência.</p>
            <div style={{ display: 'flex', gap: '.8rem', marginTop: '1.4rem' }}>
              {[
                { icon: faInstagram, href: 'https://instagram.com/lumiestudio' },
                { icon: faTiktok,    href: 'https://tiktok.com/@lumiestudio' },
                { icon: faFacebookF, href: 'https://facebook.com/lumiestudio' },
                { icon: faWhatsapp,  href: 'https://wa.me/5511995297274' },
              ].map(({ icon, href }) => (
                <a key={href} href={href} target="_blank" rel="noreferrer" style={{
                  width: 36, height: 36, border: '1px solid rgba(175,160,144,.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--nude)', fontSize: '1rem', transition: 'border-color .25s, color .25s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(175,160,144,.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--nude)'; }}
                >
                  <FontAwesomeIcon icon={icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Serviços */}
          <div>
            <h4 style={{ fontSize: '.68rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.2rem' }}>Serviços</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {['Skincare','Manicure','Sobrancelhas','Spa','Consultoria'].map(item => (
                <li key={item}>
                  <Link to={`/agendar?service=${item.toLowerCase()}`} style={{ fontSize: '.82rem', color: 'var(--nude)', textDecoration: 'none', transition: 'color .25s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--nude)')}
                  >{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio + Políticas */}
          <div>
            <h4 style={{ fontSize: '.68rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.2rem' }}>Studio</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {[
                { label: 'Sobre nós',      to: '/#sobre' },
                { label: 'Depoimentos',    to: '/depoimentos' },
                { label: 'Minha conta',    to: '/minha-conta' },
                { label: 'Contato',        to: '/contato' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} style={{ fontSize: '.82rem', color: 'var(--nude)', textDecoration: 'none', transition: 'color .25s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--nude)')}
                  >{item.label}</Link>
                </li>
              ))}
              <li style={{ paddingTop: '.6rem', borderTop: '1px solid rgba(175,160,144,.15)', marginTop: '.2rem' }}>
                <span style={{ fontSize: '.65rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(215,166,41,.5)', display: 'block', marginBottom: '.5rem' }}>Políticas</span>
              </li>
              {[
                { label: 'Termos de Uso',   to: '/termos/uso' },
                { label: 'Privacidade',     to: '/termos/privacidade' },
                { label: 'Cancelamento',    to: '/termos/cancelamento' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} style={{ fontSize: '.78rem', color: 'rgba(175,160,144,.6)', textDecoration: 'none', transition: 'color .25s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(175,160,144,.6)')}
                  >{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 style={{ fontSize: '.68rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.2rem' }}>Contato</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
              {[
                { text: 'R. Areado, 11 — Carapicuíba/SP', href: 'https://maps.google.com/?q=R.+Areado,+11+Carapicuiba+SP' },
                { text: '(11) 99529-7274',                 href: 'https://wa.me/5511995297274' },
                { text: 'ola@lumiestudio.com.br',          href: 'mailto:ola@lumiestudio.com.br' },
                { text: 'Seg–Sáb: 9h–19h',                 href: null },
              ].map(item => (
                <li key={item.text}>
                  {item.href
                    ? <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                        style={{ fontSize: '.82rem', color: 'var(--nude)', textDecoration: 'none', transition: 'color .25s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--nude)')}
                      >{item.text}</a>
                    : <span style={{ fontSize: '.82rem', color: 'rgba(175,160,144,.6)' }}>{item.text}</span>
                  }
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.72rem', opacity: .45 }}>
          <span>© 2025 Lumiê Studio. Todos os direitos reservados.</span>
          <span>Feito com ✦ para realçar a sua beleza.</span>
        </div>
      </footer>
    </div>
  );
};

// Service card sub-component — click redirects to booking with pre-selected service
const ServiceCard: React.FC<{ service: (typeof SERVICES)[0] }> = ({ service }) => {
  // Find the matching professional for this service
  const prof = PROFESSIONALS.find(p => p.services.includes(service.id as import('../../models').ServiceId));

  return (
    <Link
      to={`/agendar?service=${service.id}${prof ? `&prof=${prof.id}` : ''}`}
      style={{ display: 'block', textDecoration: 'none', height: '100%' }}
    >
      <div style={{
        background: 'var(--white)', padding: '2.5rem 2rem',
        position: 'relative', overflow: 'hidden',
        borderBottom: '2px solid transparent',
        transition: 'transform .3s, border-color .3s, box-shadow .3s',
        height: '100%', cursor: 'pointer',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(114,94,58,.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'rgba(215,166,41,.15)', lineHeight: 1, marginBottom: '.3rem' }}>
          {String(service.id).charAt(0).toUpperCase()}
        </div>
        <span style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'block' }}>{service.icon}</span>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--brown)', marginBottom: '.6rem' }}>{service.name}</h3>
        <p style={{ fontSize: '.87rem', lineHeight: 1.8, color: 'var(--text-soft)', marginBottom: '1.2rem' }}>{service.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.8rem' }}>
          <span style={{ fontSize: '.72rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--nude)' }}>{service.duration} min</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)' }}>R$ {service.price}</span>
        </div>
        {prof && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', paddingTop: '.8rem', borderTop: '1px solid var(--blush-dark)' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontFamily: 'var(--font-display)' }}>
              {prof.avatar}
            </div>
            <span style={{ fontSize: '.72rem', color: 'var(--text-soft)' }}>{prof.name}</span>
            <span style={{ marginLeft: 'auto', fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>Agendar →</span>
          </div>
        )}
      </div>
    </Link>
  );
};
