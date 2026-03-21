import { getSession as auth } from "@/lib/get-session"
import { NextResponse } from "next/server"
import { IS_MOCK } from "@/lib/mock/data"

export async function GET() {
  const session = await auth()
  if (!session || session.user.perfil !== "GERENTE") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  if (IS_MOCK) {
    return NextResponse.json([
      { id: "u-1", nome: "Gerente Mock", email: "gerente@gseletrotecnica.com.br", perfil: "GERENTE", ativo: true },
      { id: "u-2", nome: "Atendente Mock", email: "atendente@gseletrotecnica.com.br", perfil: "ATENDENTE", ativo: true },
    ])
  }

  const { prisma } = await import("@/lib/prisma")
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, nome: true, email: true, perfil: true, ativo: true },
    orderBy: { nome: "asc" },
  })

  return NextResponse.json(usuarios)
}
