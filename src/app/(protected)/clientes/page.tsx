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
import { formatarDocumento, formatarTelefone } from "@/lib/utils/formatters"
import Link from "next/link"
import { Plus, ChevronRight, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { IS_MOCK } from "@/lib/mock/data"

interface Props {
  searchParams: { q?: string }
}

async function getClientes(q?: string) {
  if (IS_MOCK) {
    const { mockGetClientes } = await import("@/lib/mock/queries")
    return mockGetClientes(q)
  }

  const { prisma } = await import("@/lib/prisma")
  return prisma.cliente.findMany({
    where: q
      ? {
          OR: [
            { nome: { contains: q, mode: "insensitive" } },
            { documento: { contains: q.replace(/\D/g, "") } },
          ],
        }
      : undefined,
    orderBy: { nome: "asc" },
    include: { _count: { select: { ordensServico: true } } },
    take: 50,
  })
}

export default async function ClientesPage({ searchParams }: Props) {
  const clientes = await getClientes(searchParams.q)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Clientes</h1>
        <Link href="/clientes/novo" className="hidden md:block">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <form className="flex gap-2">
        <Input
          name="q"
          placeholder="Buscar por nome ou CPF/CNPJ..."
          defaultValue={searchParams.q}
          className="h-10"
        />
        <Button type="submit" variant="secondary" className="h-10">Buscar</Button>
      </form>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-2">
        {clientes.length === 0 && (
          <div className="text-center text-muted-foreground py-12 text-sm">
            Nenhum cliente encontrado
          </div>
        )}
        {clientes.map((c) => (
          <Link key={c.id} href={`/clientes/${c.id}`}>
            <div className="bg-white rounded-xl border p-4 active:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 truncate">{c.nome}</p>
                    <Badge variant="outline" className="text-xs flex-shrink-0">{c.tipo}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono mt-0.5">
                    {formatarDocumento(c.documento, c.tipo as "PF" | "PJ")}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <p className="text-sm text-slate-600">{formatarTelefone(c.telefone)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">{c._count.ordensServico} OS</span>
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
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>OS</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            )}
            {clientes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>
                  <Badge variant="outline">{c.tipo}</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatarDocumento(c.documento, c.tipo as "PF" | "PJ")}
                </TableCell>
                <TableCell className="text-sm">{formatarTelefone(c.telefone)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c._count.ordensServico}
                </TableCell>
                <TableCell>
                  <Link href={`/clientes/${c.id}`}>
                    <Button variant="ghost" size="sm">Ver</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
