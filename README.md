# Landing page institucional de cibersegurança — linguagem CLI

Página única, estática, em pt-BR. A linguagem de terminal é a identidade visual e também um
atalho real de navegação: todo comando tem equivalente em link ou botão.

- **Stack:** Astro 7.4.2 (saída estática) · TypeScript strict · Tailwind CSS 4.3.3 · Node 24
- **Sem frameworks de UI:** o terminal é TypeScript puro (≈ 2,4 KB de JS gzip no total).
- **Sem cookies, rastreadores ou scripts de terceiros.**

> **Estado atual:** os dados da organização ainda não foram fornecidos. O build de produção
> (`npm run build`) falha de propósito até que `src/content/organizacao.ts` esteja completo.

---

## 1. Como rodar

```bash
npm install
npm run dev:completo   # desenvolvimento com dados de exemplo
```

| Script | O que faz |
|---|---|
| `npm run dev` | desenvolvimento com os dados reais de `organizacao.ts` (pendências aparecem tracejadas) |
| `npm run dev:minimo` · `dev:completo` · `dev:extremo` | desenvolvimento com uma variante de exemplo |
| `npm run build` | **produção**: roda o portão de publicação e só então `astro build` (saída em `dist/`) |
| `npm run build:verificacao` | build das 3 variantes de exemplo em `dist-verificacao/`, sem portão; **nunca é publicado** |
| `npm run verificar` | tipos, testes unitários, contraste, build de verificação, checagens estáticas e e2e |
| `npm run verificar:lighthouse` | Lighthouse mobile e desktop sobre o build de verificação |

### Variantes de exemplo (`FIXTURE`)

Os dados de exemplo ficam em `src/content/organizacao.exemplo.ts` e **só valem com a variável
`FIXTURE`**. Todo texto de exemplo é visivelmente fictício (`[Nome da organização]`), usa o
domínio reservado `example.com` e números com DDD 00.

- `minimo` — nome, proposta, 1 serviço, 1 canal
- `completo` — todas as seções
- `extremo` — todos os textos no limite de tamanho e 8 serviços

Os scripts `dev:*` definem `FIXTURE` sem depender do shell. Para definir à mão:
PowerShell `$env:FIXTURE='completo'; npm run dev` · bash `FIXTURE=completo npm run dev`.

---

## 2. Como preencher `src/content/organizacao.ts`

É a **fonte única** do conteúdo institucional, validada com Zod no build (`src/content/schema.ts`).

- **Dado necessário que ainda falta:** escreva `"PENDENTE: <o que falta>"`. Em desenvolvimento
  aparece com borda tracejada e o rótulo `[pendente]`; o build de produção falha enquanto existir.
- **Campo opcional que não existe:** remova a chave ou deixe a lista vazia. A seção correspondente
  não é renderizada, e seu link no menu, seu comando no terminal e seu número somem junto; a
  numeração é recalculada sem lacunas.

| Seção | Aparece quando |
|---|---|
| Hero + terminal | sempre (exige `nome` e `propostaDeValor`) |
| 01 Serviços | ≥ 1 serviço completo (`titulo`, `problema`, `paraQuem`, 2 a 6 itens em `inclui`, `proximoPasso`) |
| 02 Abordagem | ≥ 2 etapas |
| 03 Sobre | `sobre` preenchido (parágrafos separados por linha em branco) |
| 04 Confiança | ≥ 1 item com `urlVerificacao` e `autorizadoPublicar: true` |
| 05 FAQ | ≥ 2 perguntas |
| 06 Contato | ≥ 1 canal: `email`, `telefone`, `whatsapp` ou `linkedin` |

Observações:

- **Orçamentos de tamanho** (por exemplo, `nome` ≤ 40, `propostaDeValor` ≤ 90) geram **aviso**, não erro.
- `whatsapp` é só dígitos, com DDI: `"5511999999999"`. `telefone` é o texto exibido: `"+55 11 3333-4444"`.
- `proximoPasso.destino` é `"contato"` (âncora da seção) ou um canal (`"email"`, `"whatsapp"`…);
  o build rejeita um destino cujo canal não esteja preenchido.
- `marca.logo` e `marca.favicon` recebem caminhos dentro de `public/` de arquivos **fornecidos**
  pela organização (copie-os para `public/`). Sem eles, o cabeçalho mostra o nome em texto e não há favicon.
- Normas, "SOC", "resposta a incidentes" e "24/7" só podem aparecer se constarem dos dados.

---

## 3. Portão de publicação

`npm run build` executa `scripts/verificar-pendencias.ts` antes do Astro e **falha** se:

1. `FIXTURE` estiver definida;
2. houver qualquer valor `PENDENTE`;
3. sobrar dado de exemplo (texto entre colchetes ou domínio `example.*`);
4. faltar algum destes: nome e proposta de valor · `sobre` · 1 serviço completo · 1 canal de contato real;
5. houver formulário sem `legal.politicaPrivacidadeUrl`.

Para passar: preencha os campos do item 4, remova todos os `PENDENTE` e rode `npm run build`.
A lista de problemas sai no terminal, com o caminho de cada campo.

---

## 4. Contato, formulário, domínio, sitemap e `security.txt`

- **Contato:** links diretos (`mailto:`, `tel:`, `https://wa.me/…`, LinkedIn). Canal ausente não aparece.
  O botão principal da seção Contato usa o primeiro canal disponível na ordem e-mail → WhatsApp → telefone → LinkedIn.
- **Formulário:** **não implementado** (hipótese H2). Só pode existir com `contato.formularioEndpoint`
  **e** `legal.politicaPrivacidadeUrl`; ao implementar, acrescente o endpoint em `connect-src` e
  `form-action` da CSP em `vercel.json`.
- **Domínio:** preencha `siteUrl` em `organizacao.ts` (ou a variável `SITE_URL` na Vercel). Com ele
  passam a existir canonical, `og:url`, `url` no JSON-LD, `sitemap.xml` e a linha `Sitemap:` no `robots.txt`.
  Sem ele, nenhuma URL absoluta é gerada.
- **`/.well-known/security.txt`** (RFC 9116): gerado só com `contato.contatoSeguranca`. O campo
  `Expires` fica a 364 dias da data do build; **publique de novo antes de vencer**.
- **Open Graph:** título, descrição e `twitter:card=summary`. A imagem `og.png` (tipográfica, 1200 × 630)
  está **pendente**: só pode ser gerada com nome e proposta reais.

---

## 5. Deploy na Vercel via GitHub

1. Crie um repositório no GitHub e envie este projeto (o `.gitignore` já exclui `node_modules`, `dist*` e capturas).
2. Na Vercel: **Add New → Project → Import** o repositório. O `vercel.json` já define
   framework `astro`, comando de build **`npm run build`** e saída `dist`.
3. Enquanto `organizacao.ts` tiver pendências, o deploy **falha no portão** — é o comportamento esperado.
4. Use primeiro um **deploy de preview** e valide os cabeçalhos:
   `curl -I https://<preview>.vercel.app` (CSP, HSTS, nosniff, Referrer-Policy, COOP, Permissions-Policy)
   e confira o console do navegador sem erros de CSP.

**Cabeçalhos (`vercel.json`):** CSP sem `'unsafe-inline'`; `Strict-Transport-Security: max-age=63072000`
(acrescentar `includeSubDomains` e `preload` **só com confirmação**, porque afetam todos os subdomínios
do domínio próprio); `Permissions-Policy` negando câmera, microfone, geolocalização, pagamento, USB e
`browsing-topics`; cache imutável para `/_astro/`.

**Analytics:** desativado. Qualquer ferramenta de métricas exigiria mudar a CSP, rever a política de
privacidade (LGPD) e, possivelmente, um banner de consentimento.

**Telemetria do Astro:** o Astro coleta dados anônimos de uso da ferramenta. Para desligar só no seu
computador: `npx astro telemetry disable` (altera uma configuração global do usuário) ou defina
`ASTRO_TELEMETRY_DISABLED=1`.

---

## 6. Checklist de pré-publicação

- [ ] `organizacao.ts` sem nenhum `PENDENTE` e sem dado de exemplo
- [ ] Textos institucionais revisados e aprovados pela organização (ver `CONTEUDO-PARA-APROVACAO.md`)
- [ ] Itens de `confianca` com fonte verificável e autorização de publicação
- [ ] Logo e favicon copiados para `public/` (se houver) e apontados em `marca`
- [ ] `siteUrl` preenchido, se já houver domínio
- [ ] `contatoSeguranca` preenchido, se a organização receber relatos de vulnerabilidade
- [ ] Política de privacidade publicada (obrigatória se houver formulário)
- [ ] `npm run verificar` sem falhas
- [ ] `npm run build` passando no portão
- [ ] Deploy de **preview** com cabeçalhos e console conferidos
- [ ] Teste manual com leitor de tela (NVDA ou VoiceOver)
- [ ] Imagem `og.png` gerada com nome e proposta reais

---

## 7. Resultados das verificações (27/10/2026)

Executadas sobre `dist-verificacao/` (variantes de exemplo), Node 24.21.0, Chrome instalado.

| ID | Verificação | Resultado |
|---|---|---|
| V01 | `astro check` + `build:verificacao` | 0 erros, 0 avisos; 3 variantes geradas |
| V02 | lógica do terminal (vitest) | 27 testes de terminal aprovados (49 no total) |
| V03 | portão de conteúdo | `npm run build` falha com `PENDENTE` e com `FIXTURE`; passa com dados completos (teste unitário) |
| V04 | contraste dos tokens | todos os pares acima do mínimo (texto ≥ 4,5:1; componentes e foco ≥ 3:1) |
| V05 | axe (375 e 1440 px, 3 variantes + estados interativos + 404) | 0 violações de qualquer impacto |
| V06 | teclado (Tab, Enter, ↓, →, Esc, Tab para sair) | foco sempre visível e nunca encoberto, sem armadilha, todos os comandos |
| V07 | reflow a 320 px | sem rolagem horizontal nas 3 variantes, com menu aberto e saída cheia |
| V08 | sem JavaScript | seções visíveis e índice do terminal como links |
| V09 | Lighthouse (completo) | mobile 98/100/100/100 · desktop 100/100/100/100 (desempenho/acess./boas práticas/SEO) |
| V10 | orçamento de JS | 2,40 KB gzip (limite 15 KB) |
| V11 | CSP | 0 código inline; 0 erros de CSP com os cabeçalhos aplicados localmente · preview Vercel: não verificado |
| V12 | linguagem proibida | 0 ocorrências |
| V13 | links | 0 âncoras quebradas; links externos só de `organizacao.ts` |
| V14 | movimento reduzido | transições e animações em 0s |
| V15 | leitor de tela | não verificado (exige teste manual) |

---

## Estrutura

```
src/content/   organizacao.ts (dados reais) · organizacao.exemplo.ts · schema.ts · comandos.ts
src/lib/       conteudo.ts · portao.ts · terminal.ts (lógica pura) · terminal-dom.ts · navegacao.ts · seo.ts
src/components Header · Hero · Terminal · SaidaTerminal · Secao · Servicos · Abordagem · Sobre
               Confianca · Faq · Contato · Footer · StatusLine · Seta · Texto
src/pages/     index.astro · 404.astro · robots.txt.ts · [mapa].xml.ts · .well-known/[arquivo].ts
src/styles/    tokens.css (fonte única dos tokens) · fontes.css · global.css
scripts/       verificar-pendencias · verificar-contraste · verificar-build · lighthouse
               build-verificacao · com-fixture · servir · capturas
tests/         *.test.ts (vitest) · e2e/*.spec.ts (Playwright + axe)
public/fonts/  Schibsted Grotesk e JetBrains Mono (woff2, latin, 400/600) + licenças OFL
```
