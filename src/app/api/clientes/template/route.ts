import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { getSession } from "@/lib/get-session"

export async function GET() {
  const session = await getSession()
  if (!session) return new NextResponse("Não autenticado", { status: 401 })

  const wb = XLSX.utils.book_new()

  const dados = [
    ["Nome", "Tipo", "Documento", "Telefone"],
    ["Maria Silva", "PF", "123.456.789-09", "(11) 91234-5678"],
    ["Empresa XYZ Ltda", "PJ", "12.345.678/0001-90", "(11) 3456-7890"],
  ]

  const ws = XLSX.utils.aoa_to_sheet(dados)

  // Largura das colunas
  ws["!cols"] = [{ wch: 30 }, { wch: 8 }, { wch: 20 }, { wch: 18 }]

  XLSX.utils.book_append_sheet(wb, ws, "Clientes")

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="modelo-clientes.xlsx"',
    },
  })
}
