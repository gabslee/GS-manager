"use server"

import { getSession as auth } from "@/lib/get-session"
import { revalidatePath } from "next/cache"
import { IS_MOCK } from "@/lib/mock/data"

export async function registrarPagamento(osId: string, formData: FormData) {
  const session = await auth()
  if (!session) throw new Error("Não autenticado")

  if (IS_MOCK) {
    const { mockRegistrarPagamento } = await import("@/lib/mock/actions")
    return mockRegistrarPagamento(osId, formData)
  }

  const { pagamentoSchema } = await import("@/lib/validations/pagamento")
  const { prisma } = await import("@/lib/prisma")
  const { assertTransicao } = await import("@/lib/utils/status-machine")

  const raw = Object.fromEntries(formData)
  const parsed = pagamentoSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const os = await prisma.ordemServico.findUniqueOrThrow({ where: { id: osId } })
  assertTransicao(os.status, "PAGA")

  await prisma.$transaction([
    prisma.pagamento.create({
      data: {
        osId,
        forma: parsed.data.forma,
        valor: parseFloat(parsed.data.valor),
        observacao: parsed.data.observacao || null,
      },
    }),
    prisma.ordemServico.update({ where: { id: osId }, data: { status: "PAGA" } }),
  ])

  revalidatePath(`/os/${osId}`)
  revalidatePath("/os")
  return { success: true }
}
