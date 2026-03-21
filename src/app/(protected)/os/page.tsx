import { getOSList } from "@/lib/queries/os"
import { OSStatusBadge } from "@/components/os/OSStatusBadge"
import { OSKanbanBoard } from "@/components/os/OSKanbanBoard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatarData } from "@/lib/utils/formatters"
import Link from "next/link"
import { Plus, List, LayoutGrid, ChevronRight } from "lucide-react"

interface Props {
  searchParams: { status?: string; cliente?: string; page?: string; view?: string }
}

function buildUrl(params: Record<string, string | undefined>) {
  const url = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v && v !== "TODOS" && v !== "1") url.set(k, v)
  }
  const qs = url.toString()
  return `/os${qs ? `?${qs}` : ""}`
}

export default async function OSListPage({ searchParams }: Props) {
  const isKanban = searchParams.view === "kanban"

  const { items, total } = await getOSList({
    status: isKanban ? undefined : searchParams.status,
    clienteNome: searchParams.cliente,
    page: isKanban ? 1 : Number(searchParams.page ?? 1),
    all: isKanban,
  })

  const tableUrl = buildUrl({ ...searchParams, view: undefined })
  const kanbanUrl = buildUrl({ ...searchParams, view: "kanban", status: undefined, page: undefined })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Ordens de Serviço</h1>
        <div className="flex items-center gap-2">
          {/* View toggle: desktop only */}
          <div className="hidden md:flex rounded-md border overflow-hidden">
            <Link href={tableUrl}>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                  !isKanban
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                Lista
              </button>
            </Link>
            <Link href={kanbanUrl}>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors border-l ${
                  isKanban
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Kanban
              </button>
            </Link>
          </div>

          {/* Nova OS: desktop only (mobile uses bottom nav) */}
          <Link href="/os/nova" className="hidden md:block">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova OS
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-col sm:flex-row gap-2">
        {isKanban && <input type="hidden" name="view" value="kanban" />}
        <Input
          name="cliente"
          placeholder="Buscar por cliente..."
          defaultValue={searchParams.cliente}
          className="h-10 sm:max-w-xs"
        />
        {!isKanban && (
          <Select name="status" defaultValue={searchParams.status ?? "TODOS"}>
            <SelectTrigger className="h-10 sm:w-52">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os status</SelectItem>
              <SelectItem value="ABERTA">Aberta</SelectItem>
              <SelectItem value="AGUARDANDO_APROVACAO">Aguardando Aprovação</SelectItem>
              <SelectItem value="APROVADA">Aprovada</SelectItem>
              <SelectItem value="PRONTA">Pronta</SelectItem>
              <SelectItem value="PAGA">Paga</SelectItem>
              <SelectItem value="REPROVADA">Reprovada</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Button type="submit" variant="secondary" className="h-10">
          Buscar
        </Button>
      </form>

      {isKanban ? (
        <OSKanbanBoard items={items} />
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="md:hidden space-y-2">
            {items.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                Nenhuma OS encontrada
              </div>
            )}
            {items.map((os) => (
              <Link key={os.id} href={`/os/${os.id}`}>
                <div className="bg-white rounded-xl border p-4 active:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-slate-400">{os.numero}</p>
                      <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                        {os.cliente.nome}
                      </p>
                      <p className="text-sm font-medium text-slate-500 capitalize mt-0.5">
                        {os.equipamento
                          ? os.equipamento.tipo.replace(/_/g, " ").toLowerCase()
                          : "—"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <OSStatusBadge status={os.status} />
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatarData(os.createdAt)}
                    {os.prazoPrometido && ` · Prazo: ${formatarData(os.prazoPrometido)}`}
                  </p>
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Abertura</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhuma OS encontrada
                    </TableCell>
                  </TableRow>
                )}
                {items.map((os) => (
                  <TableRow key={os.id}>
                    <TableCell className="font-mono font-medium">{os.numero}</TableCell>
                    <TableCell>{os.cliente.nome}</TableCell>
                    <TableCell className="capitalize text-sm text-muted-foreground">
                      {os.equipamento?.tipo.replace("_", " ").toLowerCase() ?? "—"}
                    </TableCell>
                    <TableCell>
                      <OSStatusBadge status={os.status} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {os.prazoPrometido ? formatarData(os.prazoPrometido) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatarData(os.createdAt)}
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

          {total > 20 && (
            <p className="text-sm text-muted-foreground text-right">
              Mostrando {Math.min(items.length, 20)} de {total} registros
            </p>
          )}
        </>
      )}
    </div>
  )
}
