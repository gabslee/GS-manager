import {
  clientes,
  ordens,
  equipamentos,
  orcamentos,
  avisos,
  pagamentos,
  type MockOS,
} from "./data"
import { StatusOS } from "@prisma/client"

// Helpers para enriquecer dados
function enrichOS(os: MockOS) {
  return {
    ...os,
    cliente: clientes.find((c) => c.id === os.clienteId)!,
    equipamento: equipamentos.find((e) => e.osId === os.id) ?? null,
    orcamento: orcamentos.find((o) => o.osId === os.id) ?? null,
    avisos: avisos.filter((a) => a.osId === os.id),
    pagamento: pagamentos.find((p) => p.osId === os.id) ?? null,
    usuario: { nome: "Gerente Mock" },
  }
}

// ── getOSList ─────────────────────────────────────────────────────────────────
export function mockGetOSList(params: {
  status?: string
  clienteNome?: string
  page?: number
  all?: boolean
}) {
  const { status, clienteNome, page = 1, all } = params
  const take = 20
  const skip = (page - 1) * take

  let items = ordens

  if (status && status !== "TODOS") {
    items = items.filter((os) => os.status === status)
  }

  if (clienteNome) {
    const clientesMatch = clientes
      .filter((c) => c.nome.toLowerCase().includes(clienteNome.toLowerCase()))
      .map((c) => c.id)
    items = items.filter((os) => clientesMatch.includes(os.clienteId))
  }

  const total = items.length
  if (!all) items = items.slice(skip, skip + take)

  return {
    items: items.map((os) => ({
      ...os,
      cliente: clientes.find((c) => c.id === os.clienteId)!,
      equipamento: equipamentos.find((e) => e.osId === os.id) ?? null,
    })),
    total,
  }
}

// ── getOSById ─────────────────────────────────────────────────────────────────
export function mockGetOSById(id: string) {
  const os = ordens.find((o) => o.id === id)
  if (!os) return null
  return enrichOS(os)
}

// ── getDashboardKPIs ──────────────────────────────────────────────────────────
export function mockGetDashboardKPIs() {
  const abertas = ordens.filter((o) => o.status === "ABERTA").length
  const aguardando = ordens.filter((o) => o.status === "AGUARDANDO_APROVACAO").length
  const prontas = ordens.filter((o) => o.status === "PRONTA").length
  const faturamentoMes = pagamentos.reduce((sum, p) => sum + p.valor, 0)

  return { abertas, aguardando, prontas, faturamentoMes }
}

// ── getOSPorStatus ────────────────────────────────────────────────────────────
export function mockGetOSPorStatus() {
  const statuses: StatusOS[] = ["ABERTA", "AGUARDANDO_APROVACAO", "APROVADA", "PRONTA", "PAGA", "REPROVADA"]
  return statuses.map((status) => ({
    status,
    total: ordens.filter((o) => o.status === status).length,
  })).filter((item) => item.total > 0)
}

// ── getEquipamentosMaisRecorrentes ────────────────────────────────────────────
export function mockGetEquipamentosMaisRecorrentes() {
  const count: Record<string, number> = {}
  equipamentos.forEach((e) => {
    count[e.tipo] = (count[e.tipo] ?? 0) + 1
  })
  return Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .map(([tipo, total]) => ({ tipo, total }))
}

// ── getOSEmAndamento ──────────────────────────────────────────────────────────
export function mockGetOSEmAndamento() {
  return ordens
    .filter((o) => !["PAGA", "REPROVADA"].includes(o.status))
    .map((os) => ({
      ...os,
      cliente: clientes.find((c) => c.id === os.clienteId)!,
    }))
    .sort((a, b) => (a.prazoPrometido?.getTime() ?? 0) - (b.prazoPrometido?.getTime() ?? 0))
    .slice(0, 20)
}

// ── buscarClientes ────────────────────────────────────────────────────────────
export function mockBuscarClientes(query: string) {
  const q = query.toLowerCase().replace(/\D/g, "") || query.toLowerCase()
  return clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(query.toLowerCase()) ||
      c.documento?.includes(q)
  )
}

// ── getClienteById ────────────────────────────────────────────────────────────
export function mockGetClienteById(id: string) {
  const cliente = clientes.find((c) => c.id === id)
  if (!cliente) return null
  const ordensDoCliente = ordens
    .filter((o) => o.clienteId === id)
    .map((os) => ({
      ...os,
      equipamento: equipamentos.find((e) => e.osId === os.id) ?? null,
      pagamento: pagamentos.find((p) => p.osId === os.id) ?? null,
    }))
  return { ...cliente, ordensServico: ordensDoCliente }
}

// ── getClientes ───────────────────────────────────────────────────────────────
export function mockGetClientes(q?: string) {
  let result = clientes
  if (q) {
    result = clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q.toLowerCase()) ||
        c.documento?.includes(q.replace(/\D/g, ""))
    )
  }
  return result.map((c) => ({
    ...c,
    _count: { ordensServico: ordens.filter((o) => o.clienteId === c.id).length },
  }))
}
