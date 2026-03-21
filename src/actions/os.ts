"use server"

import { getSession as auth } from "@/lib/get-session"
import { revalidatePath } from "next/cache"
import { IS_MOCK } from "@/lib/mock/data"

export async function abrirOS(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error("Não autenticado")

  if (IS_MOCK) {
    const { mockAbrirOS } = await import("@/lib/mock/actions")
    return mockAbrirOS(formData)
  }

  const { novaOSSchema } = await import("@/lib/validations/os")
  const { prisma } = await import("@/lib/prisma")
  const { gerarNumeroOS } = await import("@/lib/utils/os-number")

  const raw = {
    clienteId: formData.get("clienteId"),
    prazoPrometido: formData.get("prazoPrometido"),
    observacoes: formData.get("observacoes"),
    equipamento: {
      tipo: formData.get("equipamento.tipo"),
      marca: formData.get("equipamento.marca"),
      modelo: formData.get("equipamento.modelo"),
      problemaRelatado: formData.get("equipamento.problemaRelatado"),
    },
  }

  const parsed = novaOSSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const os = await prisma.$transaction(async (tx) => {
    const numero = await gerarNumeroOS(tx)
    return tx.ordemServico.create({
      data: {
        numero,
        clienteId: parsed.data.clienteId,
        usuarioId: session.user.id,
        prazoPrometido: new Date(parsed.data.prazoPrometido),
        observacoes: parsed.data.observacoes || null,
        equipamento: {
          create: {
            tipo: parsed.data.equipamento.tipo,
            marca: parsed.data.equipamento.marca || null,
            modelo: parsed.data.equipamento.modelo || null,
            problemaRelatado: parsed.data.equipamento.problemaRelatado,
          },
        },
      },
    })
  })

  revalidatePath("/os")
  return { success: true, osId: os.id, numero: os.numero }
}

export async function marcarPronta(osId: string, formData: FormData) {
  const session = await auth()
  if (!session) throw new Error("Não autenticado")

  if (IS_MOCK) {
    const { mockMarcarPronta } = await import("@/lib/mock/actions")
    return mockMarcarPronta(osId, formData)
  }

  const canal = formData.get("canal") as string
  const dataAviso = formData.get("dataAviso") as string
  const observacao = formData.get("observacao") as string

  if (!canal || !dataAviso) return { error: "Canal e data do aviso são obrigatórios" }

  const { prisma } = await import("@/lib/prisma")
  const { assertTransicao } = await import("@/lib/utils/status-machine")

  const os = await prisma.ordemServico.findUniqueOrThrow({ where: { id: osId } })
  assertTransicao(os.status, "PRONTA")

  await prisma.$transaction([
    prisma.avisoCliente.create({
      data: {
        osId,
        canal: canal as "LIGACAO" | "MENSAGEM",
        dataAviso: new Date(dataAviso),
        observacao: observacao || null,
      },
    }),
    prisma.ordemServico.update({
      where: { id: osId },
      data: { status: "PRONTA" },
    }),
  ])

  revalidatePath(`/os/${osId}`)
  return { success: true }
}
