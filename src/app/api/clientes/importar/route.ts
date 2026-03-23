import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { getSession } from "@/lib/get-session"
import { clienteSchema } from "@/lib/validations/cliente"
import { IS_MOCK } from "@/lib/mock/data"

type ErroImportacao = {
  linha: number
  nome: string
  motivo: string
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("arquivo") as File | null
  if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const wb = XLSX.read(buffer, { type: "buffer" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
    header: ["nome", "tipo", "documento", "telefone"],
    range: 1, // pula cabeçalho
    defval: "",
  })

  if (rows.length === 0) {
    return NextResponse.json({ error: "Planilha sem dados" }, { status: 400 })
  }

  const erros: ErroImportacao[] = []
  let sucesso = 0

  if (IS_MOCK) {
    // No modo mock apenas valida, não persiste
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const linha = i + 2
      const nome = row.nome?.toString().trim() || ""

      const fd = new FormData()
      fd.set("nome", row.nome?.toString().trim() ?? "")
      fd.set("tipo", row.tipo?.toString().trim().toUpperCase() ?? "")
      fd.set("documento", row.documento?.toString().trim() ?? "")
      fd.set("telefone", row.telefone?.toString().trim() ?? "")

      const parsed = clienteSchema.safeParse(Object.fromEntries(fd))
      if (!parsed.success) {
        const msgs = Object.values(parsed.error.flatten().fieldErrors).flat().join("; ")
        erros.push({ linha, nome, motivo: msgs })
      } else {
        sucesso++
      }
    }
    return NextResponse.json({ total: rows.length, sucesso, erros })
  }

  const { prisma } = await import("@/lib/prisma")

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const linha = i + 2
    const nome = row.nome?.toString().trim() || `(linha ${linha})`

    const fd = new FormData()
    fd.set("nome", row.nome?.toString().trim() ?? "")
    fd.set("tipo", row.tipo?.toString().trim().toUpperCase() ?? "")
    fd.set("documento", row.documento?.toString().trim() ?? "")
    fd.set("telefone", row.telefone?.toString().trim() ?? "")

    const parsed = clienteSchema.safeParse(Object.fromEntries(fd))
    if (!parsed.success) {
      const msgs = Object.values(parsed.error.flatten().fieldErrors).flat().join("; ")
      erros.push({ linha, nome, motivo: msgs })
      continue
    }

    const { documento: docRaw, email: emailRaw, ...restData } = parsed.data
    const documento = docRaw || null

    if (documento) {
      const existing = await prisma.cliente.findUnique({ where: { documento } })
      if (existing) {
        erros.push({ linha, nome, motivo: "Documento já cadastrado" })
        continue
      }
    }

    try {
      await prisma.cliente.create({
        data: { ...restData, documento, email: emailRaw || null },
      })
      sucesso++
    } catch {
      erros.push({ linha, nome, motivo: "Erro ao salvar no banco de dados" })
    }
  }

  return NextResponse.json({ total: rows.length, sucesso, erros })
}
