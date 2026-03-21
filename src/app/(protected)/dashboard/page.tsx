import {
  getDashboardKPIs,
  getOSPorStatus,
  getEquipamentosMaisRecorrentes,
  getOSEmAndamento,
} from "@/lib/queries/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OSStatusBadge } from "@/components/os/OSStatusBadge"
import { formatarMoeda, formatarData } from "@/lib/utils/formatters"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { differenceInDays } from "date-fns"

const TIPO_LABEL: Record<string, string> = {
  MAQUINA: "Máquina",
  MOTOR: "Motor",
  BOMBA_SUBMERSA: "Bomba Submersa",
  OUTROS: "Outros",
}

export default async function DashboardPage() {
  const [kpis, porStatus, equipamentos, emAndamento] = await Promise.all([
    getDashboardKPIs(),
    getOSPorStatus(),
    getEquipamentosMaisRecorrentes(),
    getOSEmAndamento(),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">OS Abertas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{kpis.abertas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{kpis.aguardando}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prontas p/ Retirada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{kpis.prontas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatarMoeda(kpis.faturamentoMes)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OS por Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">OS por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {porStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <OSStatusBadge status={item.status} />
                  <span className="font-bold">{item.total}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipamentos Mais Frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {equipamentos.map((item) => (
                <div key={item.tipo} className="flex items-center justify-between">
                  <span className="text-sm">{TIPO_LABEL[item.tipo] ?? item.tipo}</span>
                  <span className="font-bold">{item.total}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OS em Andamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">OS em Andamento</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {emAndamento.length === 0 && (
            <p className="text-center text-muted-foreground py-6 text-sm">Nenhuma OS em andamento</p>
          )}

          {/* Mobile: cards */}
          <div className="md:hidden divide-y">
            {emAndamento.map((os) => {
              const diasAberto = differenceInDays(new Date(), os.createdAt)
              return (
                <Link key={os.id} href={`/os/${os.id}`}>
                  <div className="flex items-center justify-between px-4 py-3 active:bg-slate-50">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs text-slate-400">{os.numero}</p>
                        <OSStatusBadge status={os.status} />
                      </div>
                      <p className="text-sm font-medium truncate mt-0.5">{os.cliente.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        Prazo: {os.prazoPrometido ? formatarData(os.prazoPrometido) : "—"}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ml-3 flex-shrink-0 ${diasAberto > 14 ? "text-red-600" : "text-slate-500"}`}>
                      {diasAberto}d
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Dias em Aberto</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emAndamento.map((os) => {
                  const diasAberto = differenceInDays(new Date(), os.createdAt)
                  return (
                    <TableRow key={os.id}>
                      <TableCell className="font-mono font-medium">{os.numero}</TableCell>
                      <TableCell>{os.cliente.nome}</TableCell>
                      <TableCell><OSStatusBadge status={os.status} /></TableCell>
                      <TableCell className="text-sm">
                        {os.prazoPrometido ? formatarData(os.prazoPrometido) : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className={diasAberto > 14 ? "text-red-600 font-medium" : ""}>
                          {diasAberto}d
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/os/${os.id}`}>
                          <Button variant="ghost" size="sm">Ver</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
