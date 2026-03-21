import { StatusOS, TipoEquipamento, CanalComunicacao, FormaPagamento } from "@prisma/client"

export const IS_MOCK = process.env.MOCK_DB === "true"

// ─── Tipos internos do mock ───────────────────────────────────────────────────

export type MockCliente = {
  id: string
  tipo: string
  documento: string
  nome: string
  telefone: string
  email: string | null
  createdAt: Date
  updatedAt: Date
}

export type MockEquipamento = {
  id: string
  osId: string
  tipo: TipoEquipamento
  marca: string | null
  modelo: string | null
  problemaRelatado: string
  createdAt: Date
}

export type MockOrcamento = {
  id: string
  osId: string
  descricaoManutencao: string
  valor: number
  aprovado: boolean | null
  dataDecisao: Date | null
  canalComunicacao: CanalComunicacao | null
  createdAt: Date
  updatedAt: Date
}

export type MockAvisoCliente = {
  id: string
  osId: string
  canal: CanalComunicacao
  dataAviso: Date
  observacao: string | null
  createdAt: Date
}

export type MockPagamento = {
  id: string
  osId: string
  forma: FormaPagamento
  valor: number
  dataPagamento: Date
  observacao: string | null
  createdAt: Date
}

export type MockOS = {
  id: string
  numero: string
  status: StatusOS
  prazoPrometido: Date | null
  observacoes: string | null
  clienteId: string
  usuarioId: string
  createdAt: Date
  updatedAt: Date
}

// ─── Store em memória ─────────────────────────────────────────────────────────

export const clientes: MockCliente[] = [
  {
    id: "cliente-1",
    tipo: "PF",
    documento: "12345678901",
    nome: "João da Silva",
    telefone: "11987654321",
    email: "joao@email.com",
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-01-10"),
  },
  {
    id: "cliente-2",
    tipo: "PJ",
    documento: "12345678000195",
    nome: "Empresa ABC Ltda",
    telefone: "11912345678",
    email: "contato@empresaabc.com.br",
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
  },
  {
    id: "cliente-3",
    tipo: "PF",
    documento: "98765432100",
    nome: "Maria Oliveira",
    telefone: "11999887766",
    email: null,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
  },
]

export const ordens: MockOS[] = [
  {
    id: "os-1",
    numero: "OS-2026-0001",
    status: "ABERTA",
    prazoPrometido: new Date("2026-04-01"),
    observacoes: "Motor apresentou queima parcial do bobinado. Cliente relatou sobrecarga frequente antes da pane.",
    clienteId: "cliente-1",
    usuarioId: "usuario-mock",
    createdAt: new Date("2026-03-20"),
    updatedAt: new Date("2026-03-20"),
  },
  {
    id: "os-2",
    numero: "OS-2026-0002",
    status: "AGUARDANDO_APROVACAO",
    prazoPrometido: new Date("2026-03-28"),
    observacoes: "Cliente solicitou urgência",
    clienteId: "cliente-2",
    usuarioId: "usuario-mock",
    createdAt: new Date("2026-03-18"),
    updatedAt: new Date("2026-03-19"),
  },
  {
    id: "os-3",
    numero: "OS-2026-0003",
    status: "APROVADA",
    prazoPrometido: new Date("2026-03-25"),
    observacoes: "Máquina veio sem documentação. Verificar procedimento de segurança antes de energizar.",
    clienteId: "cliente-1",
    usuarioId: "usuario-mock",
    createdAt: new Date("2026-03-15"),
    updatedAt: new Date("2026-03-17"),
  },
  {
    id: "os-4",
    numero: "OS-2026-0004",
    status: "PRONTA",
    prazoPrometido: new Date("2026-03-22"),
    observacoes: "Cliente pediu para ligar quando estiver pronto. Confirmar horário de retirada com antecedência.",
    clienteId: "cliente-3",
    usuarioId: "usuario-mock",
    createdAt: new Date("2026-03-10"),
    updatedAt: new Date("2026-03-20"),
  },
  {
    id: "os-5",
    numero: "OS-2026-0005",
    status: "PAGA",
    prazoPrometido: new Date("2026-03-15"),
    observacoes: null,
    clienteId: "cliente-2",
    usuarioId: "usuario-mock",
    createdAt: new Date("2026-03-05"),
    updatedAt: new Date("2026-03-14"),
  },
  {
    id: "os-6",
    numero: "OS-2026-0006",
    status: "REPROVADA",
    prazoPrometido: new Date("2026-03-18"),
    observacoes: null,
    clienteId: "cliente-3",
    usuarioId: "usuario-mock",
    createdAt: new Date("2026-03-08"),
    updatedAt: new Date("2026-03-12"),
  },
]

export const equipamentos: MockEquipamento[] = [
  { id: "eq-1", osId: "os-1", tipo: "MOTOR", marca: "WEG", modelo: "W22 1HP", problemaRelatado: "Motor não liga após partida", createdAt: new Date("2026-03-20") },
  { id: "eq-2", osId: "os-2", tipo: "BOMBA_SUBMERSA", marca: "Schneider", modelo: "BCS-550", problemaRelatado: "Bomba perdendo pressão, possível desgaste no impelidor", createdAt: new Date("2026-03-18") },
  { id: "eq-3", osId: "os-3", tipo: "MAQUINA", marca: "Siemens", modelo: null, problemaRelatado: "Máquina de solda com arco instável", createdAt: new Date("2026-03-15") },
  { id: "eq-4", osId: "os-4", tipo: "MOTOR", marca: "Voges", modelo: "4P 3CV", problemaRelatado: "Superaquecimento durante operação contínua", createdAt: new Date("2026-03-10") },
  { id: "eq-5", osId: "os-5", tipo: "BOMBA_SUBMERSA", marca: "Pedrollo", modelo: "4SR6/7", problemaRelatado: "Sem vazão, ruído anormal no eixo", createdAt: new Date("2026-03-05") },
  { id: "eq-6", osId: "os-6", tipo: "OUTROS", marca: null, modelo: null, problemaRelatado: "Quadro de comando com disjuntor disparando constantemente", createdAt: new Date("2026-03-08") },
]

export const orcamentos: MockOrcamento[] = [
  {
    id: "orc-2", osId: "os-2",
    descricaoManutencao: "Substituição do eixo e rolamentos da bomba, limpeza e balanceamento do impelidor",
    valor: 850.00, aprovado: null, dataDecisao: null, canalComunicacao: "MENSAGEM",
    createdAt: new Date("2026-03-19"), updatedAt: new Date("2026-03-19"),
  },
  {
    id: "orc-3", osId: "os-3",
    descricaoManutencao: "Troca do transformador de corrente e ajuste dos eletrodos",
    valor: 620.50, aprovado: true, dataDecisao: new Date("2026-03-17"), canalComunicacao: "LIGACAO",
    createdAt: new Date("2026-03-16"), updatedAt: new Date("2026-03-17"),
  },
  {
    id: "orc-4", osId: "os-4",
    descricaoManutencao: "Rebobinamento do estator e substituição dos rolamentos",
    valor: 1200.00, aprovado: true, dataDecisao: new Date("2026-03-13"), canalComunicacao: "MENSAGEM",
    createdAt: new Date("2026-03-12"), updatedAt: new Date("2026-03-13"),
  },
  {
    id: "orc-5", osId: "os-5",
    descricaoManutencao: "Substituição do impelidor, eixo e selo mecânico",
    valor: 980.00, aprovado: true, dataDecisao: new Date("2026-03-08"), canalComunicacao: "LIGACAO",
    createdAt: new Date("2026-03-07"), updatedAt: new Date("2026-03-08"),
  },
  {
    id: "orc-6", osId: "os-6",
    descricaoManutencao: "Revisão completa do quadro, substituição de contactores e relés",
    valor: 2100.00, aprovado: false, dataDecisao: new Date("2026-03-12"), canalComunicacao: "MENSAGEM",
    createdAt: new Date("2026-03-10"), updatedAt: new Date("2026-03-12"),
  },
]

export const avisos: MockAvisoCliente[] = [
  { id: "aviso-4", osId: "os-4", canal: "MENSAGEM", dataAviso: new Date("2026-03-20"), observacao: "Avisado por WhatsApp", createdAt: new Date("2026-03-20") },
  { id: "aviso-5", osId: "os-5", canal: "LIGACAO", dataAviso: new Date("2026-03-13"), observacao: null, createdAt: new Date("2026-03-13") },
]

export const pagamentos: MockPagamento[] = [
  {
    id: "pag-5", osId: "os-5",
    forma: "PIX", valor: 980.00,
    dataPagamento: new Date("2026-03-14"),
    observacao: null, createdAt: new Date("2026-03-14"),
  },
]

// Contador para novas OS
let osCounter = 6

export function proximoNumeroOS(): string {
  osCounter++
  return `OS-2026-${String(osCounter).padStart(4, "0")}`
}

export function cuid(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
