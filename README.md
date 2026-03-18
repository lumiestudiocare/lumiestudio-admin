<div align="center">

<img src="src/assets/logo.png" alt="Lumiê Studio Admin" height="120" />

# lumiestudio-admin — Painel Administrativo

**Painel de gestão completo com dados em tempo real, autenticação segura via Supabase e CI/CD automático.**

[![Deploy](https://github.com/lumiestudiocare/lumiestudio-admin/actions/workflows/deploy.yml/badge.svg)](https://github.com/lumiestudiocare/lumiestudio-admin/actions/workflows/deploy.yml)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

🔐 **[admin.lumiestudio.com.br](https://admin.lumiestudio.com.br)**

</div>

---

## Sobre

Painel administrativo do **Lumiê Studio**, acessível exclusivamente pela equipe interna. Consome o mesmo banco de dados Supabase do site público, com subscriptions em tempo real para agendamentos, notificações e chat.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Estado global | Zustand 5 (persist) |
| Roteamento | React Router v7 |
| Banco de dados | Supabase (PostgreSQL + Realtime + Auth) |
| Gráficos | Recharts |
| Ícones | Font Awesome 6 |
| Deploy | GitHub Pages via GitHub Actions |

---

## Arquitetura

```
src/
├── models/             → Tipos compartilhados com o site público
│   └── index.ts           Booking, Client, Service, Professional,
│                          Testimonial, Notification, ChatMessage
│
├── services/
│   └── supabase.ts        Cliente Supabase (URL + anon key via env)
│
├── store/              → Stores Zustand com queries Supabase
│   └── index.ts
│       ├── useAuthStore          Login/logout via Supabase Auth
│       ├── useBookingStore       CRUD + Realtime subscription
│       ├── useClientStore        CRUD + join com bookings
│       ├── useProfessionalStore  CRUD + relação com serviços
│       ├── useServiceStore       CRUD
│       ├── useTestimonialStore   Aprovação/rejeição + Realtime
│       ├── useNotificationStore  Leitura + Realtime (persist)
│       └── useChatStore          Mensagens + Realtime por booking
│
├── components/
│   └── layout/
│       ├── AdminLayout.tsx   Wrapper com Sidebar + Header
│       ├── Sidebar.tsx       Navegação com badges de pendentes
│       └── Header.tsx        Notificações em tempo real + perfil
│
└── views/
    ├── auth/
    │   └── LoginPage.tsx
    ├── dashboard/
    │   └── DashboardPage.tsx   Stats + gráficos Recharts (AreaChart + PieChart)
    ├── bookings/
    │   └── BookingsPage.tsx    Lista filtrada + calendário visual + modal
    ├── clients/
    │   └── ClientsPage.tsx     Cards + histórico + saldo de manutenções
    ├── professionals/
    │   └── ProfessionalsPage.tsx
    ├── services/
    │   └── ServicesPage.tsx
    ├── testimonials/
    │   └── TestimonialsAdminPage.tsx  Aprovação com badge de pendentes
    ├── reports/
    │   └── ReportsPage.tsx
    └── chat/
        └── ChatPage.tsx        Mensagens em tempo real por agendamento
```

---

## Módulos

### Dashboard
- Cards de estatísticas: total, pendentes, confirmados hoje, receita mensal/total
- Gráfico de área — agendamentos por dia no mês atual
- Gráfico de pizza — distribuição por status
- Tabela dos agendamentos mais recentes

### Agendamentos
- **Visualização em lista** com filtros por status, data e busca por cliente
- **Visualização em calendário** com grid mensal e contagem por dia
- Modal de detalhes com atualização de status e link para o perfil do cliente
- Realtime: atualiza automaticamente ao receber novo agendamento

### Clientes
- Cards com histórico de sessões vinculado via FK (`client_id`)
- Saldo de manutenções com controle `+` / `−`
- Total gasto e última visita calculados via join Supabase
- Link bidirecional: cliente → agendamentos / agendamento → cliente

### Depoimentos
- Fila de aprovação com badge dourado na sidebar
- Abas: Pendentes / Aprovados / Todos
- Botão "Ver cliente" no modal quando `client_id` está vinculado
- Realtime: badge atualiza ao receber novo depoimento

### Notificações
- Dropdown com histórico persistido (Zustand persist)
- Badge vermelho pulsante com contagem de não lidas
- Realtime subscription na tabela `notifications`

---

## Realtime — Supabase

```typescript
// Exemplo: subscription de agendamentos
const channel = supabase
  .channel('bookings-realtime')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'bookings' },
    () => get().fetch()
  )
  .subscribe();
```

Tabelas com Realtime habilitado:
- `bookings`
- `chat_messages`
- `notifications`
- `testimonials`
- `clients`

---

## CI/CD — GitHub Actions

```yaml
on:
  push:
    branches: [main]

jobs:
  build:
    - npm ci
    - npm run build
      env:
        VITE_SUPABASE_URL:  ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON: ${{ secrets.VITE_SUPABASE_ANON }}
  deploy:
    - actions/deploy-pages@v4
```

### Secrets necessários

| Secret | Descrição |
|--------|-----------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON` | Chave anon (pública por design) |

---

## Setup local

```bash
git clone https://github.com/lumiestudiocare/lumiestudio-admin.git
cd lumiestudio-admin

npm install

# Criar .env.local
echo "VITE_SUPABASE_URL=https://xxxx.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON=eyJhbGci..." >> .env.local

npm run dev
```

**Node.js 20+** é obrigatório. Acesso restrito a usuários cadastrados em `Authentication → Users` no Supabase.

---

## Banco de dados compartilhado

Este painel consome o mesmo projeto Supabase do site público. O schema completo está em:

```
lumiestudiocare.github.io/supabase/schema.sql
```

---

## Repositórios relacionados

| Repositório | Descrição |
|-------------|-----------|
| [`lumiestudiocare/lumiestudiocare.github.io`](https://github.com/lumiestudiocare/lumiestudiocare.github.io) | Site público + agendamento + painel do cliente |

---

## Licença

MIT © [Lumiê Studio](https://lumiestudio.com.br)

---

<div align="center">
  <sub>Desenvolvido com ✦ para o Lumiê Studio — Beleza & Estética · Carapicuíba/SP</sub>
</div>
