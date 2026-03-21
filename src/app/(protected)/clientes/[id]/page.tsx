import { notFound } from "next/navigation"
import { OSStatusBadge } from "@/components/os/OSStatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  formatarDocumento,
  formatarTelefone,
  formatarData,
  formatarMoeda,
} from "@/lib/utils/formatters"
import Link from "next/link"
import { ArrowLeft, Plus, Phone, Mail, ChevronRight } from "lucide-react"
import { IS_MOCK } from "@/lib/mock/data"

async function getClienteDetail(id: string) {
  if (IS_MOCK) {
    const { mockGetClienteById } = await import("@/lib/mock/queries")
    return mockGetClienteById(id)
  }

  const { prisma } = await import("@/lib/prisma")
  return prisma.cliente.findUnique({
    where: { id },
    include: {
      ordensServico: {
        include: {
          equipamento: { select: { tipo: true } },
          pagamento: { select: { valor: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
  const cliente = await getClienteDetail(params.id)
  if (!cliente) notFound()

  return (
    <div className="max-w-3xl space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/clientes">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:h-auto md:w-auto md:px-3 flex-shrink-0">
            <ArrowLeft className="h-5 w-5 md:h-4 md:w-4" />
            <span className="hidden md:inline ml-1">Voltar</span>
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold truncate">{cliente.nome}</h1>
            <Badge variant="outline" className="flex-shrink-0">{cliente.tipo}</Badge>
          </div>
          <p className="text-sm text-muted-foreground font-mono mt-0.5">
            {formatarDocumento(cliente.documento, cliente.tipo as "PF" | "PJ")}
          </p>
        </div>
      </div>

      {/* Contato */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <p className="text-sm font-medium">{formatarTelefone(cliente.telefone)}</p>
          </div>
          {cliente.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{cliente.email}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* OS do cliente */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">
            Ordens de Serviço{" "}
            <span className="text-muted-foreground font-normal text-sm">
              ({cliente.ordensServico.length})
            </span>
          </h2>
          <Link href="/os/nova">
            <Button size="sm" className="h-8">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Nova OS
            </Button>
          </Link>
        </div>

        {cliente.ordensServico.length === 0 && (
          <div className="text-center text-muted-foreground py-10 text-sm bg-white rounded-xl border">
            Nenhuma OS encontrada
          </div>
        )}

        {/* Mobile: cards */}
        <div className="md:hidden space-y-2">
          {cliente.ordensServico.map((os) => (
            <Link key={os.id} href={`/os/${os.id}`}>
              <div className="bg-white rounded-xl border p-4 active:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-slate-400">{os.numero}</p>
                    <p className="text-sm font-semibold text-slate-900 capitalize mt-0.5">
                      {os.equipamento?.tipo.replace(/_/g, " ").toLowerCase() ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatarData(os.createdAt)}
                      {os.pagamento && (
                        <> · <span className="font-medium text-slate-700">{formatarMoeda(Number(os.pagamento.valor))}</span></>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <OSStatusBadge status={os.status} />
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cliente.ordensServico.map((os) => (
                <TableRow key={os.id}>
                  <TableCell className="font-mono font-medium">{os.numero}</TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">
                    {os.equipamento?.tipo.replace("_", " ").toLowerCase() ?? "—"}
                  </TableCell>
                  <TableCell>
                    <OSStatusBadge status={os.status} />
                  </TableCell>
                  <TableCell className="text-sm">{formatarData(os.createdAt)}</TableCell>
                  <TableCell className="text-sm">
                    {os.pagamento ? formatarMoeda(Number(os.pagamento.valor)) : "—"}
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
        </div>
      </div>
    </div>
  )
}
