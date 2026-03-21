"use client"

import Link from "next/link"
import { StatusOS } from "@prisma/client"
import { STATUS_LABELS } from "@/lib/utils/status-machine"
import { formatarData } from "@/lib/utils/formatters"
import type { OSListItem } from "@/lib/queries/os"

const STATUS_ORDER: StatusOS[] = [
  "ABERTA",
  "AGUARDANDO_APROVACAO",
  "APROVADA",
  "PRONTA",
  "PAGA",
  "REPROVADA",
]

const COLUMN_STYLES: Record<StatusOS, { border: string; header: string; bg: string; dot: string }> = {
  ABERTA: {
    border: "border-blue-200",
    header: "bg-blue-100 text-blue-800",
    bg: "bg-blue-50",
    dot: "bg-blue-400",
  },
  AGUARDANDO_APROVACAO: {
    border: "border-yellow-200",
    header: "bg-yellow-100 text-yellow-800",
    bg: "bg-yellow-50",
    dot: "bg-yellow-400",
  },
  APROVADA: {
    border: "border-green-200",
    header: "bg-green-100 text-green-800",
    bg: "bg-green-50",
    dot: "bg-green-400",
  },
  PRONTA: {
    border: "border-purple-200",
    header: "bg-purple-100 text-purple-800",
    bg: "bg-purple-50",
    dot: "bg-purple-400",
  },
  PAGA: {
    border: "border-gray-200",
    header: "bg-gray-100 text-gray-600",
    bg: "bg-gray-50",
    dot: "bg-gray-400",
  },
  REPROVADA: {
    border: "border-red-200",
    header: "bg-red-100 text-red-700",
    bg: "bg-red-50",
    dot: "bg-red-400",
  },
}

interface OSKanbanBoardProps {
  items: OSListItem[]
}

export function OSKanbanBoard({ items }: OSKanbanBoardProps) {
  const grouped = items.reduce<Record<StatusOS, OSListItem[]>>(
    (acc, os) => {
      if (!acc[os.status]) acc[os.status] = []
      acc[os.status].push(os)
      return acc
    },
    {} as Record<StatusOS, OSListItem[]>
  )

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUS_ORDER.map((status) => {
        const col = COLUMN_STYLES[status]
        const cards = grouped[status] ?? []

        return (
          <div
            key={status}
            className={`flex-shrink-0 w-64 rounded-lg border ${col.border} flex flex-col`}
          >
            <div className={`px-3 py-2.5 rounded-t-lg ${col.header} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {STATUS_LABELS[status]}
                </span>
              </div>
              <span className="text-xs font-bold tabular-nums">{cards.length}</span>
            </div>

            <div
              className={`flex-1 ${col.bg} rounded-b-lg p-2 space-y-2 overflow-y-auto`}
              style={{ maxHeight: "calc(100vh - 280px)" }}
            >
              {cards.length === 0 && (
                <p className="text-xs text-center text-muted-foreground py-6 opacity-60">
                  Nenhuma OS
                </p>
              )}
              {cards.map((os) => (
                <Link key={os.id} href={`/os/${os.id}`}>
                  <div
                    className={`bg-white rounded-md border ${col.border} p-3 hover:shadow-md transition-shadow cursor-pointer space-y-1.5`}
                  >
                    <p className="font-mono text-xs font-semibold text-slate-700">
                      {os.numero}
                    </p>
                    <p className="text-sm font-medium text-slate-900 leading-tight truncate">
                      {os.cliente.nome}
                    </p>
                    {os.equipamento && (
                      <p className="text-xs text-slate-500 capitalize">
                        {os.equipamento.tipo.replace(/_/g, " ").toLowerCase()}
                      </p>
                    )}
                    <p className="text-xs text-slate-400">{formatarData(os.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
