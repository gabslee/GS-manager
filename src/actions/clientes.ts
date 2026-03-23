"use server"

import { getSession as auth } from "@/lib/get-session"
import { clienteSchema } from "@/lib/validations/cliente"
import { revalidatePath } from "next/cache"
import { IS_MOCK } from "@/lib/mock/data"

export async function criarCliente(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error("Não autenticado")

  if (IS_MOCK) {
    const { mockCriarCliente } = await import("@/lib/mock/actions")
    return mockCriarCliente(formData)
  }

  const raw = Object.fromEntries(formData)
  const parsed = clienteSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { prisma } = await import("@/lib/prisma")
  const { documento: docRaw, email: emailRaw, ...restData } = parsed.data
  const documento = docRaw || null
  const email = emailRaw || null

  if (documento) {
    const existing = await prisma.cliente.findUnique({ where: { documento } })
    if (existing) return { error: "Documento já cadastrado" }
  }

  const cliente = await prisma.cliente.create({
    data: { ...restData, documento, email },
  })

  revalidatePath("/clientes")
  return {
    success: true,
    clienteId: cliente.id,
    nome: cliente.nome,
    telefone: cliente.telefone,
    tipo: cliente.tipo,
    documento: cliente.documento,
  }
}

export async function atualizarCliente(id: string, formData: FormData) {
  const session = await auth()
  if (!session) throw new Error("Não autenticado")

  if (IS_MOCK) {
    const { mockAtualizarCliente } = await import("@/lib/mock/actions")
    return mockAtualizarCliente(id, formData)
  }

  const raw = Object.fromEntries(formData)
  const parsed = clienteSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { prisma } = await import("@/lib/prisma")
  const { documento: docRaw, email: emailRaw, ...restData } = parsed.data
  const documento = docRaw || null
  const email = emailRaw || null
  await prisma.cliente.update({
    where: { id },
    data: { ...restData, documento, email },
  })

  revalidatePath(`/clientes/${id}`)
  revalidatePath("/clientes")
  return { success: true }
}

export async function deletarCliente(id: string) {
  const session = await auth()
  if (!session || session.user.perfil !== "GERENTE") throw new Error("Acesso negado")

  if (IS_MOCK) {
    const { mockDeletarCliente } = await import("@/lib/mock/actions")
    return mockDeletarCliente(id)
  }

  const { prisma } = await import("@/lib/prisma")
  const count = await prisma.ordemServico.count({ where: { clienteId: id } })
  if (count > 0) return { error: `Cliente possui ${count} ordem(ns) de serviço e não pode ser excluído` }

  await prisma.cliente.delete({ where: { id } })
  revalidatePath("/clientes")
  return { success: true }
}

export async function buscarClientes(query: string) {
  const session = await auth()
  if (!session) return []

  if (IS_MOCK) {
    const { mockBuscarClientes } = await import("@/lib/mock/queries")
    return mockBuscarClientes(query)
  }

  const { prisma } = await import("@/lib/prisma")
  const docQuery = query.replace(/\D/g, "")
  return prisma.cliente.findMany({
    where: {
      OR: [
        { nome: { contains: query, mode: "insensitive" } },
        ...(docQuery.length > 0 ? [{ documento: { contains: docQuery } }] : []),
      ],
    },
    orderBy: { nome: "asc" },
    take: 10,
  })
}
