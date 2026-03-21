"use server"

import { getSession as auth } from "@/lib/get-session"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

const usuarioSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  perfil: z.enum(["ATENDENTE", "GERENTE"]),
})

export async function criarUsuario(formData: FormData) {
  const session = await auth()
  if (!session || session.user.perfil !== "GERENTE") throw new Error("Acesso negado")

  const raw = Object.fromEntries(formData)
  const parsed = usuarioSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { prisma } = await import("@/lib/prisma")
  const existing = await prisma.usuario.findUnique({ where: { email: parsed.data.email } })
  if (existing) return { error: "E-mail já cadastrado" }

  const senha = await bcrypt.hash(parsed.data.senha, 12)
  await prisma.usuario.create({
    data: { ...parsed.data, senha },
  })

  revalidatePath("/admin/usuarios")
  return { success: true }
}

export async function toggleUsuarioAtivo(id: string) {
  const session = await auth()
  if (!session || session.user.perfil !== "GERENTE") throw new Error("Acesso negado")

  const { prisma } = await import("@/lib/prisma")
  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id } })
  await prisma.usuario.update({
    where: { id },
    data: { ativo: !usuario.ativo },
  })

  revalidatePath("/admin/usuarios")
  return { success: true }
}
