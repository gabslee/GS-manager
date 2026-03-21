"use server"

import { getSession as auth } from "@/lib/get-session"
import { revalidatePath } from "next/cache"
import { IS_MOCK } from "@/lib/mock/data"

export async function lancarOrcamento(osId: string, formData: FormData) {
  const session = await auth()
  if (!session) throw new Error("Não autenticado")

  if (IS_MOCK) {
    const { mockLancarOrcamento } = await import("@/lib/mock/actions")
    return mockLancarOrcamento(osId, formData)
  }

  const { orcamentoSchema } = await import("@/lib/validations/orcamento")
  const { prisma } = await import("@/lib/prisma")
  const { assertTransicao } = await import("@/lib/utils/status-machine")

  const raw = Object.fromEntries(formData)
  const parsed = orcamentoSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const os = await prisma.ordemServico.findUniqueOrThrow({ where: { id: osId } })
  assertTransicao(os.status, "AGUARDANDO_APROVACAO")

  await prisma.$transaction([
    prisma.orcamento.create({
      data: {
        osId,
        descricaoManutencao: parsed.data.descricaoManutencao,
        valor: parseFloat(parsed.data.valor),
        canalComunicacao: parsed.data.canalComunicacao,
      },
    }),
    prisma.ordemServico.update({
      where: { id: osId },
      data: { status: "AGUARDANDO_APROVACAO" },
    }),
  ])

  revalidatePath(`/os/${osId}`)
  return { success: true }
}
