# PRD — Sistema de OS | GS Eletrotécnica

## Contexto

Sistema web de gestão de Ordens de Serviço para uma assistência técnica de equipamentos elétricos (motores, máquinas, bombas submersas). Hoje o processo é feito em papel. O objetivo é digitalizar completamente o fluxo de atendimento.

**Stack:** Next.js 14 (App Router) + TypeScript + Prisma + PostgreSQL + NextAuth.js + Tailwind CSS  
**Hospedagem:** Vercel (app) + Supabase ou Railway (banco)  
**Plataforma:** Web (navegador)

---

## Usuários e Perfis

Existem dois perfis com acessos diferentes. O middleware deve proteger as rotas por perfil.

### ATENDENTE
- Abre e edita OS
- Cadastra e busca clientes
- Lança orçamentos
- Atualiza status da OS
- Registra aviso ao cliente e pagamento
- **Não acessa** dashboard gerencial nem relatórios financeiros

### GERENTE
- Tudo que o atendente faz
- Acessa dashboard com KPIs
- Acessa relatórios (faturamento, OS por status, equipamentos)
- Gerencia usuários do sistema

---

## Banco de Dados — Entidades

```prisma
model Cliente {
  id          String   @id @default(cuid())
  tipo        TipoCliente // PF | PJ
  nome        String   // nome (PF) ou razão social (PJ)
  documento   String   @unique // CPF ou CNPJ
  telefone    String
  email       String?
  ordens      OrdemServico[]
  criadoEm   DateTime @default(now())
}

model OrdemServico {
  id              String     @id @default(cuid())
  numero          String     @unique // gerado: OS-2025-0001
  cliente         Cliente    @relation(fields: [clienteId], references: [id])
  clienteId       String
  dataEntrada     DateTime   @default(now())
  prazoPrometido  DateTime
  status          StatusOS   @default(ABERTA)
  equipamentos    Equipamento[]
  orcamento       Orcamento?
  aviso           AvisoCliente?
  pagamento       Pagamento?
  criadoEm       DateTime   @default(now())
  atualizadoEm   DateTime   @updatedAt
}

model Equipamento {
  id               String         @id @default(cuid())
  os               OrdemServico   @relation(fields: [osId], references: [id])
  osId             String
  tipo             TipoEquipamento // MAQUINA | MOTOR | BOMBA_SUBMERSA | OUTROS
  problemaRelatado String
}

model Orcamento {
  id                 String       @id @default(cuid())
  os                 OrdemServico @relation(fields: [osId], references: [id])
  osId               String       @unique
  descricaoManutencao String
  valor              Decimal
  aprovado           Boolean?     // null = aguardando, true = aprovado, false = reprovado
  dataDecisao        DateTime?
  canalComunicacao   String?      // "whatsapp" | "telefone" | "email"
  dataComunicacao    DateTime?
}

model AvisoCliente {
  id        String       @id @default(cuid())
  os        OrdemServico @relation(fields: [osId], references: [id])
  osId      String       @unique
  canal     CanalAviso   // LIGACAO | MENSAGEM
  dataAviso DateTime
}

model Pagamento {
  id            String        @id @default(cuid())
  os            OrdemServico  @relation(fields: [osId], references: [id])
  osId          String        @unique
  forma         FormaPagamento // DINHEIRO | PIX | CHEQUE
  valor         Decimal
  dataPagamento DateTime      @default(now())
}

model Usuario {
  id       String  @id @default(cuid())
  nome     String
  email    String  @unique
  senha    String  // hash bcrypt
  perfil   Perfil  // ATENDENTE | GERENTE
  ativo    Boolean @default(true)
}

enum TipoCliente     { PF PJ }
enum StatusOS        { ABERTA AGUARDANDO_APROVACAO APROVADA PRONTA PAGA REPROVADA }
enum TipoEquipamento { MAQUINA MOTOR BOMBA_SUBMERSA OUTROS }
enum CanalAviso      { LIGACAO MENSAGEM }
enum FormaPagamento  { DINHEIRO PIX CHEQUE }
enum Perfil          { ATENDENTE GERENTE }
```

---

## Máquina de Estados da OS

A OS segue transições estritas. Nunca permita pular etapas.

```
ABERTA
  └─► AGUARDANDO_APROVACAO   (ação: lançar orçamento)
        ├─► APROVADA          (ação: cliente aprova)
        │     └─► PRONTA      (ação: serviço concluído)
        │           └─► PAGA  (ação: registrar pagamento)
        └─► REPROVADA         (ação: cliente reprova → deve retirar equipamento)
```

**Regra:** cada transição deve validar o estado anterior no backend antes de persistir.

---

## Fluxo de Atendimento (passo a passo)

### Passo 1 — Identificar o Cliente
- Atendente busca por CPF (PF) ou CNPJ (PJ)
- Se encontrado: confirmar/atualizar dados
- Se não encontrado: cadastrar novo cliente
  - PF: nome, CPF, telefone (WhatsApp), e-mail
  - PJ: razão social, CNPJ, telefone (WhatsApp), e-mail

### Passo 2 — Abrir a OS
- Gerar número único no formato `OS-YYYY-NNNN` (ex: OS-2025-0001)
- Registrar data de entrada e prazo prometido ao cliente
- Se o cliente trouxe **1 equipamento** → 1 OS
- Se trouxe **2 ou mais** → 1 OS por equipamento (mesmas regras, processos independentes)

### Passo 3 — Registrar Equipamento
- Tipo: `MAQUINA` | `MOTOR` | `BOMBA_SUBMERSA` | `OUTROS`
- Descrição livre do problema relatado pelo cliente

### Passo 4 — Lançar Orçamento
- Descrição da manutenção a realizar
- Valor (decimal)
- Canal pelo qual o orçamento foi comunicado ao cliente (WhatsApp/telefone/e-mail)
- Status muda para `AGUARDANDO_APROVACAO`

### Passo 5 — Registrar Decisão do Cliente
- **Aprovado** → status vai para `APROVADA`
- **Reprovado** → status vai para `REPROVADA` (cliente deve retirar o equipamento)

### Passo 6 — Marcar como Pronta
- Status muda para `PRONTA`
- Registrar aviso ao cliente: canal (LIGACAO | MENSAGEM) + data do aviso

### Passo 7 — Registrar Pagamento
- Forma: DINHEIRO | PIX | CHEQUE
- Valor pago
- Status muda para `PAGA` (OS encerrada)

---

## Rotas da Aplicação

```
/login                          → pública

/os                             → lista de OS (atendente + gerente)
/os/nova                        → abrir nova OS
/os/[id]                        → detalhe e edição da OS
/os/[id]/orcamento              → lançar orçamento
/os/[id]/decisao                → aprovação/reprovação
/os/[id]/pronta                 → marcar pronta + aviso
/os/[id]/pagamento              → registrar pagamento

/clientes                       → lista de clientes
/clientes/[id]                  → histórico de OS do cliente

/dashboard                      → GERENTE apenas
/relatorios                     → GERENTE apenas

/admin/usuarios                 → GERENTE apenas
```

---

## Dashboard Gerencial (apenas GERENTE)

### KPIs (cards no topo)
- OS abertas hoje
- OS aguardando aprovação
- OS prontas para retirada
- Faturamento do mês atual

### Relatórios
- **OS por status:** quantidade de OS em cada status (gráfico de barras)
- **Faturamento por período:** filtro dia / semana / mês, total em R$
- **Equipamentos mais recorrentes:** ranking por tipo de equipamento
- **OS em andamento:** lista com número, cliente, prazo prometido e dias em aberto

---

## Regras de Negócio

1. Número da OS é gerado automaticamente — nunca manual
2. Uma OS tem exatamente 1 equipamento. Para múltiplos equipamentos, criar múltiplas OS para o mesmo cliente no mesmo atendimento
3. Não é possível lançar pagamento sem a OS estar no status `PRONTA`
4. Não é possível marcar como `PRONTA` sem a OS estar `APROVADA`
5. OS `REPROVADA` não pode avançar para nenhum outro status
6. Atendente não pode acessar rotas de dashboard e relatórios (middleware bloqueia)
7. Campos obrigatórios na OS: cliente, equipamento, problema relatado, prazo prometido
8. Valor do orçamento e do pagamento devem ser positivos

---

## Fora do Escopo do MVP

- Envio automático de WhatsApp (apenas registrar que foi avisado)
- App mobile
- Estoque de peças
- Nota fiscal eletrônica
- Portal do cliente
- Integração contábil

---

## Ordem de Desenvolvimento

Seguir nesta ordem para evitar dependências quebradas:

1. `schema.prisma` completo com todas as entidades e enums
2. Configurar NextAuth.js com credenciais (email + senha) e sessão com perfil
3. `middleware.ts` protegendo rotas por perfil
4. CRUD de Clientes (busca por CPF/CNPJ, cadastro PF e PJ)
5. Abertura de OS (geração de número, vínculo com cliente)
6. Registro de equipamento + problema
7. Lançamento de orçamento + mudança de status
8. Aprovação / reprovação
9. Marcar pronta + aviso ao cliente
10. Registro de pagamento
11. Listagem de OS com filtros (status, período, cliente)
12. Dashboard e relatórios (somente após fluxo principal funcionando)
