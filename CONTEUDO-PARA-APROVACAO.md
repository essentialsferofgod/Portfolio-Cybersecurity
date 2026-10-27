# Conteúdo para aprovação (checkpoint C2)

Status: **nenhum texto institucional foi redigido.** Todo conteúdo institucional (proposta de valor,
subtítulo, serviços, abordagem, sobre, confiança, FAQ, contato) virá dos dados fornecidos pela
organização em `src/content/organizacao.ts`, sem reescrita além de reorganização.

Este checkpoint não bloqueia o desenvolvimento, mas bloqueia a publicação: quando os dados chegarem,
qualquer proposta de redação que reorganize os fatos fornecidos entra aqui, marcada como **rascunho**,
para aprovação antes do deploy.

---

## Microcopy de interface (para revisão opcional)

A especificação permite redigir a microcopy livremente. Ela está listada aqui para facilitar a revisão.

### Navegação e chamadas
- CTA principal: **Falar com a equipe** · CTA secundário: **Ver serviços**
- Link de pular: **Pular para o conteúdo** · rodapé: **voltar ao topo**, **política de privacidade**
- Volta ao terminal em cada seção: **↑ terminal** (leitores de tela ouvem "voltar ao terminal")
- Títulos de seção: Serviços · Abordagem · Sobre · Confiança · Perguntas frequentes · Contato
- Rótulos de pares: `para:` · `inclui:` · `próximo passo:` · `atuação:` · `público:` · `razão social:` · `cnpj:`
- Contato: `e-mail` · `telefone` · `whatsapp` · `linkedin` · `endereço` · `segurança` ("para relatar vulnerabilidades")
- Confiança: colunas `item` · `emissor` · `verificar ↗`; tipos `certificação` · `caso` · `outro`

### Terminal
- Cabeçalho: `terminal · navegação`
- Boas-vindas: "terminal de navegação. digite um comando ou use os atalhos abaixo."
- Sem JavaScript: "índice da página"
- Descrições: help "lista os comandos" · services "serviços oferecidos" · approach "como o trabalho acontece" ·
  about "sobre a organização" · faq "perguntas frequentes" · contact "canais de contato" · clear "limpa a saída"
- Saídas: "3 serviços" / "ver detalhes em 01 / serviços" · "ver como funciona em …" · "ler mais em …" ·
  "ver respostas em …" · "ver todos em …"
- Erro: `erro: comando não encontrado: "<entrada>"` · "você quis dizer: <comando> [executar]" ·
  "digite help para ver os comandos"
- Leitores de tela: "Terminal de navegação" · "Comando" · "Digite um comando, como ajuda, e pressione Enter.
  Todo o conteúdo também está no menu."

### Página 404
- `erro 404: caminho não encontrado`
- "Esta página não existe."
- "O endereço pode ter sido digitado errado ou não existir mais. O conteúdo de <nome> está todo na página inicial."
- Botão: **Ir para o início**

---

# RASCUNHOS para a Spike Security (aguardam aprovação)

> **Rascunho, não publicado.** Redigido a pedido, sem fatos fornecidos além do nome. Tudo que está
> marcado com **[confirmar]** é suposição minha sobre o que a organização faz: só entra em
> `organizacao.ts` depois que você confirmar ou corrigir.

## Proposta de valor (até 90 caracteres), cinco opções

| # | Texto | Caracteres |
|---|---|---|
| 1 | Segurança da informação para pequenas empresas, com diagnóstico claro e plano de ação. | 86 |
| 2 | Avaliamos a segurança do seu negócio e mostramos o que corrigir primeiro. | 73 |
| 3 | Cibersegurança prática para quem precisa proteger dados, sistemas e reputação. | 78 |
| 4 | Reduzimos riscos digitais do seu negócio com análise técnica e orientação objetiva. | 83 |
| 5 | Spike Security: segurança digital sem jargão, do diagnóstico às correções. | 74 |

**Escolha recomendada: nº 4.** Diz o que a organização faz e como, sem supor o porte do cliente
(a nº 1 supõe "pequenas empresas") e sem promessa absoluta. O nome já aparece ao lado, então a
nº 5 repetiria. **[confirmar]** que "análise técnica" descreve o trabalho.

## Texto "sobre" (até 600 caracteres)

> A Spike Security é uma organização de cibersegurança. Ajudamos negócios a entender onde estão seus
> riscos digitais e o que fazer a respeito, com linguagem direta e recomendações em ordem de
> prioridade. **[confirmar: região de atuação, modelo de atendimento (remoto/presencial) e público
> principal antes de incluir qualquer um desses dados.]**

Só o primeiro fato (é uma organização de cibersegurança) vem de você. Tempo de mercado, equipe,
clientes e resultados ficam de fora, a menos que você forneça.

## Serviços (rascunho; **[confirmar]** se a organização realmente oferece cada um)

### Diagnóstico de segurança
- **Problema:** Não saber quais riscos digitais o negócio tem nem por onde começar a corrigir. (86)
- **Para quem:** Empresas que ainda não fizeram uma avaliação de segurança. (63)
- **Inclui:**
  - Levantamento dos sistemas, contas e dados mais importantes
  - Identificação dos riscos mais relevantes
  - Relatório com prioridades e recomendações
  - Reunião para apresentar os resultados
- **Próximo passo:** Falar com a equipe → contato

### Orientação para a equipe **[confirmar se existe]**
- **Problema:** Funcionários sem orientação clara sobre senhas, e-mails suspeitos e boas práticas. (88)
- **Para quem:** Empresas que querem preparar a equipe para o uso seguro dos sistemas. (79)
- **Inclui:**
  - Conversa ou treinamento sobre os riscos do dia a dia
  - Guia curto de boas práticas para a equipe
- **Próximo passo:** Falar com a equipe → contato

## Contato

- Instagram informado: `https://www.instagram.com/spikemedia._/`. **[confirmar]** que é a conta da
  Spike Security (o nome da conta é "spikemedia._"). O site hoje não tem o canal Instagram; é uma
  mudança pequena no schema, que faço depois da sua confirmação.
- Um canal direto (e-mail ou WhatsApp) costuma converter melhor que Instagram; se existir, inclua.
