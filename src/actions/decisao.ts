"use server"

import { getSession as auth } from "@/lib/get-session"
import { revalidatePath } from "next/cache"
import { IS_MOCK } from "@/lib/mock/data"

export async function registrarDecisao(osId: string, formData: FormData) {
  const session = await auth()
  if (!session) throw new Error("Não autenticado")

  if (IS_MOCK) {
    const { mockRegistrarDecisao } = await import("@/lib/mock/actions")
    return mockRegistrarDecisao(osId, formData)
  }

  const { decisaoSchema } = await import("@/lib/validations/orcamento")
  const { prisma } = await import("@/lib/prisma")
  const { assertTransicao } = await import("@/lib/utils/status-machine")

  const raw = Object.fromEntries(formData)
  const parsed = decisaoSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const aprovado = parsed.data.aprovado === "true"
  const novoStatus = aprovado ? "APROVADA" : "REPROVADA"

  const os = await prisma.ordemServico.findUniqueOrThrow({ where: { id: osId } })
  assertTransicao(os.status, novoStatus as "APROVADA" | "REPROVADA")

  await prisma.$transaction([
    prisma.orcamento.update({
      where: { osId },
      data: { aprovado, dataDecisao: new Date(parsed.data.dataDecisao) },
    }),
    prisma.ordemServico.update({
      where: { id: osId },
      data: { status: novoStatus as "APROVADA" | "REPROVADA" },
    }),
  ])

  revalidatePath(`/os/${osId}`)
  return { success: true }
}
