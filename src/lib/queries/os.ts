import { StatusOS } from "@prisma/client"
import { IS_MOCK } from "@/lib/mock/data"

export type OSListItem = {
  id: string
  numero: string
  status: StatusOS
  prazoPrometido: Date | null
  createdAt: Date
  cliente: { nome: string; documento: string }
  equipamento: { tipo: string; problemaRelatado: string } | null
}

export async function getOSList(params: {
  status?: string
  clienteNome?: string
  page?: number
  all?: boolean
}): Promise<{ items: OSListItem[]; total: number }> {
  if (IS_MOCK) {
    const { mockGetOSList } = await import("@/lib/mock/queries")
    return mockGetOSList(params) as { items: OSListItem[]; total: number }
  }

  const { prisma } = await import("@/lib/prisma")
  const { status, clienteNome, page = 1, all } = params
  const take = 20
  const skip = (page - 1) * take

  const where = {
    ...(status && status !== "TODOS" ? { status: status as StatusOS } : {}),
    ...(clienteNome
      ? { cliente: { nome: { contains: clienteNome, mode: "insensitive" as const } } }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.ordemServico.findMany({
      where,
      include: {
        cliente: { select: { nome: true, documento: true } },
        equipamento: { select: { tipo: true, problemaRelatado: true } },
      },
      orderBy: { createdAt: "desc" },
      ...(all ? {} : { take, skip }),
    }),
    prisma.ordemServico.count({ where }),
  ])

  return { items, total }
}

export async function getOSById(id: string) {
  if (IS_MOCK) {
    const { mockGetOSById } = await import("@/lib/mock/queries")
    return mockGetOSById(id)
  }

  const { prisma } = await import("@/lib/prisma")
  return prisma.ordemServico.findUnique({
    where: { id },
    include: {
      cliente: true,
      equipamento: true,
      orcamento: true,
      avisos: { orderBy: { createdAt: "desc" } },
      pagamento: true,
      usuario: { select: { nome: true } },
    },
  })
}
