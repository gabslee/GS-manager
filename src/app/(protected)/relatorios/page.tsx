import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatarData, formatarMoeda } from "@/lib/utils/formatters"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IS_MOCK } from "@/lib/mock/data"

async function getRelatoriosData() {
  if (IS_MOCK) {
    const { ordens, clientes, equipamentos, pagamentos } = await import("@/lib/mock/data")
    const totalMes = pagamentos.reduce((s, p) => s + p.valor, 0)
    const osPagas = ordens
      .filter((o) => o.status === "PAGA")
      .map((os) => ({
        ...os,
        cliente: clientes.find((c) => c.id === os.clienteId)!,
        pagamento: pagamentos.find((p) => p.osId === os.id) ?? null,
        equipamento: equipamentos.find((e) => e.osId === os.id) ?? null,
      }))
    return {
      faturamentoMes: totalMes,
      countMes: pagamentos.length,
      faturamentoMesAnterior: 1250,
      countMesAnterior: 1,
      osPagas,
    }
  }

  const { prisma } = await import("@/lib/prisma")
  const agora = new Date()
  const inicioMes = startOfMonth(agora)
  const fimMes = endOfMonth(agora)
  const inicioMesAnterior = startOfMonth(subMonths(agora, 1))
  const fimMesAnterior = endOfMonth(subMonths(agora, 1))

  const [pMes, pAnterior, osPagas] = await Promise.all([
    prisma.pagamento.aggregate({
      _sum: { valor: true },
      _count: { id: true },
      where: { dataPagamento: { gte: inicioMes, lte: fimMes } },
    }),
    prisma.pagamento.aggregate({
      _sum: { valor: true },
      _count: { id: true },
      where: { dataPagamento: { gte: inicioMesAnterior, lte: fimMesAnterior } },
    }),
    prisma.ordemServico.findMany({
      where: { status: "PAGA" },
      include: {
        cliente: { select: { nome: true } },
        pagamento: { select: { valor: true, forma: true, dataPagamento: true } },
        equipamento: { select: { tipo: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
  ])

  return {
    faturamentoMes: Number(pMes._sum.valor ?? 0),
    countMes: pMes._count.id,
    faturamentoMesAnterior: Number(pAnterior._sum.valor ?? 0),
    countMesAnterior: pAnterior._count.id,
    osPagas,
  }
}

export default async function RelatoriosPage() {
  const data = await getRelatoriosData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento Mês Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatarMoeda(data.faturamentoMes)}</p>
            <p className="text-sm text-muted-foreground">{data.countMes} OS pagas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento Mês Anterior</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-700">{formatarMoeda(data.faturamentoMesAnterior)}</p>
            <p className="text-sm text-muted-foreground">{data.countMesAnterior} OS pagas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">OS Encerradas Recentemente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data Pgto</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.osPagas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    Nenhuma OS encerrada
                  </TableCell>
                </TableRow>
              )}
              {data.osPagas.map((os) => (
                <TableRow key={os.id}>
                  <TableCell className="font-mono font-medium">{os.numero}</TableCell>
                  <TableCell>{os.cliente.nome}</TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">
                    {os.equipamento?.tipo.replace("_", " ").toLowerCase() ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">{os.pagamento?.forma ?? "—"}</TableCell>
                  <TableCell className="text-sm font-medium">
                    {os.pagamento ? formatarMoeda(Number(os.pagamento.valor)) : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {os.pagamento ? formatarData(os.pagamento.dataPagamento) : "—"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/os/${os.id}`}>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
