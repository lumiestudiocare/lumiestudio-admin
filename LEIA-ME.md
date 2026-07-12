# Fix: toggle "active" do admin agora reflete no site público

Repositório alvo: `lumiestudiocare/lumiestudiocare.github.io`

## Opção A — aplicar o patch (mais rápido)

```bash
cd lumiestudiocare.github.io
git checkout -b fix/services-active-toggle
git apply PATCH.diff
git add -A
git commit -m "feat(services): respeitar o toggle 'active' do painel admin no site público"
git push -u origin fix/services-active-toggle
```

Depois é só abrir o Pull Request no GitHub e dar merge.

## Opção B — substituir os arquivos manualmente

Copie estes arquivos por cima dos correspondentes no repositório
(os caminhos já batem com a estrutura do projeto):

- `src/App.tsx`
- `src/models/index.ts`
- `src/services/data.ts`
- `src/store/index.ts`
- `src/views/public/BookingPage.tsx`
- `src/views/public/HomePage.tsx`

Depois:

```bash
npm install
npm run build   # confere se compila
git add -A
git commit -m "feat(services): respeitar o toggle 'active' do painel admin no site público"
git push
```

## O que mudou

- `Service` ganhou o campo `active` (mesmo shape do admin).
- Novo `useCatalogStore` (em `src/store/index.ts`) busca a tabela
  `services` do Supabase quando o app abre, mantendo:
  - `services`: todos os serviços (útil pra manter nomes de
    agendamentos/depoimentos antigos funcionando mesmo se o serviço
    for desativado depois);
  - `activeServices`: só os que estão com `active = true`.
- `HomePage` e o passo 1 do agendamento (`BookingPage`) agora usam
  `activeServices` em vez do array estático — então um serviço
  desativado no admin some do site na próxima carga da página.
- Se alguém tiver um link salvo/compartilhado apontando pra um
  serviço que foi desativado nesse meio tempo, a seleção é limpa
  automaticamente assim que o catálogo carrega.
- Se o Supabase estiver fora do ar, o site cai de volta pros dados
  estáticos (fallback), pra não quebrar a página.

## Testado

- `npx tsc --noEmit -p tsconfig.app.json` ✅ sem erros
- `npm run build` ✅ build de produção completo sem erros
