import { IS_MOCK } from "@/lib/mock/data"
import { startOfMonth, endOfMonth } from "date-fns"

export async function getDashboardKPIs() {
  if (IS_MOCK) {
    const { mockGetDashboardKPIs } = await import("@/lib/mock/queries")
    return mockGetDashboardKPIs()
  }

  const { prisma } = await import("@/lib/prisma")
  const hoje = new Date()
  const inicioMes = startOfMonth(hoje)
  const fimMes = endOfMonth(hoje)

  const [abertas, aguardando, prontas, pagamentosAgg] = await Promise.all([
    prisma.ordemServico.count({ where: { status: "ABERTA" } }),
    prisma.ordemServico.count({ where: { status: "AGUARDANDO_APROVACAO" } }),
    prisma.ordemServico.count({ where: { status: "PRONTA" } }),
    prisma.pagamento.aggregate({
      _sum: { valor: true },
      where: { dataPagamento: { gte: inicioMes, lte: fimMes } },
    }),
  ])

  return {
    abertas,
    aguardando,
    prontas,
    faturamentoMes: Number(pagamentosAgg._sum.valor ?? 0),
  }
}

export async function getOSPorStatus() {
  if (IS_MOCK) {
    const { mockGetOSPorStatus } = await import("@/lib/mock/queries")
    return mockGetOSPorStatus()
  }

  const { prisma } = await import("@/lib/prisma")
  const grouped = await prisma.ordemServico.groupBy({
    by: ["status"],
    _count: { id: true },
  })
  return grouped.map((g) => ({ status: g.status, total: g._count.id }))
}

export async function getEquipamentosMaisRecorrentes() {
  if (IS_MOCK) {
    const { mockGetEquipamentosMaisRecorrentes } = await import("@/lib/mock/queries")
    return mockGetEquipamentosMaisRecorrentes()
  }

  const { prisma } = await import("@/lib/prisma")
  const grouped = await prisma.equipamento.groupBy({
    by: ["tipo"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  })
  return grouped.map((g) => ({ tipo: g.tipo, total: g._count.id }))
}

export async function getOSEmAndamento() {
  if (IS_MOCK) {
    const { mockGetOSEmAndamento } = await import("@/lib/mock/queries")
    return mockGetOSEmAndamento()
  }

  const { prisma } = await import("@/lib/prisma")
  return prisma.ordemServico.findMany({
    where: { status: { notIn: ["PAGA", "REPROVADA"] } },
    include: { cliente: { select: { nome: true } } },
    orderBy: { prazoPrometido: "asc" },
    take: 20,
  })
}

export async function getFaturamentoPorPeriodo(inicio: Date, fim: Date) {
  if (IS_MOCK) return 980
  const { prisma } = await import("@/lib/prisma")
  const result = await prisma.pagamento.aggregate({
    _sum: { valor: true },
    where: { dataPagamento: { gte: inicio, lte: fim } },
  })
  return Number(result._sum.valor ?? 0)
}
